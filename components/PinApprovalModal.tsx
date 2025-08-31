'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface PinApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApproved: (approvalData: any) => void;
  transactionAmount: number;
  discountPercentage: number;
}

const PinApprovalModal: React.FC<PinApprovalModalProps> = ({
  isOpen,
  onClose,
  onApproved,
  transactionAmount,
  discountPercentage
}) => {
  const { state } = useAuth();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const discountAmount = Math.round(transactionAmount * (discountPercentage / 100));
  const newTotal = transactionAmount - discountAmount;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pin.trim()) {
      setError('PIN harus diisi');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Get token from localStorage or AuthContext
      const token = localStorage.getItem('auth_token') || state.token;
      
      if (!token) {
        setError('Session expired, silakan login ulang');
        return;
      }

      const response = await fetch('/api/approve-discount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pin: pin.trim(),
          transactionAmount,
          discountPercentage,
          discountAmount,
          newTotal
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal memproses approval');
      }

      // Success - call parent callback with approval data
      onApproved({
        adminId: result.data.adminId,
        adminUsername: result.data.adminUsername,
        approvalTimestamp: new Date(),
        discountAmount,
        discountPercentage,
        originalTotal: transactionAmount,
        newTotal
      });

    } catch (error) {
      console.error('PIN approval error:', error);
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan sistem');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only numbers
    if (value.length <= 6) { // Max 6 digits
      setPin(value);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                🔐 Approval Diskon Member
              </h3>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {/* Discount Summary */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Ringkasan Diskon</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Subtotal:</span>
                  <span className="font-medium">{formatPrice(transactionAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Diskon ({discountPercentage}%):</span>
                  <span className="font-medium text-green-600">-{formatPrice(discountAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-1">
                  <span className="text-blue-700 font-medium">Total Setelah Diskon:</span>
                  <span className="font-bold text-lg">{formatPrice(newTotal)}</span>
                </div>
              </div>
            </div>

            {/* PIN Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="admin-pin" className="block text-sm font-medium text-gray-700 mb-2">
                  Masukkan PIN Admin/Manager
                </label>
                <input
                  id="admin-pin"
                  type="password"
                  value={pin}
                  onChange={handlePinChange}
                  placeholder="••••••"
                  maxLength={6}
                  className="w-full px-4 py-3 text-center text-black text-xl font-mono border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  PIN harus 6 digit untuk approval diskon member
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                </div>
              )}

              {/* Current User Info */}
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                Diminta oleh: <span className="font-medium">{state.user?.fullName || state.user?.username}</span> ({state.user?.role})
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading || !pin.trim() || pin.length < 4}
              className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memproses...
                </span>
              ) : (
                'Approve Diskon'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinApprovalModal;
