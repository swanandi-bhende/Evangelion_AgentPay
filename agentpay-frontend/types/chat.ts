export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isProcessing?: boolean;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  agentType?: 'ai' | 'simple';
  error?: string;
}