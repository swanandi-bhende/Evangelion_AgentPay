import { GoogleGenerativeAI, GenerativeModel, EnhancedGenerateContentResponse } from '@google/generative-ai';
import dotenv from 'dotenv';
import { currencyService } from '../utils/currency.js';
import { hederaService } from '../hederaService.js';
import { getEnvVars } from '../../utils/env.js';

dotenv.config();

interface ParsedInstruction {
  action: 'send' | 'transfer' | 'unknown';
  amount: number;
  fromCurrency: string;
  recipientName?: string;
  recipientLocation?: string;
  recipientAccount?: string;
}

const SYSTEM_PROMPT = `You are AgentPay, an AI assistant for international money transfers.
Your role is to help users send money internationally through the Hedera network.

Key capabilities:
1. Parse natural language payment instructions
2. Handle currency conversion (USD, INR, etc.)
3. Execute transfers using Hedera tokens
4. Map recipient names to their Hedera account IDs

Example interactions:
User: "Send $500 to Priya in India"
You would:
1. Parse amount ($500 USD)
2. Convert USD to INR
3. Identify Priya as recipient
4. Execute transfer using TPYUSD tokens

Always ask for confirmation before executing transfers.
If any information is missing, ask the user for clarification.`;

export class IntelligentAgent {
  private model: GenerativeModel;
  private knownRecipients: Map<string, { accountId: string; location: string }>;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY environment variable is required');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Mock database of known recipients for MVP
    // In production, this would come from a real database
    this.knownRecipients = new Map([
      ['priya', { accountId: getEnvVars().recipientAccountId, location: 'India' }],
      ['anil', { accountId: getEnvVars().recipientAccountId, location: 'India' }]
    ]);
  }

  private async parseInstructions(message: string): Promise<ParsedInstruction> {
    try {
      const prompt = `Parse this payment instruction into structured data. Return ONLY a JSON object:
      "${message}"
      
      Example format:
      {
        "action": "send",
        "amount": 500,
        "fromCurrency": "USD",
        "recipientName": "priya",
        "recipientLocation": "india"
      }`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the JSON response
      const parsed = JSON.parse(text);
      
      // Validate and normalize the parsed data
      return {
        action: parsed.action?.toLowerCase() === 'send' ? 'send' : 'unknown',
        amount: parseFloat(parsed.amount) || 0,
        fromCurrency: (parsed.fromCurrency || 'USD').toUpperCase(),
        recipientName: parsed.recipientName?.toLowerCase(),
        recipientLocation: parsed.recipientLocation?.toLowerCase(),
        recipientAccount: this.knownRecipients.get(parsed.recipientName?.toLowerCase())?.accountId
      };
    } catch (error) {
      console.error('Error parsing instructions:', error);
      return {
        action: 'unknown',
        amount: 0,
        fromCurrency: 'USD'
      };
    }
  }

  private async prepareTransferDetails(instruction: ParsedInstruction) {
    // Get recipient account
    const recipient = instruction.recipientAccount || 
      (instruction.recipientName && 
       this.knownRecipients.get(instruction.recipientName)?.accountId);

    if (!recipient) {
      throw new Error('Recipient not found in known contacts');
    }

    // Convert currency if needed
    const env = getEnvVars();
    let finalAmount = instruction.amount;

    if (instruction.fromCurrency !== 'USD') {
      const conversion = await currencyService.convert(
        instruction.amount,
        instruction.fromCurrency,
        'USD'
      );
      finalAmount = conversion.toAmount;
    }

    return {
      senderAccountId: env.senderAccountId,
      senderPrivateKey: env.senderPrivateKey,
      recipientAccountId: recipient,
      tokenId: env.tokenId,
      amount: finalAmount
    };
  }

  async processMessage(message: string): Promise<string> {
    try {
      console.log('🤖 Processing message:', message);

      // First, parse the natural language instruction
      const instruction = await this.parseInstructions(message);
      
      if (instruction.action === 'unknown') {
        return `I'm not sure what you want to do. Please try saying something like:
        "Send $500 to Priya in India" or
        "Transfer 1000 rupees to Anil"`;
      }

      // Look up recipient and prepare transfer details
      const transferDetails = await this.prepareTransferDetails(instruction);

      // Get currency conversion info for user confirmation
      let conversionInfo = '';
      if (instruction.fromCurrency !== 'USD') {
        const conversion = await currencyService.convert(
          instruction.amount,
          instruction.fromCurrency,
          'USD'
        );
        conversionInfo = `\nConversion rate: 1 ${instruction.fromCurrency} = ${conversion.rate.toFixed(2)} USD
Amount in USD: ${currencyService.formatAmount(conversion.toAmount, 'USD')}`;
      }

      // Format confirmation message
      const confirmationMessage = `I'll help you send money:
From: ${transferDetails.senderAccountId}
To: ${transferDetails.recipientAccountId}
Amount: ${currencyService.formatAmount(instruction.amount, instruction.fromCurrency)}${conversionInfo}
Token ID: ${transferDetails.tokenId}

Would you like me to proceed with this transfer? (Type 'yes' to confirm)`;

      // Here you would typically wait for user confirmation
      // For MVP, we'll proceed with the transfer
      
      // Execute the transfer
      const result = await hederaService.transferTokens(
        transferDetails.senderAccountId,
        transferDetails.senderPrivateKey,
        transferDetails.recipientAccountId,
        transferDetails.tokenId,
        transferDetails.amount
      );

      if (result.success && result.transactionId) {
        const hashScanUrl = `https://hashscan.io/testnet/transaction/${result.transactionId}`;
        return `✅ Transfer complete!

Amount: ${currencyService.formatAmount(instruction.amount, instruction.fromCurrency)}
To: ${transferDetails.recipientAccountId}
Transaction ID: ${result.transactionId}
View on HashScan: ${hashScanUrl}`;
      } else {
        throw new Error(result.error || 'Transfer failed');
      }
    } catch (error) {
      console.error('❌ Error processing message:', error);
      return `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  isReady(): boolean {
    return true;
  }
}

export const intelligentAgent = new IntelligentAgent();