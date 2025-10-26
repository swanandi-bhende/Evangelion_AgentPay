'use client';

import React, { useState } from 'react';
import { apiService } from '@/services/api';
import { useTransactions } from '@/contexts/TransactionContext';
import { Send, CheckCircle, XCircle } from 'lucide-react';

const SendMoneyForm: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { addTransaction } = useTransactions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const amountInSmallestUnits = Math.round(parseFloat(amount) * 100);
      
      const response = await apiService.transferFunds({
        amount: amountInSmallestUnits,
        recipient
      });

      if (response.status === 'success') {
        setMessage({ type: 'success', text: `Successfully sent ${amount} TPYUSD to ${recipient}` });
        
        // Add to transaction history
        addTransaction({
          transactionId: response.data.transactionId,
          amount: parseFloat(amount),
          recipient,
          status: 'success',
          hashScanUrl: `https://hashscan.io/testnet/transaction/${response.data.transactionId}`,
          token: 'TPYUSD'
        });

        // Reset form
        setAmount('');
        setRecipient('');
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to send money. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount (TPYUSD)
          </label>
          <input
            type="number"
            id="amount"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">
            Recipient Account ID
          </label>
          <input
            type="text"
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
            pattern="0\.0\.\d+"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
            placeholder="0.0.1234567"
          />
          <p className="mt-1 text-xs text-gray-500">
            Format: 0.0.XXXXXXX
          </p>
        </div>

        {message && (
          <div className={`p-3 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !amount || !recipient}
          className="w-full bg-indigo-600 text-white rounded-md px-4 py-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium transition-colors duration-200"
        >
          <Send className="h-4 w-4" />
          <span>{loading ? 'Sending...' : 'Send Money'}</span>
        </button>
      </form>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Tip</h3>
        <p className="text-sm text-gray-600">
          You can also use the AI Assistant in the dashboard to send money using natural language commands like:
        </p>
        <ul className="mt-2 text-sm text-gray-600 space-y-1">
          <li>• "Send 10 TPYUSD to 0.0.1234567"</li>
          <li>• "Transfer 5 tokens to 0.0.1234567"</li>
          <li>• "Please send 15 TPYUSD to account 0.0.1234567"</li>
        </ul>
      </div>
    </div>
  );
};

export default SendMoneyForm;