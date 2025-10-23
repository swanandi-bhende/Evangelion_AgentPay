'use client';

interface ChatHeaderProps {
  onClearChat: () => void;
}

export default function ChatHeader({ onClearChat }: ChatHeaderProps) {
  return (
    <div className="chat-header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo-icon">💸</div>
          <div className="logo-text">
            <h1 className="tech-font">AgentPay</h1>
            <p>AI-Powered Cross-Border Payments</p>
          </div>
        </div>
        <button 
          onClick={onClearChat}
          className="clear-chat-button"
          title="Clear chat history"
        >
          ↻ Clear Chat
        </button>
      </div>
    </div>
  );
}