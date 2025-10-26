'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, MessageCircle } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <div className="shrink-0">
              <h1 className="text-2xl font-bold text-gray-900">AgentPay</h1>
            </div>
            <nav className="ml-6 flex space-x-8">
              <a
                href="/dashboard"
                className="text-blue-600 border-b-2 border-blue-600 px-3 py-2 text-sm font-medium"
              >
                Dashboard
              </a>
              <a
                href="/send"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
              >
                Send Money
              </a>
              <a
                href="/transactions"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
              >
                Transactions
              </a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MessageCircle className="h-4 w-4" />
              <span>AI Assistant Ready</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;