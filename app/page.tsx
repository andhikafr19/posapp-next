'use client';

import React from 'react';
import ProductGrid from '@/components/ProductGrid';
import Cart from '@/components/Cart';
import TransactionHistory from '@/components/TransactionHistory';
import { DataManagement } from '@/components/DataManagement';
import ProductManagement from '@/components/ProductManagement';
import { useCart } from '@/contexts/CartContext';

export default function POSPage() {
  const { getItemCount, transactions } = useCart();
  const [activeTab, setActiveTab] = React.useState<'pos' | 'products' | 'history' | 'data'>('pos');
  const itemCount = getItemCount();

  // Function untuk check apakah transaksi adalah hari ini
  const isToday = (date: Date | string) => {
    try {
      const transactionDate = typeof date === 'string' ? new Date(date) : date;
      const today = new Date();
      
      return (
        transactionDate.getDate() === today.getDate() &&
        transactionDate.getMonth() === today.getMonth() &&
        transactionDate.getFullYear() === today.getFullYear()
      );
    } catch {
      return false;
    }
  };

  // Filter transaksi hari ini saja
  const todayTransactions = transactions.filter(transaction => isToday(transaction.timestamp));
  
  // Hitung total penjualan hari ini (hanya dari transaksi hari ini)
  const todayTotal = todayTransactions.reduce((sum, transaction) => sum + transaction.total, 0);
  const todayCount = todayTransactions.length;

  // Handle data imported - refresh the page to reload data from localStorage
  const handleDataImported = () => {
    window.location.reload();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  return (
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
              <button
                onClick={() => setActiveTab('data')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'data'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                💾 Data Management
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

        {activeTab === 'products' && (
          <div className="max-w-6xl mx-auto">
            <ProductManagement />
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto">
            <TransactionHistory transactions={transactions} />
          </div>
        )}
        
        {activeTab === 'data' && (
          <div className="max-w-2xl mx-auto">
            <DataManagement onDataImported={handleDataImported} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2025 POS App - Aplikasi Point of Sale</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
