'use client';

import React, { useState } from 'react';
import { Transaction } from '@/types/pos';
import Receipt from './Receipt';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onClearHistory?: () => void;
}

// Komponen untuk menampilkan riwayat transaksi
const TransactionHistory = ({ transactions, onClearHistory }: TransactionHistoryProps) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Format harga ke Rupiah
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  // Format tanggal dan waktu dengan validasi
  const formatDateTime = (date: Date | string) => {
    try {
      // Convert to Date object if it's a string
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }

      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj);
    } catch {
      return 'Invalid Date';
    }
  };

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

  // Group transaksi berdasarkan hari
  const todayTransactions = transactions.filter(transaction => isToday(transaction.timestamp));
  const previousTransactions = transactions.filter(transaction => !isToday(transaction.timestamp));

  // Hitung total penjualan hari ini dan keseluruhan
  const todayTotal = todayTransactions.reduce((sum, transaction) => sum + transaction.total, 0);
  const totalOverall = transactions.reduce((sum, transaction) => sum + transaction.total, 0);
  const todayCount = todayTransactions.length;
  const totalCount = transactions.length;

  const handleViewReceipt = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsReceiptOpen(true);
  };

  const handleCloseReceipt = () => {
    setIsReceiptOpen(false);
    setSelectedTransaction(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            📊 Riwayat Transaksi
          </h2>
          {onClearHistory && transactions.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Hapus Semua
            </button>
          )}
        </div>
        
        {/* Summary */}
        {transactions.length > 0 && (
          <div className="mt-3 space-y-3">
            {/* Today's Summary */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-blue-600 font-medium">Transaksi Hari Ini</p>
                <p className="text-xl font-bold text-blue-800">{todayCount}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-green-600 font-medium">Penjualan Hari Ini</p>
                <p className="text-lg font-bold text-green-800">
                  {formatPrice(todayTotal)}
                </p>
              </div>
            </div>
            
            {/* Overall Summary */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-600 font-medium">Total Transaksi</p>
                <p className="text-lg font-bold text-gray-800">{totalCount}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-purple-600 font-medium">Total Penjualan</p>
                <p className="text-lg font-bold text-purple-800">
                  {formatPrice(totalOverall)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="max-h-96 overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p>Belum ada transaksi</p>
            <p className="text-sm mt-1">
              Transaksi akan muncul setelah checkout
            </p>
          </div>
        ) : (
          <div className="p-2">
            {/* Today's Transactions */}
            {todayTransactions.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center mb-3 px-2">
                  <div className="text-sm font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                    🟢 Hari Ini ({todayTransactions.length} transaksi)
                  </div>
                </div>
                {todayTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-3 mb-2 border border-green-200 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-mono text-gray-600">
                            #{transaction.receiptNumber}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(transaction.timestamp)}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          {transaction.items.length} item(s) - {' '}
                          {transaction.items.slice(0, 2).map(item => item.product.name).join(', ')}
                          {transaction.items.length > 2 && '...'}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <div>
                            <span className="text-gray-600">Total: </span>
                            <span className="font-semibold text-green-600">
                              {formatPrice(transaction.total)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Bayar: </span>
                            <span>{formatPrice(transaction.amountPaid)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Kembali: </span>
                            <span>{formatPrice(transaction.change)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleViewReceipt(transaction)}
                        className="ml-3 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Lihat Nota
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Previous Transactions */}
            {previousTransactions.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center mb-3 px-2">
                  <div className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    📅 Transaksi Sebelumnya ({previousTransactions.length})
                  </div>
                </div>
                {previousTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-3 mb-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-mono text-gray-600">
                            #{transaction.receiptNumber}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(transaction.timestamp)}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          {transaction.items.length} item(s) - {' '}
                          {transaction.items.slice(0, 2).map(item => item.product.name).join(', ')}
                          {transaction.items.length > 2 && '...'}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <div>
                            <span className="text-gray-600">Total: </span>
                            <span className="font-semibold text-gray-600">
                              {formatPrice(transaction.total)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Bayar: </span>
                            <span>{formatPrice(transaction.amountPaid)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Kembali: </span>
                            <span>{formatPrice(transaction.change)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleViewReceipt(transaction)}
                        className="ml-3 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Lihat Nota
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {selectedTransaction && (
        <Receipt
          transaction={selectedTransaction}
          isOpen={isReceiptOpen}
          onClose={handleCloseReceipt}
        />
      )}
    </div>
  );
};

export default TransactionHistory;
