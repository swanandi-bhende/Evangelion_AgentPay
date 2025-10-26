import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import dotenv from 'dotenv';
import { currencyService, CurrencyService } from '../utils/currency.js';
import { hederaService } from '../hederaService.js';
import { getEnvVars } from '../../utils/env.js';
import { complianceService } from '../services/compliance.js';
import { simpleAgent } from './simpleAgent.js';

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
        try {
          this.model = genAI.getGenerativeModel({ model: 'models/text-bison-001' });
        } catch {
          this.model = genAI.getGenerativeModel({ model: 'gemini-1.5' });
        }
      } catch (err) {
        console.error('Error initializing GoogleGenerativeAI model, falling back to local parser:', err);
        this.model = null;
      }
    }

    this.knownRecipients = new Map([
      ['priya', { accountId: getEnvVars().recipientAccountId, location: 'India' }],
      ['anil', { accountId: getEnvVars().recipientAccountId, location: 'India' }]
    ]);
  }

  private async parseInstructions(message: string): Promise<ParsedInstruction> {
    try {
      const accountMatch = message.match(/(\d+\.\d+\.\d+)/);
      if (accountMatch) {
        const accountId = accountMatch[0];
        const amt = CurrencyService.parseAmount(message) || { amount: 0, currency: 'USD' } as any;
        const amount = amt.amount || 0;
        const fromCurrency = (amt.currency || 'USD').toUpperCase();

        return {
          action: message.toLowerCase().includes('send') ? 'send' : 'unknown',
          amount,
          fromCurrency,
          toCurrency: fromCurrency === 'USD' ? 'USD' : fromCurrency,
          recipientAccount: accountId,
          recipientName: undefined,
          recipientLocation: undefined,
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

      if (this.model) {
        const prompt = `Parse this payment instruction into structured JSON:
Input: "${message}"
Return JSON with:
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
        const text = await response.text();

        let parsed: any;
        try {
          parsed = JSON.parse(text);
        } catch {
          console.warn('Model returned invalid JSON, falling back to local parser.');
          return this.localParseInstructions(message);
        }

        const normalizedRecipientName = parsed.recipientName?.toLowerCase();
        const recipientInfo = normalizedRecipientName ? this.knownRecipients.get(normalizedRecipientName) : undefined;
        const targetCurrency = parsed.toCurrency || (parsed.recipientLocation?.toLowerCase() === 'india' ? 'INR' : 'USD');

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
          regulatoryContext: {
            requiresScreening: (parsed.amount || 0) > 3000,
            purposeCode: this.mapPurposeToCode(parsed.purpose || 'unknown'),
            isFamilyRemittance: parsed.purpose === 'family_support'
          }
        };
      }
    } catch (error) {
      console.error('Error parsing instructions with model, falling back to local parser:', error);
    }

    return this.localParseInstructions(message);
  }

  private async localParseInstructions(message: string): Promise<ParsedInstruction> {
    const amt = CurrencyService.parseAmount(message) || { amount: 0, currency: 'USD' } as any;
    const amount = amt.amount || 0;
    const fromCurrency = (amt.currency || 'USD').toUpperCase();

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
    const purposeCodes: { [key: string]: string } = {
      'family_support': 'FAM',
      'business': 'BUS',
      'personal': 'PER',
      'unknown': 'OTH'
    };
    return purposeCodes[purpose] || 'OTH';
  }

  private async prepareTransferDetails(instruction: ParsedInstruction) {
    const recipient = instruction.recipientAccount || 
      (instruction.recipientName && this.knownRecipients.get(instruction.recipientName)?.accountId) ||
      // Fallback to default recipient from environment when name lookup fails
      getEnvVars().recipientAccountId;

    if (!recipient) {
      throw new Error('Recipient not found in known contacts');
    }

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
    const lower = message.toLowerCase();
    if (lower.includes('help') || lower.includes('what can you do') || lower.includes('how this works') || lower.includes('examples')) {
      return simpleAgent.getHelpResponse();
    }

    try {
      console.log('🤖 Processing message:', message);
      const instruction = await this.parseInstructions(message);

      if (instruction.action === 'unknown') {
        return `I'm not sure what you want to do. Try: "Send $500 to Priya in India" or "Transfer 1000 rupees to Anil"`;
      }

      const transferDetails = await this.prepareTransferDetails(instruction);

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

      const complianceResult = await complianceService.validateTransaction(
        transferDetails.senderAccountId,
        transferDetails.recipientAccountId,
        transferDetails.amount,
        instruction.fromCurrency,
        transferDetails.tokenId
      );

      if (complianceResult.overallStatus !== 'APPROVED') {
  throw new Error(`Transfer rejected: ${complianceResult.checks.find((c: any) => c.status === 'FAILED')?.details}`);
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
