'use client';

import React, { useState } from 'react';
import { Product } from '@/types/pos';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

// Komponen untuk menampilkan card produk
const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, getProductById, isLowStock } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);

  // Get current product data from context (updated stock)
  const currentProduct = getProductById(product.id) || product;
  const lowStock = isLowStock(product.id);
  const outOfStock = currentProduct.stock === 0;

  // Format harga ke Rupiah
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    
    // Add a small delay for UX
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const success = addToCart(currentProduct);
    if (!success) {
      // Could show a toast notification here
      alert('Stok tidak mencukupi!');
    }
    
    setAddingToCart(false);
  };

  // Get stock status styling
  const getStockStatusStyle = () => {
    if (outOfStock) {
      return 'bg-red-100 text-red-800';
    } else if (lowStock) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
  };
  const getStockTextStyle = () => {
    if (outOfStock) return 'text-red-500';
    if (lowStock) return 'text-yellow-600';
    return 'text-gray-500';
  };

  const getButtonStyle = () => {
    if (outOfStock) return 'bg-gray-300 text-gray-500 cursor-not-allowed';
    if (addingToCart) return 'bg-blue-400 text-white cursor-not-allowed';
    return 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800';
  };
  const getButtonText = () => {
    if (outOfStock) return 'Stok Habis';
    if (addingToCart) return 'Menambahkan...';
    return 'Tambah ke Keranjang';
  };

  const getStockStatusText = () => {
    if (outOfStock) return 'Habis';
    if (lowStock) return 'Stok Menipis';
    return 'Tersedia';
  };
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow ${
      outOfStock ? 'opacity-75' : ''
    }`}>
      {/* Header Card */}
      <div className="mb-3">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-semibold text-gray-800">
            {currentProduct.name}
          </h3>
          {/* Stock Status Badge */}
          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStockStatusStyle()}`}>
            {getStockStatusText()}
          </span>
        </div>
        {currentProduct.category && (
          <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
            {currentProduct.category}
          </span>
        )}
      </div>

      {/* Description */}
      {currentProduct.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {currentProduct.description}
        </p>
      )}

      {/* Price and Stock */}
      <div className="mb-4">
        <div className="text-xl font-bold text-green-600 mb-1">
          {formatPrice(currentProduct.price)}
        </div>        {currentProduct.stock !== undefined && (
          <div className={`text-sm ${getStockTextStyle()}`}>
            Stok: {currentProduct.stock} items
            {lowStock && !outOfStock && (
              <span className="ml-2 text-yellow-600 font-medium">⚠️ Menipis</span>
            )}
          </div>
        )}
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={outOfStock || addingToCart}
        className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${getButtonStyle()}`}
      >
        {getButtonText()}
      </button>
    </div>
  );
};

export default ProductCard;
