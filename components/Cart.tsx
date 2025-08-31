'use client';

import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { PaymentData, Transaction } from '@/types/pos';
import CartItem from './CartItem';
import PaymentModal from './PaymentModal';
import Receipt from './Receipt';

// Interface untuk toast notification
interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

// Komponen Cart untuk menampilkan isi keranjang dan checkout
const Cart = () => {
  const { cart, clearCart, completeTransaction } = useCart();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fungsi untuk menampilkan toast notification
  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, type, message };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove toast after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  // Fungsi untuk menghapus toast manual
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

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

  const handlePaymentConfirm = async (paymentData: PaymentData) => {
    if (isProcessing) return; // Prevent double submission
    
    setIsProcessing(true);
    
    try {
      // Complete transaction
      await completeTransaction(paymentData);
      
      // Close payment modal and show receipt
      setIsPaymentModalOpen(false);
      setIsReceiptOpen(true);
      
      // Show success toast
      showToast('success', `✅ Transaksi berhasil! Total: ${formatPrice(cart.total)} | Kembalian: ${formatPrice(paymentData.changeAmount)}`);
      
      // Set the last transaction (we'll get it from the transactions array)
      // Since completeTransaction updates the transactions, we can get the latest one
      // For now, we'll create a mock transaction for the receipt
      const mockTransaction: Transaction = {
        id: `temp-${Date.now()}`,
        receiptNumber: `POS-${Date.now()}`,
        items: cart.items,
        totalAmount: cart.total,
        amountPaid: paymentData.amountPaid,
        changeAmount: paymentData.changeAmount,
        paymentMethod: paymentData.paymentMethod,
        buyerName: paymentData.buyerName,
        buyerAddress: paymentData.buyerAddress,
        status: 'completed',
        createdAt: new Date()
      };
      
      setLastTransaction(mockTransaction);
      
      // Show additional info toast about stock updates (delayed)
      setTimeout(() => {
        showToast('success', '📦 Stok produk sedang diperbarui di background');
      }, 2000);
      
    } catch (error) {
      console.error('Failed to complete transaction:', error);
      
      // Show error toast with specific message
      let errorMessage = 'Terjadi kesalahan sistem';
      
      if (error instanceof Error) {
        if (error.message.includes('Validation error')) {
          errorMessage = 'Data transaksi tidak valid. Mohon periksa kembali produk di keranjang.';
        } else if (error.message.includes('Failed to create transaction')) {
          errorMessage = 'Gagal menyimpan transaksi ke database.';
        } else {
          errorMessage = error.message;
        }
      }
      
      showToast('error', `Transaksi gagal: ${errorMessage}`);
      
      // Keep payment modal open so user can try again
      // setIsPaymentModalOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseReceipt = () => {
    setIsReceiptOpen(false);
    setLastTransaction(null);
  };

  const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
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
                disabled={isProcessing}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                  isProcessing 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
                }`}
              >
                {isProcessing ? '⏳ Memproses...' : '💰 Bayar Sekarang'}
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

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[60] space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`p-4 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform ${
                toast.type === 'success' 
                  ? 'bg-green-500 border-l-4 border-green-700' 
                  : 'bg-red-500 border-l-4 border-red-700'
              } animate-slide-in-left max-w-sm`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <span className="mr-2 mt-0.5 flex-shrink-0">
                    {toast.type === 'success' ? '✓' : '✗'}
                  </span>
                  <span className="text-sm leading-relaxed">{toast.message}</span>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="ml-3 text-white hover:text-gray-200 flex-shrink-0"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
