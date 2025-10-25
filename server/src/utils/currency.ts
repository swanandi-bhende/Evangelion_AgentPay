import dotenv from 'dotenv';

dotenv.config();

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: number;
  provider: string;
  fee?: {
    percentage: number;
    fixed: number;
    currency: string;
  };
}

export interface ConversionResult {
  fromAmount: number;
  fromCurrency: string;
  toAmount: number;
  toCurrency: string;
  rate: number;
  timestamp: number;
  provider: string;
  fees: {
    exchange: number;
    network: number;
    offramp: number;
    total: number;
  };
  corridor: {
    from: {
      country: string;
      currency: string;
    };
    to: {
      country: string;
      currency: string;
    };
  };
}

export interface LiquidityProvider {
  name: string;
  supportedCorridors: {
    from: string;
    to: string;
    minAmount?: number;
    maxAmount?: number;
    fee: {
      percentage: number;
      fixed: number;
      currency: string;
    };
  }[];
  getRate(from: string, to: string): Promise<number>;
}

/**
 * Enhanced Currency Service for Cross-Border Payments
 * 
 * Features:
 * - Multi-provider rate aggregation
 * - Corridor-specific fee calculation
 * - Regulatory limits enforcement
 * - Real-time rate monitoring
 * - Off-ramp partner integration
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
  private liquidityProviders: LiquidityProvider[] = [
    // Mock provider for demonstration
    {
      name: "FastRemit",
      supportedCorridors: [
        {
          from: "USD",
          to: "INR",
          minAmount: 1,
          maxAmount: 10000,
          fee: {
            percentage: 0.5,
            fixed: 2,
            currency: "USD"
          }
        }
      ],
      getRate: async (from: string, to: string) => {
        // Mock implementation returns competitive rates
        const baseRates: { [key: string]: number } = {
          'USD-INR': 83.0,
          'INR-USD': 1 / 83.0,
          'USD-EUR': 0.93,
          'EUR-USD': 1 / 0.93,
        };
        return baseRates[`${from}-${to}`] || 1;
      }
    }
  ];

  private getCorridorInfo(from: string, to: string) {
    // Map currency codes to country info
    const currencyToCountry: { [key: string]: string } = {
      'USD': 'United States',
      'INR': 'India',
      'EUR': 'European Union',
      // Add more as needed
    };

    return {
      from: {
        country: currencyToCountry[from] || 'Unknown',
        currency: from
      },
      to: {
        country: currencyToCountry[to] || 'Unknown',
        currency: to
      }
    };
  }

  private async getBestRate(
    from: string,
    to: string,
    amount: number
  ): Promise<{ rate: number; provider: LiquidityProvider }> {
    const rates = await Promise.all(
      this.liquidityProviders
        .filter(provider => 
          provider.supportedCorridors.some(
            corridor => 
              corridor.from === from && 
              corridor.to === to &&
              (!corridor.minAmount || amount >= corridor.minAmount) &&
              (!corridor.maxAmount || amount <= corridor.maxAmount)
          )
        )
        .map(async provider => ({
          rate: await provider.getRate(from, to),
          provider
        }))
    );

    if (rates.length === 0) {
      throw new Error(`No liquidity provider available for ${from} to ${to}`);
    }

    return rates.reduce((best, current) => 
      current.rate > best.rate ? current : best
    );
  }

  /**
   * Get exchange rate with full fee breakdown
   */
  private async getExchangeRate(
    from: string,
    to: string,
    amount: number
  ): Promise<ExchangeRate> {
    const key = `${from}-${to}-${amount}`;
    const cached = this.cachedRates.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached;
    }

    try {
      const { rate, provider } = await this.getBestRate(from, to, amount);
      const corridor = provider.supportedCorridors.find(
        c => c.from === from && c.to === to
      );

      if (!corridor) {
        throw new Error(`No supported corridor found for ${from} to ${to}`);
      }

      const result: ExchangeRate = {
        from,
        to,
        rate,
        timestamp: Date.now(),
        provider: provider.name,
        fee: corridor.fee
      };

      this.cachedRates.set(key, result);
      return result;
    } catch (error) {
      console.error('Error getting exchange rate:', error);
      throw error;
    }
  }

  /**
   * Convert an amount with full fee calculation
   */
  async convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<ConversionResult> {
    const rate = await this.getExchangeRate(fromCurrency, toCurrency, amount);
    const convertedAmount = amount * rate.rate;
    
    // Calculate fees
    const exchangeFee = (amount * (rate.fee?.percentage || 0) / 100) + 
                       (rate.fee?.fixed || 0);
    const networkFee = 0.001; // Hedera's standard fee in USD
    const offrampFee = 2.00;  // Example fixed fee for local payout
    
    const totalFees = exchangeFee + networkFee + offrampFee;
    const finalAmount = convertedAmount - totalFees;

    return {
      fromAmount: amount,
      fromCurrency,
      toAmount: finalAmount,
      toCurrency,
      rate: rate.rate,
      timestamp: rate.timestamp,
      provider: rate.provider,
      fees: {
        exchange: exchangeFee,
        network: networkFee,
        offramp: offrampFee,
        total: totalFees
      },
      corridor: this.getCorridorInfo(fromCurrency, toCurrency)
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
