'use client';

import React from 'react';
import { CartItem as CartItemType } from '@/types/pos';
import { useCart } from '@/contexts/CartContext';

interface CartItemProps {
  item: CartItemType;
}

// Komponen untuk menampilkan item di dalam keranjang
const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeFromCart } = useCart();

  // Format harga ke Rupiah
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(item.product.id, newQuantity);
  };

  const handleRemove = () => {
    removeFromCart(item.product.id);
  };

  const subtotal = item.product.price * item.quantity;

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-200 last:border-b-0">
      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {item.product.name}
        </h4>
        <p className="text-sm text-gray-500">
          {formatPrice(item.product.price)} / item
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2 ml-4">
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
          aria-label="Kurangi quantity"
        >
          −
        </button>
        
        <span className="w-8 text-center font-medium">
          {item.quantity}
        </span>
        
        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
          aria-label="Tambah quantity"
        >
          +
        </button>
      </div>

      {/* Subtotal and Remove */}
      <div className="text-right ml-4">
        <div className="text-sm font-medium text-gray-900">
          {formatPrice(subtotal)}
        </div>
        <button
          onClick={handleRemove}
          className="text-xs text-red-600 hover:text-red-800 mt-1"
        >
          Hapus
        </button>
      </div>
    </div>
  );
};

export default CartItem;
