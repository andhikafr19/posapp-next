'use client';

import React, { useState, useMemo } from 'react';
import { getAllCategories } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import ProductCard from './ProductCard';

// Komponen untuk menampilkan grid produk dengan filter kategori
const ProductGrid = () => {
  const { products } = useCart(); // Use products from context instead of mock data
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = ['Semua', ...getAllCategories()];
  // Filter produk berdasarkan kategori dan search term
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'Semua') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  }, [selectedCategory, searchTerm, products]);

  return (
    <div className="space-y-6">
      {/* Header dengan Search dan Filter */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Daftar Produk
        </h2>
        
        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Produk tidak ditemukan
            </h3>
            <p className="text-gray-500">
              {searchTerm.trim() 
                ? `Tidak ada produk yang cocok dengan "${searchTerm}"`
                : `Tidak ada produk dalam kategori "${selectedCategory}"`
              }
            </p>
          </div>
        )}
      </div>

      {/* Product Count Info */}
      {filteredProducts.length > 0 && (        <div className="text-center text-gray-500 text-sm">
          Menampilkan {filteredProducts.length} dari {products.length} produk
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
