'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { ProblemPanel, CodeEditor, AIInterviewerPanel, ConsolePanel } from '@/components/problem';
import { problems } from '@/data/problems';
import { runCode, RunResult } from '@/lib/codeRunner';
import styles from '@/components/problem/Problem.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ProblemPage() {
  const problem = problems[0]; // Default to first problem
  const [code, setCode] = useState(problem.starterCode);
  const [lastSentCode, setLastSentCode] = useState(problem.starterCode);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showConsole, setShowConsole] = useState(true);
  const [hasRunTests, setHasRunTests] = useState(false);

  const handleRun = async () => {
    setShowConsole(true); // Switch to Console panel
    setIsRunning(true);
    setRunResult(null);

    try {
      const result = await runCode(
        code,
        problem.title,
        problem.functionName,
        problem.testCases,
        'python'
      );
      setRunResult(result);
    } catch (error) {
      console.error('Run error:', error);
      setRunResult({
        results: [],
        summary: error instanceof Error ? error.message : 'An error occurred while running your code.',
        allPassed: false
      });
    } finally {
      setIsRunning(false);
      setHasRunTests(true); // Enable Submit button after running tests
    }
  };

  const callAI = async (conversationHistory: Message[]) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle: problem.title,
          conversationHistory,
        }),
      });

      const data = await response.json();
      const aiMessage: Message = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, there was an error. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    setShowConsole(false); // Switch to AI Chat panel

    // AI sends opening message asking user to explain their approach
    const openingMessage: Message = {
      role: 'assistant',
      content: "I see you've submitted your solution. Before I ask questions, can you walk me through your approach? What's your overall strategy and why did you choose it?"
    };
    setMessages([openingMessage]);
    // Don't call AI yet - wait for user to explain first
  };

  const handleSendMessage = async (userMessage: string) => {
    let messageContent = userMessage;

    // If this is the first message after submit (user explaining their approach)
    // Include the code they're explaining
    const isFirstExplanation = messages.length === 1 && messages[0].role === 'assistant';

    if (isFirstExplanation) {
      messageContent = `Here's my solution:\n\`\`\`python\n${code}\n\`\`\`\n\nMy approach: ${userMessage}`;
      setLastSentCode(code);
    } else if (code !== lastSentCode) {
      // Code changed since last message - include update
      messageContent = `[I've updated my code]\n\`\`\`python\n${code}\n\`\`\`\n\n${userMessage}`;
      setLastSentCode(code);
    }

    const newUserMessage: Message = { role: 'user', content: messageContent };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    await callAI(updatedMessages);
  };

  return (
    <>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>CI</div>
          CodeInterview
        </Link>
        <div className={styles.navLinks}>
          <Link href="/problem" className={`${styles.navLink} ${styles.navLinkActive}`}>
            Problems
          </Link>
          <Link href="#" className={styles.navLink}>Progress</Link>
          <Link href="#" className={styles.navLink}>Patterns</Link>
        </div>
        <button className={styles.btn} style={{ padding: '8px 20px' }}>
          Sign In
        </button>
      </nav>

      {/* Main Layout */}
      <div className={styles.layout}>
        {/* Left Panel - Problem Description */}
        <ProblemPanel problem={problem} />

        {/* Right Panel - Editor + Console/AI */}
        <div className={styles.editorPanel}>
          <PanelGroup orientation="vertical">
            {/* Code Editor - default 50%, min 25% */}
            <Panel defaultSize={50} minSize={25}>
              <CodeEditor
                initialCode={problem.starterCode}
                onChange={setCode}
              />
            </Panel>

            <PanelResizeHandle className={styles.resizeHandle} />

            {/* Console/AI Panel - default 50%, min 20% */}
            <Panel defaultSize={50} minSize={20}>
              {showConsole ? (
                <ConsolePanel
                  testCases={problem.testCases}
                  runResult={runResult}
                  isRunning={isRunning}
                />
              ) : (
                <AIInterviewerPanel
                  messages={messages}
                  isLoading={isLoading}
                  onSendMessage={handleSendMessage}
                />
              )}
            </Panel>
          </PanelGroup>

          {/* Footer Actions - Always visible */}
          <div className={styles.footer}>
            <button
              className={styles.consoleToggle}
              onClick={() => setShowConsole(!showConsole)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="4 17 10 11 4 5"/>
                <line x1="12" y1="19" x2="20" y2="19"/>
              </svg>
              {showConsole ? 'AI Chat' : 'Console'}
            </button>
            <div className={styles.actionButtons}>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={handleRun}
                disabled={isRunning}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                {isRunning ? 'Tracing...' : 'Run'}
              </button>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleSubmit}
                disabled={isLoading || !hasRunTests}
                title={!hasRunTests ? 'Run your code first to check test cases' : undefined}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
                </svg>
                {isLoading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
