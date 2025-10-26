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
          response: parsedIntent.intent === 'unknown' 
            ? parsedIntent.message 
            : "I'm here to help you with transfers. Try saying something like: 'Send 10 TPYUSD to 0.0.1234567'"
        };
      }
    } catch (error) {
      console.error('Error processing message:', error instanceof Error ? error.message : error);
      return {
        response: "I encountered an error processing your request. Please try again."
      };
    }
  }

  private async parseUserIntent(message: string): Promise<ParsedIntent> {
    try {
      // Try different Gemini models
      let model;
      const modelsToTry = [
        'gemini-pro',
        'gemini-1.0-pro',
        'models/gemini-pro'
      ];

      let lastError: unknown = null;

      for (const modelName of modelsToTry) {
        try {
          console.log(`Trying Gemini model: ${modelName}`);
          model = this.genAI.getGenerativeModel({ model: modelName });
          
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

          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();
          
          // Clean the response - remove markdown code blocks if present
          const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
          
          const parsed = JSON.parse(cleanText);
          console.log(`Successfully parsed with model: ${modelName}`);
          return parsed;
        } catch (err) {
          console.log(`Model ${modelName} failed:`, err instanceof Error ? err.message : err);
          lastError = err;
          continue;
        }
      }

      // If all models fail, throw the last error
      throw lastError || new Error('All Gemini models failed');

    } catch (err) {
      console.error('Error parsing user intent with Gemini:', err instanceof Error ? err.message : err);
      
      // Fallback: Simple regex parsing if Gemini fails
      return this.fallbackParse(message);
    }
  }

  private fallbackParse(message: string): ParsedIntent {
    const patterns = [
      /(?:send|transfer)\s+(\d+(?:\.\d+)?)\s*(\w+)?\s*(?:to)?\s*(0\.0\.\d+)/i,
      /(?:send|transfer)\s+(\d+(?:\.\d+)?)\s*(?:to)?\s*(0\.0\.\d+)/i,
      /(?:i\s+want\s+to|i\'d\s+like\s+to)\s+(?:send|transfer)\s+(\d+(?:\.\d+)?)\s*(\w+)?\s*(?:to)?\s*(0\.0\.\d+)/i,
      /(?:please\s+)?(?:send|transfer)\s+(\d+(?:\.\d+)?)\s*(?:tokens?)?\s*(?:to)?\s*(0\.0\.\d+)/i
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        const amount = parseFloat(match[1]);
        const token = match[2] || 'TPYUSD';
        const recipient = match[match.length - 1];
        
        if (amount && recipient && this.isValidHederaAccountId(recipient)) {
          console.log(`Parsed transfer using fallback: ${amount} ${token} to ${recipient}`);
          return {
            intent: 'transfer',
            amount,
            recipient,
            token
          };
        }
      }
    }
    
    return {
      intent: 'unknown',
      message: 'Could not understand the request. Please use format: "Send 10 TPYUSD to 0.0.1234567"'
    };
  }

  private async handleTransferIntent(intent: TransferIntent): Promise<{ response: string; transactionId?: string }> {
    try {
      if (!this.isValidHederaAccountId(intent.recipient)) {
        return {
          response: `Invalid Hedera account ID format: ${intent.recipient}. Please use format: 0.0.XXXXXXX`
        };
      }

      const amountInSmallestUnits = Math.round(intent.amount * 100);

      console.log(`Initiating transfer of ${amountInSmallestUnits} TPYUSD from ${process.env.SENDER_ACCOUNT_ID} to ${intent.recipient}`);

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
    } catch (err) {
      console.error('Transfer failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return {
        response: `Transfer failed: ${errorMessage}. Please ensure the recipient account is associated with the token.`
      };
    }
  }

  private isValidHederaAccountId(accountId: string): boolean {
    const hederaAccountRegex = /^0\.0\.\d{1,10}$/;
    return hederaAccountRegex.test(accountId);
  }
}

export default AgentService;
