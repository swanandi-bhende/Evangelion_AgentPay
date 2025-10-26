'use client';

import React from 'react';
import { useTransactions } from '@/contexts/TransactionContext';
import TransactionCard from '@/components/dashboard/TransactionCard';
import { History, Filter } from 'lucide-react';

const TransactionsList: React.FC = () => {
  const { transactions } = useTransactions();

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No transactions yet</h3>
        <p className="mt-2 text-gray-600">
          Your transaction history will appear here once you start sending payments.
        </p>
        <div className="mt-6">
          <p className="text-sm text-gray-500">
            Use the AI Assistant or Send Money form to make your first transfer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            All Transactions ({transactions.length})
          </h2>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Filter className="h-4 w-4" />
          <span>Sorted by most recent</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
          />
        ))}
      </div>
    </div>
  );
};

export default TransactionsList;