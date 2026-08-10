'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './Problem.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIInterviewerPanelProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

export function AIInterviewerPanel({ messages, isLoading, onSendMessage }: AIInterviewerPanelProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const results = Array.from(event.results);
          const transcriptText = results
            .map(result => result[0].transcript)
            .join('');
          setTranscript(transcriptText);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const startRecording = useCallback(() => {
    if (recognitionRef.current && !isLoading) {
      setTranscript('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  }, [isLoading]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);

      // Send the transcript if there's content
      if (transcript.trim()) {
        onSendMessage(transcript.trim());
        setTranscript('');
      }
    }
  }, [isRecording, transcript, onSendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className={styles.aiPanel}>
        <div className={styles.aiPanelEmpty}>
          <div className={styles.aiAvatar}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
          </div>
          <p>Submit your solution to start the interview</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.aiPanel}>
      <div className={styles.chatContainer}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`${styles.chatMessage} ${msg.role === 'user' ? styles.chatMessageUser : styles.chatMessageAi}`}
          >
            {msg.role === 'assistant' && (
              <div className={styles.aiAvatarSmall}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4"/>
                  <path d="M12 8h.01"/>
                </svg>
              </div>
            )}
            <div className={`${styles.chatBubble} ${msg.role === 'user' ? styles.chatBubbleUser : styles.chatBubbleAi}`}>
              {msg.role === 'assistant' ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.chatMessage} ${styles.chatMessageAi}`}>
            <div className={styles.aiAvatarSmall}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
            </div>
            <div className={`${styles.chatBubble} ${styles.chatBubbleAi}`}>
              <div className={styles.aiLoading}>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length > 0 && (
        <form onSubmit={handleSubmit} className={styles.chatInputForm}>
          {/* Voice button - push to talk */}
          {speechSupported && (
            <button
              type="button"
              className={`${styles.voiceBtn} ${isRecording ? styles.voiceBtnActive : ''}`}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={isLoading}
              title="Hold to speak"
            >
              {isRecording ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              )}
            </button>
          )}

          <input
            type="text"
            value={isRecording ? transcript : input}
            onChange={(e) => !isRecording && setInput(e.target.value)}
            placeholder={isRecording ? 'Listening...' : 'Type or hold 🎤 to speak...'}
            className={`${styles.chatInput} ${isRecording ? styles.chatInputRecording : ''}`}
            disabled={isLoading || isRecording}
          />
          <button
            type="submit"
            className={styles.chatSendBtn}
            disabled={!input.trim() || isLoading || isRecording}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
            </svg>
          </button>
        </form>
      )}
    </div>
  );
}
