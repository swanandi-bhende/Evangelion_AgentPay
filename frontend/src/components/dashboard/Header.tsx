'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="shrink-0">
              <h1 className="text-2xl font-bold text-gray-900">AgentPay</h1>
            </div>
            <nav className="ml-6 flex space-x-8">
              <Link
                href="/dashboard"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  isActive('/dashboard')
                    ? 'text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/send"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  isActive('/send')
                    ? 'text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Send Money
              </Link>
              <Link
                href="/transactions"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  isActive('/transactions')
                    ? 'text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Transactions
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-green-50 px-3 py-1 rounded-full">
              <MessageCircle className="h-4 w-4 text-green-600" />
              <span>AI Assistant Ready</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
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