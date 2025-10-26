'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, TransactionContextType } from '@/types/transaction';

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedTransactions = localStorage.getItem('agentpay_transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };

    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    localStorage.setItem('agentpay_transactions', JSON.stringify(updatedTransactions));
  };

  const addTransactionFromAgent = (response: string, transactionId?: string) => {
    // Extract transaction details from agent response
    const amountMatch = response.match(/(\d+(?:\.\d+)?)\s*(TPYUSD|tokens)/i);
    const recipientMatch = response.match(/(0\.0\.\d+)/);
    
    if (amountMatch && recipientMatch && transactionId) {
      const amount = parseFloat(amountMatch[1]);
      const recipient = recipientMatch[1];
      const token = amountMatch[2].toUpperCase();
      
      const transaction: Omit<Transaction, 'id' | 'timestamp'> = {
        transactionId,
        amount,
        recipient,
        status: 'success',
        hashScanUrl: `https://hashscan.io/testnet/transaction/${transactionId}`,
        token
      };

      addTransaction(transaction);
    }
  };

  return (
    <TransactionContext.Provider value={{ 
      transactions, 
      addTransaction, 
      addTransactionFromAgent,
      loading 
    }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};