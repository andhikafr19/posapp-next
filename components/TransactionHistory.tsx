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

  // Format tanggal dan waktu
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Hitung total penjualan hari ini
  const todayTotal = transactions.reduce((sum, transaction) => sum + transaction.total, 0);
  const todayCount = transactions.length;

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
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-blue-600 font-medium">Total Transaksi</p>
              <p className="text-xl font-bold text-blue-800">{todayCount}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-green-600 font-medium">Total Penjualan</p>
              <p className="text-lg font-bold text-green-800">
                {formatPrice(todayTotal)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="max-h-96 overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p>Belum ada transaksi hari ini</p>
            <p className="text-sm mt-1">
              Transaksi akan muncul setelah checkout
            </p>
          </div>
        ) : (
          <div className="p-2">
            {transactions.map((transaction) => (
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
                    className="ml-4 px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                  >
                    Lihat Nota
                  </button>
                </div>
              </div>
            ))}
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
