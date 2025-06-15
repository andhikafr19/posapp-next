'use client';

import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { PaymentData, Transaction } from '@/types/pos';
import CartItem from './CartItem';
import PaymentModal from './PaymentModal';
import Receipt from './Receipt';

// Komponen Cart untuk menampilkan isi keranjang dan checkout
const Cart = () => {
  const { cart, clearCart, getItemCount, completeTransaction } = useCart();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  // Format harga ke Rupiah
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) return;
    setIsPaymentModalOpen(true);
  };

  const handlePaymentConfirm = (paymentData: PaymentData) => {
    // Complete transaction and get the transaction object
    const transaction = completeTransaction(paymentData);
    setLastTransaction(transaction);
    
    // Close payment modal and show receipt
    setIsPaymentModalOpen(false);
    setIsReceiptOpen(true);
  };

  const handleCloseReceipt = () => {
    setIsReceiptOpen(false);
    setLastTransaction(null);
  };

  const itemCount = getItemCount();
  const isEmpty = cart.items.length === 0;

  return (
    <>
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Keranjang Belanja
            {itemCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full">
                {itemCount}
              </span>
            )}
          </h2>
        </div>

        {/* Cart Content */}
        <div className="max-h-96 overflow-y-auto">
          {isEmpty ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">🛒</div>
              <p>Keranjang Anda masih kosong</p>
              <p className="text-sm mt-1">
                Tambahkan produk untuk memulai pembelian
              </p>
            </div>
          ) : (
            <div>
              {cart.items.map((item) => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer dengan Total dan Checkout */}
        {!isEmpty && (
          <div className="p-4 border-t border-gray-200">
            {/* Total */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-800">
                Total:
              </span>
              <span className="text-xl font-bold text-green-600">
                {formatPrice(cart.total)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className="w-full py-3 px-4 rounded-md font-medium bg-green-600 text-white hover:bg-green-700 active:bg-green-800 transition-colors"
              >
                💰 Bayar Sekarang
              </button>
              
              <button
                onClick={clearCart}
                className="w-full py-2 px-4 rounded-md font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                Kosongkan Keranjang
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirm={handlePaymentConfirm}
        totalAmount={cart.total}
      />

      {/* Receipt Modal */}
      {lastTransaction && (
        <Receipt
          transaction={lastTransaction}
          isOpen={isReceiptOpen}
          onClose={handleCloseReceipt}
        />
      )}
    </>
  );
};

export default Cart;
