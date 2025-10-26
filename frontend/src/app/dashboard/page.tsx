'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/dashboard/Header';
import Dashboard from '@/components/dashboard/Dashboard';
import ChatInterface from '@/components/chat/ChatInterface';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Dashboard Content - 2/3 width on large screens */}
            <div className="lg:col-span-2">
              <Dashboard />
            </div>
            
            {/* Chat Interface - 1/3 width on large screens */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <ChatInterface />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}