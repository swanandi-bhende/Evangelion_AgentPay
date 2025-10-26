const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface TransferRequest {
  amount: number;
  recipient: string;
}

export interface TransferResponse {
  status: string;
  message: string;
  data: {
    transactionId: string;
    status: string;
  };
}

export interface AgentChatRequest {
  message: string;
}

export interface AgentChatResponse {
  status: string;
  data: {
    response: string;
    transactionId?: string;
  };
}

export const apiService = {
  async transferFunds(transferData: TransferRequest): Promise<TransferResponse> {
    const response = await fetch(`${API_BASE_URL}/api/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transferData),
    });

    if (!response.ok) {
      throw new Error('Transfer failed');
    }

    return response.json();
  },

  async sendChatMessage(messageData: AgentChatRequest): Promise<AgentChatResponse> {
    const response = await fetch(`${API_BASE_URL}/api/agent/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      throw new Error('Chat request failed');
    }

    return response.json();
  },

  async getHealth() {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.json();
  },
};