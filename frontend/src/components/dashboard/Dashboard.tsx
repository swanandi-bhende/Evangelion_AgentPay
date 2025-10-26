'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/contexts/TransactionContext';
import TransactionCard from './TransactionCard';
import { Send, History, Hash } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { transactions } = useTransactions();

  const recentTransactions = transactions.slice(0, 5);
  const successfulTransactions = transactions.filter(t => t.status === 'success').length;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-1 text-gray-600">
            Manage your cross-border payments with AI-powered efficiency.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <Send className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Send Money
                  </dt>
                  <dd>
                    <p className="text-sm text-gray-900">
                      Use the AI Assistant to send payments
                    </p>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <History className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Successful Transactions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {successfulTransactions}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0 bg-green-100 rounded-md p-2">
                <Hash className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Hedera Account
                  </dt>
                  <dd className="text-sm font-medium text-gray-900 truncate">
                    {user?.hederaAccountId}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Transactions
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Your most recent cross-border payments.
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by sending your first payment using the AI Assistant.
              </p>
              <div className="mt-6">
                <p className="text-sm text-gray-500">
                  Try saying in the chat: "Send 10 TPYUSD to a recipient account"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;