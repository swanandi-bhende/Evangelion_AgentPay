'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const quickExamples = [
    "Send 10 TPYUSD to 0.0.1234567",
    "Help me understand how this works",
    "What can you do?",
    "Send 5 TPYUSD to recipient"
  ];

  return (
    <div className="chat-input-container">
      {/* Quick Example Buttons */}
      {!isLoading && (
        <div className="quick-examples">
          <p>Try saying:</p>
          <div className="example-buttons">
            {quickExamples.map((example, index) => (
              <button
                key={index}
                onClick={() => setMessage(example)}
                className="example-button"
                type="button"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (e.g., 'Send 10 TPYUSD to 0.0.1234567')"
            disabled={isLoading}
            rows={1}
            className="message-input"
          />
          <button 
            type="submit" 
            disabled={!message.trim() || isLoading}
            className="send-button primary-button"
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </form>

      <div className="chat-footer">
        <p className="tech-font">
          💡 Powered by Hedera Testnet • All transactions are test transactions
        </p>
      </div>
    </div>
  );
}