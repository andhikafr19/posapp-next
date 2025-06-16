'use client';

import React, { useState, useEffect } from 'react';
import { PaymentData } from '@/types/pos';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentData: PaymentData) => void;
  totalAmount: number;
}

// Komponen modal untuk input pembayaran cash dan hitung kembalian
const PaymentModal = ({ isOpen, onClose, onConfirm, totalAmount }: PaymentModalProps) => {
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset amount paid when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmountPaid('');
    }
  }, [isOpen]);

  // Format harga ke Rupiah
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  // Hitung kembalian
  const calculateChange = () => {
    const paid = parseFloat(amountPaid) || 0;
    return Math.max(0, paid - totalAmount);
  };

  // Cek apakah pembayaran cukup
  const isPaymentSufficient = () => {
    const paid = parseFloat(amountPaid) || 0;
    return paid >= totalAmount;
  };

  // Handle input amount dengan validasi
  const handleAmountChange = (value: string) => {
    // Hanya izinkan angka dan titik desimal
    const sanitized = value.replace(/[^0-9.]/g, '');
    setAmountPaid(sanitized);
  };

  // Quick amount buttons
  const quickAmounts = [
    totalAmount, // Exact amount
    Math.ceil(totalAmount / 1000) * 1000, // Round up to nearest thousand
    Math.ceil(totalAmount / 5000) * 5000, // Round up to nearest 5k
    Math.ceil(totalAmount / 10000) * 10000, // Round up to nearest 10k
  ].filter((amount, index, arr) => arr.indexOf(amount) === index); // Remove duplicates

  const handleConfirm = async () => {
    if (!isPaymentSufficient()) return;

    setIsProcessing(true);
    
    // Simulasi processing
    await new Promise(resolve => setTimeout(resolve, 500));

    const paymentData: PaymentData = {
      total: totalAmount,
      amountPaid: parseFloat(amountPaid),
      change: calculateChange()
    };

    onConfirm(paymentData);
    setIsProcessing(false);
  };

  const change = calculateChange();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            💰 Pembayaran Cash
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">          
          {/* Total Amount */}
          <div className="text-center bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-700 mb-1">Total Belanja:</p>
            <p className="text-3xl font-bold text-blue-900">
              {formatPrice(totalAmount)}
            </p>
          </div>          
          {/* Quick Amount Buttons */}
          <div>
            <p className="text-sm font-medium text-gray-800 mb-3">
              💡 Nominal Cepat:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setAmountPaid(amount.toString())}
                  className="p-3 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {formatPrice(amount)}
                </button>
              ))}
            </div>
          </div>{/* Amount Paid Input */}
          <div>
            <label htmlFor="amount-paid" className="block text-sm font-medium text-gray-700 mb-2">
              Uang Diterima:
            </label>
            <input
              id="amount-paid"
              type="text"
              value={amountPaid}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="Masukkan nominal uang..."
              className="w-full px-4 py-3 text-lg text-gray-900 bg-white border-2 border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              autoFocus
            />
            {amountPaid && (
              <p className="mt-2 text-sm text-gray-700 font-medium">
                {formatPrice(parseFloat(amountPaid) || 0)}
              </p>
            )}
          </div>
          {/* Change Calculation */}
          {amountPaid && (
            <div className={`p-4 rounded-lg border-2 ${
              isPaymentSufficient() 
                ? 'bg-green-50 border-green-300' 
                : 'bg-red-50 border-red-300'
            }`}>
              <p className="text-sm font-semibold mb-2 text-gray-800">
                {isPaymentSufficient() ? '✅ Kembalian:' : '❌ Uang Kurang:'}
              </p>
              <p className={`text-2xl font-bold ${
                isPaymentSufficient() ? 'text-green-700' : 'text-red-700'
              }`}>
                {formatPrice(isPaymentSufficient() ? change : Math.abs(change))}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex space-x-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isPaymentSufficient() || isProcessing}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              isPaymentSufficient() && !isProcessing
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? 'Memproses...' : 'Konfirmasi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
