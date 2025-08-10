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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            🧾 Nota Pembelian
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-6" id="receipt-content">          {/* Store Header */}
          <div className="text-center mb-6 border-b border-dashed border-gray-400 pb-4">
            <h1 className="text-xl font-bold text-gray-900">WARUNG SEMBAKO</h1>
            <p className="text-sm text-gray-700">Jl. Contoh No. 123, Kota</p>
            <p className="text-sm text-gray-700">Telp: 0812-3456-7890</p>
          </div>          {/* Transaction Info */}
          <div className="mb-4 text-sm space-y-1">
            <div className="flex justify-between text-gray-900">
              <span className="font-medium">No. Nota:</span>
              <span className="font-mono font-semibold">{transaction.receiptNumber}</span>
            </div>
            {transaction.buyerName && (
            <div className="flex justify-between text-gray-900">
              <span className="font-medium">Pembeli:</span>
              <span className="font-semibold">{transaction.buyerName}</span>
            </div>
            )}
            {transaction.buyerAddress && (
            <div className="flex justify-between text-gray-900">
              <span className="font-medium">Alamat:</span>
              <span className="font-semibold">{transaction.buyerAddress}</span>
            </div>
            )}
            <div className="flex justify-between text-gray-900">
              <span className="font-medium">Tanggal:</span>
              <span className="font-semibold">{formatDateTime(transaction.timestamp)}</span>
            </div>
            <div className="flex justify-between text-gray-900">
              <span className="font-medium">Kasir:</span>
              <span className="font-semibold">Admin</span>
            </div>
          </div>          {/* Divider */}
          <div className="border-b border-dashed border-gray-400 my-4"></div>          {/* Items */}
          <div className="mb-4">
            {transaction.items.map((item) => (
              <div key={`${item.product.id}-${item.quantity}`} className="mb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900">{item.product.name}</p>
                    <p className="text-xs text-gray-700 font-medium">
                      {formatPrice(item.product.price)} x {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-gray-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-b border-dashed border-gray-400 my-4"></div>          {/* Payment Summary */}
          <div className="space-y-2 text-sm text-gray-900">
            <div className="flex justify-between">
              <span className="font-medium">Subtotal:</span>
              <span className="font-semibold">{formatPrice(transaction.total)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-gray-400 pt-2 text-gray-900">
              <span>TOTAL:</span>
              <span>{formatPrice(transaction.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Bayar:</span>
              <span className="font-semibold">{formatPrice(transaction.amountPaid)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Kembali:</span>
              <span className="text-green-700">{formatPrice(transaction.change)}</span>
            </div>
          </div>          {/* Footer */}
          <div className="text-center mt-6 pt-4 border-t border-dashed border-gray-400 text-xs text-gray-700">
            <p className="font-medium">Terima kasih atas kunjungan Anda!</p>
            <p className="text-gray-600">Barang yang sudah dibeli tidak dapat dikembalikan</p>
            <p className="mt-2 font-bold text-gray-800">*** SIMPAN NOTA INI ***</p>
          </div>
        </div>        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 flex space-x-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            🖨️ Print Nota
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
