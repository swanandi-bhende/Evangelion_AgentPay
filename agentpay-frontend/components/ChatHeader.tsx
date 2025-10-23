import React from 'react';

interface ChatHeaderProps {
  onClearChat: () => void;
}

export default function ChatHeader({ onClearChat }: ChatHeaderProps) {
  return (
    <header className="chat-header">
      <h2>AgentPay Chat</h2>
      <button onClick={onClearChat} aria-label="Clear chat">
        Clear Chat
      </button>
    </header>
  );
}
