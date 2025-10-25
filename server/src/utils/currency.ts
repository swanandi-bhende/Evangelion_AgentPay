import dotenv from 'dotenv';

dotenv.config();

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: number;
}

export interface ConversionResult {
  fromAmount: number;
  fromCurrency: string;
  toAmount: number;
  toCurrency: string;
  rate: number;
  timestamp: number;
}

/**
 * Currency Conversion Service
 * 
 * Handles currency conversion between different fiat currencies.
 * For MVP, uses a simple API to get real exchange rates.
 * Can be extended to use multiple data sources or cached rates.
 */
export class CurrencyService {
  private static instance: CurrencyService;
  private cachedRates: Map<string, ExchangeRate> = new Map();
  private cacheTimeout = 3600000; // 1 hour in milliseconds

  private constructor() {}

  static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  /**
   * Get the current exchange rate for a currency pair
   */
  private async getExchangeRate(from: string, to: string): Promise<ExchangeRate> {
    const key = `${from}-${to}`;
    const cached = this.cachedRates.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached;
    }

    try {
      // Using ExchangeRate-API (free tier) - you can replace with your preferred source
      const apiKey = process.env.EXCHANGE_RATE_API_KEY;
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}`
      );

      if (!response.ok) {
        throw new Error(`Exchange rate API error: ${response.statusText}`);
      }

      const data = await response.json();
      const rate: ExchangeRate = {
        from,
        to,
        rate: data.conversion_rate,
        timestamp: Date.now()
      };

      this.cachedRates.set(key, rate);
      return rate;
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      // Fallback to approximate rates for MVP demo
      // In production, you would want to handle this differently
      const fallbackRates: { [key: string]: number } = {
        'USD-INR': 83.0,
        'INR-USD': 1 / 83.0,
        'USD-EUR': 0.93,
        'EUR-USD': 1 / 0.93,
      };

      return {
        from,
        to,
        rate: fallbackRates[key] || 1,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Convert an amount from one currency to another
   */
  async convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<ConversionResult> {
    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = amount * rate.rate;

    return {
      fromAmount: amount,
      fromCurrency,
      toAmount: convertedAmount,
      toCurrency,
      rate: rate.rate,
      timestamp: rate.timestamp
    };
  }

  /**
   * Format amount with currency symbol
   */
  static formatAmount(amount: number, currency: string): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formatter.format(amount);
  }

  /**
   * Parse amount from natural language
   * Handles formats like "$100", "100 USD", "100 dollars"
   */
  static parseAmount(text: string): { amount: number; currency: string } | null {
    // Remove commas and normalize spaces
    const normalized = text.replace(/,/g, '').toLowerCase();
    
    // Common currency words and symbols
    const patterns = [
      // USD patterns
      { regex: /\$\s*(\d+\.?\d*)/i, currency: 'USD' },
      { regex: /(\d+\.?\d*)\s*usd/i, currency: 'USD' },
      { regex: /(\d+\.?\d*)\s*dollars?/i, currency: 'USD' },
      // INR patterns
      { regex: /₹\s*(\d+\.?\d*)/i, currency: 'INR' },
      { regex: /rs\.?\s*(\d+\.?\d*)/i, currency: 'INR' },
      { regex: /(\d+\.?\d*)\s*inr/i, currency: 'INR' },
      { regex: /(\d+\.?\d*)\s*rupees?/i, currency: 'INR' },
      // EUR patterns
      { regex: /€\s*(\d+\.?\d*)/i, currency: 'EUR' },
      { regex: /(\d+\.?\d*)\s*eur/i, currency: 'EUR' },
      { regex: /(\d+\.?\d*)\s*euros?/i, currency: 'EUR' }
    ];

    for (const { regex, currency } of patterns) {
      const match = normalized.match(regex);
      if (match) {
        return {
          amount: parseFloat(match[1]),
          currency
        };
      }
    }

    // If no currency specified, look for just a number and assume USD
    const numberMatch = normalized.match(/(\d+\.?\d*)/);
    if (numberMatch) {
      return {
        amount: parseFloat(numberMatch[1]),
        currency: 'USD'
      };
    }

    return null;
  }
}

export const currencyService = CurrencyService.getInstance();
