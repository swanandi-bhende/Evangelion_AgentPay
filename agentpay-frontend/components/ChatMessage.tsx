import React from 'react';
import { Message } from '../types/chat';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={`chat-message ${message.role}`}>
      <p>
        {message.isProcessing ? (
          <em>...</em>
        ) : (
          <span dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br/>') }} />
        )}
      </p>
      <small>{message.timestamp.toLocaleTimeString()}</small>
    </div>
  );
}
