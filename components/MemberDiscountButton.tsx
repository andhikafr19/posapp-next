'use client';

import React, { useState } from 'react';
import PinApprovalModal from './PinApprovalModal';

interface MemberDiscountButtonProps {
  subtotal: number;
  onDiscountApproved: (discount: number, approvalData: any) => void;
  disabled?: boolean;
  discountStatus?: 'none' | 'pending' | 'approved' | 'rejected';
}

const MemberDiscountButton: React.FC<MemberDiscountButtonProps> = ({
  subtotal,
  onDiscountApproved,
  disabled = false,
  discountStatus = 'none'
}) => {
  const [showPinModal, setShowPinModal] = useState(false);

  const handleRequestDiscount = () => {
    if (subtotal <= 0) {
      alert('Tidak ada item dalam transaksi untuk mendapatkan diskon');
      return;
    }
    setShowPinModal(true);
  };

  const handlePinApproved = (approvalData: any) => {
    // Calculate 10% discount
    const discountPercentage = 10;
    const discountAmount = Math.round(subtotal * (discountPercentage / 100));
    
    onDiscountApproved(discountAmount, {
      ...approvalData,
      discountPercentage,
      originalTotal: subtotal,
      newTotal: subtotal - discountAmount
    });
    
    setShowPinModal(false);
  };

  const getButtonText = () => {
    switch (discountStatus) {
      case 'pending':
        return 'Menunggu Approval...';
      case 'approved':
        return 'Diskon Member Approved ✓';
      case 'rejected':
        return 'Diskon Member Ditolak ✗';
      default:
        return 'Ajukan Diskon Member';
    }
  };

  const getButtonStyle = () => {
    switch (discountStatus) {
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'approved':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'rejected':
        return 'bg-red-500 hover:bg-red-600 text-white';
      default:
        return 'bg-blue-500 hover:bg-blue-600 text-white';
    }
  };

  return (
    <>
      <button
        onClick={handleRequestDiscount}
        disabled={disabled || discountStatus === 'approved' || discountStatus === 'pending'}
        className={`
          w-full py-2.5 px-4 rounded-md font-medium transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          ${getButtonStyle()}
        `}
      >
        <div className="flex items-center justify-center space-x-2">
          <span>🎫</span>
          <span>{getButtonText()}</span>
        </div>
      </button>

      {showPinModal && (
        <PinApprovalModal
          isOpen={showPinModal}
          onClose={() => setShowPinModal(false)}
          onApproved={handlePinApproved}
          transactionAmount={subtotal}
          discountPercentage={10}
        />
      )}
    </>
  );
};

export default MemberDiscountButton;
