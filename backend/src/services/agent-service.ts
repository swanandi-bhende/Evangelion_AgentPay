import { GoogleGenerativeAI } from '@google/generative-ai';
import HederaService from './hedera-service';
import dotenv from 'dotenv';

dotenv.config();

interface TransferIntent {
  intent: 'transfer';
  amount: number;
  recipient: string;
  token: string;
}

interface UnknownIntent {
  intent: 'unknown';
  message: string;
}

type ParsedIntent = TransferIntent | UnknownIntent;

class AgentService {
  private genAI: GoogleGenerativeAI;
  private hederaService: HederaService;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.hederaService = new HederaService();
  }

  async processMessage(userMessage: string): Promise<{ response: string; transactionId?: string }> {
    try {
      // Parse the user's message to extract intent and parameters
      const parsedIntent = await this.parseUserIntent(userMessage);
      
      if (parsedIntent.intent === 'transfer') {
        return await this.handleTransferIntent(parsedIntent);
      } else {
        return {
          response: "I'm here to help you with transfers. Try saying something like: 'Send 10 TPYUSD to 0.0.1234567'"
        };
      }
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        response: "I encountered an error processing your request. Please try again."
      };
    }
  }

  private async parseUserIntent(message: string): Promise<ParsedIntent> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
    Analyze the following user message and extract the intent and parameters for a cryptocurrency transfer.
    The message is: "${message}"

    Extract the following information:
    - Intent: Should be "transfer" if the user wants to send cryptocurrency, otherwise "unknown"
    - Amount: The numerical amount to transfer
    - Recipient: The Hedera account ID (format: 0.0.XXXXXXX)
    - Token: The cryptocurrency token (default to "TPYUSD")

    If the intent is "transfer", respond with a JSON object in this exact format:
    {
      "intent": "transfer",
      "amount": [number],
      "recipient": "[hedera_account_id]",
      "token": "[token_symbol]"
    }

    If the intent is not clear or not a transfer, respond with:
    {
      "intent": "unknown",
      "message": "Could not understand the request"
    }

    Only respond with the JSON object, nothing else.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response - remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      
      const parsed = JSON.parse(cleanText);
      return parsed;
    } catch (error) {
      console.error('Error parsing user intent:', error);
      return {
        intent: 'unknown',
        message: 'Failed to parse your request'
      };
    }
  }

  private async handleTransferIntent(intent: TransferIntent): Promise<{ response: string; transactionId?: string }> {
    try {
      // Validate the recipient account format
      if (!this.isValidHederaAccountId(intent.recipient)) {
        return {
          response: `Invalid Hedera account ID format: ${intent.recipient}. Please use format: 0.0.XXXXXXX`
        };
      }

      // Convert amount to smallest units (assuming 2 decimal places)
      const amountInSmallestUnits = Math.round(intent.amount * 100);

      // Execute the transfer
      const result = await this.hederaService.transferTokens(
        process.env.SENDER_ACCOUNT_ID!,
        process.env.SENDER_PRIVATE_KEY!,
        intent.recipient,
        process.env.TOKEN_ID!,
        amountInSmallestUnits
      );

      const hashScanUrl = `https://hashscan.io/testnet/transaction/${result.transactionId}`;
      
      return {
        response: `Success! I've transferred ${intent.amount} ${intent.token} to ${intent.recipient}. Transaction ID: ${result.transactionId}. You can view it on HashScan: ${hashScanUrl}`,
        transactionId: result.transactionId
      };
    } catch (error) {
      console.error('Transfer failed:', error);
      return {
        response: `Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private isValidHederaAccountId(accountId: string): boolean {
    const hederaAccountRegex = /^0\.0\.\d{1,10}$/;
    return hederaAccountRegex.test(accountId);
  }
}

export default AgentService;