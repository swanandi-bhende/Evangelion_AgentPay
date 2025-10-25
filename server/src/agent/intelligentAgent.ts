import { GoogleGenerativeAI, GenerativeModel, EnhancedGenerateContentResponse } from '@google/generative-ai';
import dotenv from 'dotenv';
import { currencyService, CurrencyService } from '../utils/currency.js';
import { hederaService } from '../hederaService.js';
import { getEnvVars } from '../../utils/env.js';
import { complianceService, ComplianceCheck } from '../services/compliance.js';

dotenv.config();

interface ParsedInstruction {
  action: 'send' | 'transfer' | 'unknown';
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  recipientName?: string;
  recipientLocation?: string;
  recipientAccount?: string;
  relationship?: 'family' | 'friend' | 'business' | 'unknown';
  urgency?: 'normal' | 'high';
  purpose?: 'family_support' | 'business' | 'personal' | 'unknown';
  regulatoryContext?: {
    requiresScreening: boolean;
    purposeCode: string;
    isFamilyRemittance: boolean;
  };
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
  private model: GenerativeModel | null;
  private knownRecipients: Map<string, { accountId: string; location: string }>;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ GOOGLE_API_KEY not provided — IntelligentAgent will use local parsing fallback.');
      this.model = null;
    } else {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Use a safe default model; if the model is not available the code will fallback
        this.model = genAI.getGenerativeModel({ model: 'gemini-1.5' });
      } catch (err) {
        console.error('Error initializing GoogleGenerativeAI model, falling back to local parser:', err);
        this.model = null;
      }
    }

    // Mock database of known recipients for MVP
    // In production, this would come from a real database
    this.knownRecipients = new Map([
      ['priya', { accountId: getEnvVars().recipientAccountId, location: 'India' }],
      ['anil', { accountId: getEnvVars().recipientAccountId, location: 'India' }]
    ]);
  }

  private async parseInstructions(message: string): Promise<ParsedInstruction> {
    try {
      // If model is available, prefer it
      if (this.model) {
        const prompt = `You are a payment processing AI. Parse this payment instruction into structured data.
      Consider context clues for currency and recipient identification.
      If a currency is not specified but a country is mentioned, infer the likely currency.
      Example: "send money to mom in India" would use INR as the target currency.
      
      Input: "${message}"
      
      Return ONLY a valid JSON object with this structure:
      {
        "action": "send|transfer|unknown",
        "amount": number,
        "fromCurrency": "USD|EUR|INR|etc",
        "toCurrency": "inferred target currency",
        "recipientName": "normalized name",
        "recipientLocation": "country",
        "relationship": "family|friend|business|unknown",
        "urgency": "normal|high",
        "purpose": "family_support|business|personal|unknown"
      }`;
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse and validate the JSON response
        const parsed = JSON.parse(text);
      
      // Enhanced validation with relationship context
      const normalizedRecipientName = parsed.recipientName?.toLowerCase();
      const recipientInfo = this.knownRecipients.get(normalizedRecipientName);
      
      // Infer currency if not specified
      const targetCurrency = parsed.toCurrency || 
        (parsed.recipientLocation?.toLowerCase() === 'india' ? 'INR' : 'USD');
      
      // Normalized instruction with enhanced context
      return {
        action: parsed.action?.toLowerCase() === 'send' ? 'send' : 'unknown',
        amount: parseFloat(parsed.amount) || 0,
        fromCurrency: (parsed.fromCurrency || 'USD').toUpperCase(),
        toCurrency: targetCurrency,
        recipientName: normalizedRecipientName,
        recipientLocation: parsed.recipientLocation?.toLowerCase(),
        recipientAccount: recipientInfo?.accountId,
        relationship: parsed.relationship || 'unknown',
        urgency: parsed.urgency || 'normal',
        purpose: parsed.purpose || 'unknown',
        // Add regulatory context based on purpose and amount
        regulatoryContext: {
          requiresScreening: (parsed.amount || 0) > 3000,
          purposeCode: this.mapPurposeToCode(parsed.purpose || 'unknown'),
          isFamilyRemittance: parsed.purpose === 'family_support'
        }
        };
      }
    } catch (error) {
      console.error('Error parsing instructions with model, falling back to local parser:', error);
      // fall through to local parser
    }

    // Local deterministic parser fallback
    return this.localParseInstructions(message);
  }

  private async localParseInstructions(message: string): Promise<ParsedInstruction> {
    // Basic amount parsing
    const amt = CurrencyService.parseAmount(message) || { amount: 0, currency: 'USD' } as any;
    const amount = amt.amount || 0;
    const fromCurrency = (amt.currency || 'USD').toUpperCase();

    // Recipient parsing: "to NAME in COUNTRY" or "to NAME"
    const toMatch = message.match(/to\s+([A-Za-z0-9'\-_.]+)(?:\s+in\s+([A-Za-z ]+))?/i);
    const recipientName = toMatch?.[1]?.toLowerCase();
    const recipientLocation = toMatch?.[2]?.toLowerCase();

    const recipientAccount = recipientName ? this.knownRecipients.get(recipientName)?.accountId : undefined;

    const inferredToCurrency = recipientLocation === 'india' ? 'INR' : 'USD';

    return {
      action: 'send',
      amount,
      fromCurrency,
      toCurrency: inferredToCurrency,
      recipientName,
      recipientLocation,
      recipientAccount,
      relationship: 'unknown',
      urgency: 'normal',
      purpose: 'unknown',
      regulatoryContext: {
        requiresScreening: amount > 3000,
        purposeCode: this.mapPurposeToCode('unknown'),
        isFamilyRemittance: false
      }
    };
  }

  private mapPurposeToCode(purpose: string): string {
    // Standard purpose codes used in cross-border payments
    const purposeCodes: { [key: string]: string } = {
      'family_support': 'FAM',
      'business': 'BUS',
      'personal': 'PER',
      'unknown': 'OTH'
    };
    return purposeCodes[purpose] || 'OTH';
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
Amount in USD: ${CurrencyService.formatAmount(conversion.toAmount, 'USD')}`;
      }

      // Format confirmation message with enhanced details
      const confirmationMessage = `I'll help you send money:
From: ${transferDetails.senderAccountId}
To: ${transferDetails.recipientAccountId} (${instruction.recipientName || 'Unknown'} - ${instruction.relationship || 'Contact'})
Amount: ${CurrencyService.formatAmount(instruction.amount, instruction.fromCurrency)}${conversionInfo}
Purpose: ${instruction.purpose || 'Not specified'}
Token ID: ${transferDetails.tokenId}

Transaction Details:
- Network Fee: ${CurrencyService.formatAmount(0.001, 'USD')}
- Processing Time: ${instruction.urgency === 'high' ? 'Priority (1-2 minutes)' : 'Standard (3-5 minutes)'}
- Regulatory: ${instruction.regulatoryContext?.requiresScreening ? '⚠️ Additional screening required' : '✅ Standard verification'}

Would you like me to proceed with this transfer? (Type 'yes' to confirm)`;

      // Here you would typically wait for user confirmation
      // For MVP, we'll proceed with the transfer
      
      // Execute the transfer with compliance checks
      const complianceResult = await complianceService.validateTransaction(
        transferDetails.senderAccountId,
        transferDetails.recipientAccountId,
        transferDetails.amount,
        instruction.fromCurrency,
        transferDetails.tokenId
      );

      if (complianceResult.overallStatus !== 'APPROVED') {
        throw new Error(`Transfer rejected: ${complianceResult.checks.find(c => c.status === 'FAILED')?.details}`);
      }

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

Amount: ${CurrencyService.formatAmount(instruction.amount, instruction.fromCurrency)}
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

// Note: do NOT auto-instantiate here — instantiate lazily from the AgentService