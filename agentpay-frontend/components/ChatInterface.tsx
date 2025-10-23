'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, ChatResponse } from '../types/chat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ChatHeader from './ChatHeader';

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      content: `🤖 Welcome to **AgentPay** - Your AI-Powered Remittance Assistant!

I can help you send TPYUSD tokens on the Hedera Testnet. Here's what I can do:

• Send payments using natural language
• Provide transaction details and verification links
• Answer questions about cross-border payments

Try saying: "Send 10 TPYUSD to 0.0.1234567" or type "help" for more options.`,
      role: 'assistant',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Add temporary assistant message
    const tempAssistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isProcessing: true
    };

    setMessages(prev => [...prev, tempAssistantMessage]);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content.trim() }),
      });

      const data: ChatResponse = await response.json();

      if (data.success) {
        // Replace temporary message with actual response
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempAssistantMessage.id 
              ? {
                  ...msg,
                  content: data.response,
                  isProcessing: false
                }
              : msg
          )
        );
      } else {
        // Show error message
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempAssistantMessage.id 
              ? {
                  ...msg,
                  content: `❌ Error: ${data.error || 'Failed to send message'}`,
                  isProcessing: false
                }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempAssistantMessage.id 
            ? {
                ...msg,
                content: '❌ Network error: Could not connect to the server. Please make sure the backend is running on port 3001.',
                isProcessing: false
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    // Re-add welcome message after a delay
    setTimeout(() => {
      const welcomeMessage: Message = {
        id: '1',
        content: `🤖 Welcome to **AgentPay** - Your AI-Powered Remittance Assistant!

I can help you send TPYUSD tokens on the Hedera Testnet. Here's what I can do:

• Send payments using natural language
• Provide transaction details and verification links
• Answer questions about cross-border payments

Try saying: "Send 10 TPYUSD to 0.0.1234567" or type "help" for more options.`,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }, 100);
  };

  return (
    <div className="chat-interface">
      <ChatHeader onClearChat={clearChat} />
      
      <div className="messages-container">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
    </div>
  );
}