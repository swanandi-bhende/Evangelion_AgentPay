'use client';

import React from 'react';
import { Transaction } from '@/types/transaction';
import { ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';

interface TransactionCardProps {
  transaction: Transaction;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction }) => {
  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'success':
        return 'text-green-800 bg-green-100';
      case 'failed':
        return 'text-red-800 bg-red-100';
      default:
        return 'text-yellow-800 bg-yellow-100';
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {transaction.amount} {transaction.token}
              </h3>
              <p className="text-sm text-gray-500">To: {transaction.recipient}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {transaction.status}
          </span>
        </div>
        
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Transaction ID</dt>
            <dd className="text-sm text-gray-900 font-mono">{transaction.transactionId}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
            <dd className="text-sm text-gray-900">
              {new Date(transaction.timestamp).toLocaleString()}
            </dd>
          </div>
        </div>

        <div className="mt-4">
          <a
            href={transaction.hashScanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View on HashScan
            <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;