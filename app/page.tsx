'use client';

import React from 'react';
import ProductGrid from '@/components/ProductGrid';
import Cart from '@/components/Cart';
import TransactionHistory from '@/components/TransactionHistory';
import ProductManagement from '@/components/ProductManagement';
import Analytics from '@/components/Analytics';
import UserManagement from '@/components/UserManagement';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserProfile from '@/components/UserProfile';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function POSPage() {
  const { cart, transactions } = useCart();
  const { state } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'pos' | 'products' | 'analytics' | 'history' | 'users'>('pos');
  const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);

  // Function untuk check apakah transaksi adalah hari ini
  const isToday = (date: Date | string) => {
    try {
      let transactionDate: Date;
      
      if (typeof date === 'string') {
        transactionDate = new Date(date);
      } else {
        transactionDate = date;
      }
      
      // Handle invalid dates
      if (isNaN(transactionDate.getTime())) {
        console.warn('Invalid date detected:', date);
        return false;
      }
      
      const today = new Date();
      
      // Compare dates (ignore time) using toDateString for accurate comparison
      return transactionDate.toDateString() === today.toDateString();
    } catch (error) {
      console.error('Error parsing date:', date, error);
      return false;
    }
  };

  // Filter transaksi hari ini saja
  const todayTransactions = transactions.filter(transaction => isToday(transaction.createdAt));
  
  // Hitung total penjualan hari ini (hanya dari transaksi hari ini)
  const todayTotal = todayTransactions.reduce((sum, transaction) => sum + transaction.totalAmount, 0);
  const todayCount = todayTransactions.length;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  🏪 POS App
                </h1>
                <span className="ml-3 text-sm text-gray-500">
                  Point of Sale System
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Items in cart:{' '}
                  <span className="ml-1 font-semibold text-blue-600">
                    {itemCount}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Sales today:{' '}
                  <span className="ml-1 font-semibold text-green-600">
                    {formatPrice(todayTotal)}
                  </span>
                  <span className="ml-1 text-xs text-gray-500">
                    ({todayCount} trans)
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Total transactions:{' '}
                  <span className="ml-1 font-semibold text-purple-600">
                    {transactions.length}
                  </span>
                </div>
                
                {/* User Profile Component */}
                <UserProfile />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('pos')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'pos'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  🏪 Point of Sale
                </button>
                
                {/* Product Management - Only for admin and manager */}
                {state.user && (state.user.role === 'admin' || state.user.role === 'manager') && (
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'products'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📦 Manajemen Produk
                  </button>
                )}
                
                {/* Analytics - Only for admin and manager */}
                {state.user && (state.user.role === 'admin' || state.user.role === 'manager') && (
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'analytics'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📊 Analytics
                  </button>
                )}
                
                {/* User Management - Only for admin */}
                {state.user && state.user.role === 'admin' && (
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'users'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    👥 Manajemen User
                  </button>
                )}
                
                <button
                  onClick={() => setActiveTab('history')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'history'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📊 Riwayat Transaksi ({transactions.length})
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'pos' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Products Section - Takes 2/3 of the width on large screens */}
              <div className="lg:col-span-2">
                <ProductGrid />
              </div>

              {/* Cart Section - Takes 1/3 of the width on large screens */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <Cart />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (state.user?.role === 'admin' || state.user?.role === 'manager') && (
            <div className="max-w-6xl mx-auto">
              <ProductManagement />
            </div>
          )}

          {activeTab === 'analytics' && (state.user?.role === 'admin' || state.user?.role === 'manager') && (
            <div className="max-w-7xl mx-auto">
              <Analytics transactions={transactions} />
            </div>
          )}

          {activeTab === 'users' && state.user?.role === 'admin' && (
            <div className="max-w-6xl mx-auto">
              <UserManagement />
            </div>
          )}
          
          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto">
              <TransactionHistory transactions={transactions} />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-gray-500 text-sm">
              <p>© 2025 POS App - Aplikasi Point of Sale</p>
              {state.user && (
                <p className="text-xs mt-1">
                  Logged in as: <span className="font-medium">{state.user.fullName || state.user.username}</span> ({state.user.role})
                </p>
              )}
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
