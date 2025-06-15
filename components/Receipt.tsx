'use client';

import React from 'react';
import { Transaction } from '@/types/pos';

interface ReceiptProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
  onPrint?: () => void;
}

// Komponen untuk menampilkan dan print receipt/nota
const Receipt = ({ transaction, isOpen, onClose, onPrint }: ReceiptProps) => {
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
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      // Default print functionality
      window.print();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            🧾 Nota Pembelian
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-6" id="receipt-content">
          {/* Store Header */}
          <div className="text-center mb-6 border-b border-dashed border-gray-300 pb-4">
            <h1 className="text-lg font-bold text-gray-800">WARUNG SEMBAKO</h1>
            <p className="text-sm text-gray-600">Jl. Contoh No. 123, Kota</p>
            <p className="text-sm text-gray-600">Telp: 0812-3456-7890</p>
          </div>

          {/* Transaction Info */}
          <div className="mb-4 text-sm space-y-1">
            <div className="flex justify-between">
              <span>No. Nota:</span>
              <span className="font-mono">{transaction.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Tanggal:</span>
              <span>{formatDateTime(transaction.timestamp)}</span>
            </div>
            <div className="flex justify-between">
              <span>Kasir:</span>
              <span>Admin</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-b border-dashed border-gray-300 my-4"></div>

          {/* Items */}
          <div className="mb-4">
            {transaction.items.map((item, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.product.name}</p>
                    <p className="text-xs text-gray-600">
                      {formatPrice(item.product.price)} x {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-b border-dashed border-gray-300 my-4"></div>

          {/* Payment Summary */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatPrice(transaction.total)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base border-t border-gray-300 pt-2">
              <span>TOTAL:</span>
              <span>{formatPrice(transaction.total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Bayar:</span>
              <span>{formatPrice(transaction.amountPaid)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Kembali:</span>
              <span>{formatPrice(transaction.change)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 pt-4 border-t border-dashed border-gray-300 text-xs text-gray-600">
            <p>Terima kasih atas kunjungan Anda!</p>
            <p>Barang yang sudah dibeli tidak dapat dikembalikan</p>
            <p className="mt-2">*** SIMPAN NOTA INI ***</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 flex space-x-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            🖨️ Print Nota
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
