'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { apiService } from '@/services/api';
import { useTransactions } from '@/contexts/TransactionContext';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addTransactionFromAgent } = useTransactions();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await apiService.sendChatMessage({ message: inputMessage });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data.response,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      // Add transaction to context if it was a successful transfer
      if (response.data.transactionId && response.data.response.includes('Success')) {
        addTransactionFromAgent(response.data.response, response.data.transactionId);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (content: string) => {
    // Convert transaction IDs to clickable links
    const transactionIdMatch = content.match(/(0\.0\.\d+@\d+\.\d+)/);
    if (transactionIdMatch) {
      const transactionId = transactionIdMatch[1];
      const hashScanUrl = `https://hashscan.io/testnet/transaction/${transactionId}`;
      return content.replace(
        transactionId,
        `<a href="${hashScanUrl}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline font-mono text-sm hover:text-indigo-800">${transactionId}</a>`
      );
    }
    return content;
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Chat Header */}
      <div className="bg-linear-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <Bot className="h-6 w-6" />
          <div>
            <h3 className="font-semibold">AgentPay AI Assistant</h3>
            <p className="text-indigo-100 text-sm">Send payments using natural language</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-600 mt-8">
            <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="font-medium mb-2">Welcome to AgentPay AI</p>
            <p className="text-sm">Try saying:</p>
            <div className="mt-3 space-y-1 text-xs">
              <p className="bg-white p-2 rounded border border-gray-200">Send 10 TPYUSD to 0.0.1234567</p>
              <p className="bg-white p-2 rounded border border-gray-200">Transfer 5 tokens to 0.0.1234567</p>
              <p className="bg-white p-2 rounded border border-gray-200">Please send 15 TPYUSD to account 0.0.1234567</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex max-w-xs lg:max-w-md ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  } rounded-lg p-3 shadow-sm`}
                >
                  <div className="flex items-start space-x-2">
                    {message.role === 'assistant' && (
                      <Bot className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div 
                        className="text-sm"
                        dangerouslySetInnerHTML={{ 
                          __html: formatMessage(message.content) 
                        }}
                      />
                      <p
                        className={`text-xs mt-1 ${
                          message.role === 'user'
                            ? 'text-indigo-200'
                            : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <User className="h-5 w-5 text-indigo-200 shrink-0 mt-0.5" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-indigo-500" />
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a transfer command... (e.g., Send 10 TPYUSD to 0.0.1234567)"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !inputMessage.trim()}
            className="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm font-medium transition-colors duration-200"
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2 text-center">
          Use natural language to send payments. Example commands shown above.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;