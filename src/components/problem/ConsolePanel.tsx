'use client';

import { useState, useEffect } from 'react';
import { TestCase } from '@/data/problems';
import { RunResult, formatValue } from '@/lib/codeRunner';
import styles from './Problem.module.css';

interface ConsolePanelProps {
  testCases: TestCase[];
  runResult: RunResult | null;
  isRunning: boolean;
}

export function ConsolePanel({ testCases, runResult, isRunning }: ConsolePanelProps) {
  const [activeTab, setActiveTab] = useState<'testcase' | 'output'>('testcase');
  const [selectedCase, setSelectedCase] = useState(0);

  // Auto-switch to output tab when results come in
  useEffect(() => {
    if (runResult) {
      setActiveTab('output');
    }
  }, [runResult]);

  const currentTestCase = testCases[selectedCase];
  const currentResult = runResult?.results.find(r => r.caseId === currentTestCase?.id);

  // Calculate pass count
  const passedCount = runResult?.results.filter(r => r.passed).length ?? 0;
  const totalCount = testCases.length;

  // Determine status type from summary
  const getStatusType = () => {
    if (!runResult) return null;
    if (runResult.allPassed) return 'accepted';
    if (runResult.summary.includes('Runtime Error') || runResult.summary.includes('Error')) {
      return 'error';
    }
    return 'wrong';
  };

  const statusType = getStatusType();

  return (
    <div className={styles.consolePanel}>
      {/* Tabs */}
      <div className={styles.consoleTabs}>
        <button
          className={`${styles.consoleTab} ${activeTab === 'testcase' ? styles.consoleTabActive : ''}`}
          onClick={() => setActiveTab('testcase')}
        >
          Test Case
        </button>
        <button
          className={`${styles.consoleTab} ${activeTab === 'output' ? styles.consoleTabActive : ''}`}
          onClick={() => setActiveTab('output')}
        >
          Output
        </button>
      </div>

      {/* Content Area */}
      <div className={styles.consoleContent}>
        {isRunning ? (
          <div className={styles.outputRunning}>
            <div className={styles.spinner}></div>
            Running your code...
          </div>
        ) : (
          <>
            {/* Status Header - Only show on Output tab when we have results */}
            {activeTab === 'output' && runResult && (
              <div className={styles.statusHeader}>
                <span className={`${styles.statusType} ${
                  statusType === 'accepted' ? styles.statusAccepted :
                  statusType === 'error' ? styles.statusError :
                  styles.statusWrong
                }`}>
                  {runResult.summary}
                </span>
                <span className={styles.passCount}>
                  Passed test cases {passedCount}/{totalCount}
                </span>
              </div>
            )}

            {/* Test Case Selector - Show on both tabs */}
            <div className={styles.testCaseSelector}>
              {testCases.map((tc, idx) => {
                const result = runResult?.results.find(r => r.caseId === tc.id);
                const statusClass = result
                  ? result.passed
                    ? styles.testCasePassed
                    : styles.testCaseFailed
                  : '';

                return (
                  <button
                    key={tc.id}
                    className={`${styles.testCaseBtn} ${selectedCase === idx ? styles.testCaseBtnActive : ''} ${statusClass}`}
                    onClick={() => setSelectedCase(idx)}
                  >
                    Case {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Test Case Tab Content */}
            {activeTab === 'testcase' && currentTestCase && (
              <div className={styles.testCaseDetails}>
                {Object.entries(currentTestCase.inputs).map(([key, value]) => (
                  <div key={key} className={styles.detailSection}>
                    <div className={styles.detailLabel}>{key} =</div>
                    <div className={styles.detailValue}>
                      {formatValue(value)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Output Tab Content */}
            {activeTab === 'output' && (
              <>
                {runResult ? (
                  <div className={styles.outputDetails}>
                    {/* Error Section - Show if there's an error */}
                    {currentResult?.error && (
                      <div className={styles.detailSection}>
                        <div className={styles.detailLabel}>Error</div>
                        <div className={styles.errorBox}>
                          {currentResult.error}
                        </div>
                      </div>
                    )}

                    {/* Input Section */}
                    {currentTestCase && (
                      <div className={styles.detailSection}>
                        <div className={styles.detailLabel}>Input:</div>
                        <div className={styles.detailValue}>
                          {Object.entries(currentTestCase.inputs).map(([key, value]) => (
                            <div key={key}>{key} = {formatValue(value)}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stdout Section - Show user's print statements */}
                    {currentResult?.stdout && (
                      <div className={styles.detailSection}>
                        <div className={styles.detailLabel}>Stdout:</div>
                        <pre className={styles.stdoutBox}>
                          {currentResult.stdout}
                        </pre>
                      </div>
                    )}

                    {/* Expected Output Section */}
                    {currentResult && (
                      <div className={styles.detailSection}>
                        <div className={styles.detailLabel}>Expected Output:</div>
                        <div className={styles.detailValue}>
                          {currentResult.expectedOutput}
                        </div>
                      </div>
                    )}

                    {/* Your Output Section */}
                    {currentResult && (
                      <div className={styles.detailSection}>
                        <div className={styles.detailLabel}>Your Output:</div>
                        <div className={`${styles.detailValue} ${currentResult.passed ? styles.outputCorrect : styles.outputWrong}`}>
                          {currentResult.actualOutput}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.outputEmpty}>
                    Click &quot;Run&quot; to execute your code against the test cases
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
