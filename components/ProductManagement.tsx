'use client';

import React, { useState } from 'react';
import { Product } from '@/types/pos';
import { useCart } from '@/contexts/CartContext';
import { getAllCategories } from '@/data/products';

// Komponen untuk mengelola produk (CRUD operations)
const ProductManagement = () => {
  const { 
    products, 
    updateProduct, 
    addProduct, 
    deleteProduct,
    updateProductStock 
  } = useCart();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    costPrice: 0,
    description: '',
    category: '',
    stock: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const categories = ['Semua', ...getAllCategories()];

  // Filter produk berdasarkan pencarian dan kategori
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Format harga ke Rupiah
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  // Generate ID baru untuk produk
  const generateNewId = (): string => {
    const maxId = Math.max(...products.map(p => parseInt(p.id) || 0));
    return (maxId + 1).toString();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      costPrice: 0,
      description: '',
      category: '',
      stock: 0
    });
    setEditingProduct(null);
  };

  // Buka modal untuk tambah produk
  const handleAddProduct = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Buka modal untuk edit produk
  const handleEditProduct = (product: Product) => {
    setFormData({ ...product });
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  // Simpan produk (add atau update)
  const handleSaveProduct = () => {
    if (!formData.name || !formData.price || formData.price <= 0) {
      alert('Nama produk dan harga harus diisi dengan benar!');
      return;
    }

    const productData: Product = {
      id: editingProduct ? editingProduct.id : generateNewId(),
      name: formData.name.trim(),
      price: Number(formData.price),
      costPrice: Number(formData.costPrice) || undefined,
      description: formData.description?.trim() || '',
      category: formData.category?.trim() || 'Umum',
      stock: Number(formData.stock) || 0
    };

    if (editingProduct) {
      updateProduct(productData);
    } else {
      addProduct(productData);
    }

    setIsModalOpen(false);
    resetForm();
  };

  // Hapus produk dengan konfirmasi
  const handleDeleteProduct = (product: Product) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus produk "${product.name}"?`)) {
      deleteProduct(product.id);
    }
  };

  // Update stock langsung
  const handleStockUpdate = (productId: string, newStock: number) => {
    if (newStock < 0) return;
    updateProductStock(productId, newStock);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            📦 Manajemen Produk
          </h2>
          <button
            onClick={handleAddProduct}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          >
            ➕ Tambah Produk
          </button>
        </div>

        {/* Search dan Filter */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-lg">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Product Count */}
        <div className="mt-4 text-sm text-gray-600">
          Menampilkan {filteredProducts.length} dari {products.length} produk
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak ada produk ditemukan
            </h3>
            <p className="text-gray-500">
              {searchTerm ? `Tidak ada produk yang cocok dengan "${searchTerm}"` : 'Belum ada produk yang ditambahkan'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Produk</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Kategori</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Harga Jual</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">HPP</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Margin</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Stok</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-gray-500 mt-1">{product.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.category || 'Umum'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {product.costPrice ? formatPrice(product.costPrice) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.costPrice ? (
                        <span className={`text-sm font-medium ${
                          ((product.price - product.costPrice) / product.price * 100) >= 30 
                            ? 'text-green-600' 
                            : ((product.price - product.costPrice) / product.price * 100) >= 15
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {((product.price - product.costPrice) / product.price * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleStockUpdate(product.id, (product.stock || 0) - 1)}
                          disabled={(product.stock || 0) <= 0}
                          className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          -
                        </button>                        <span className={`min-w-[3rem] text-center font-medium ${
                          (() => {
                            const stock = product.stock || 0;
                            if (stock === 0) return 'text-red-600';
                            if (stock <= 5) return 'text-yellow-600';
                            return 'text-green-600';
                          })()
                        }`}>
                          {product.stock || 0}
                        </span>
                        <button
                          onClick={() => handleStockUpdate(product.id, (product.stock || 0) + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal untuk Add/Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingProduct ? '✏️ Edit Produk' : '➕ Tambah Produk'}
              </h3>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Nama Produk */}
              <div>
                <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Produk *
                </label>
                <input
                  id="product-name"
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama produk..."
                  className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Harga Jual */}
              <div>
                <label htmlFor="product-price" className="block text-sm font-medium text-gray-700 mb-2">
                  Harga Jual *
                </label>
                <input
                  id="product-price"
                  type="number"
                  min="0"
                  step="100"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* HPP (Harga Pokok Penjualan) */}
              <div>
                <label htmlFor="product-cost-price" className="block text-sm font-medium text-gray-700 mb-2">
                  HPP - Harga Pokok Penjualan (opsional)
                </label>
                <input
                  id="product-cost-price"
                  type="number"
                  min="0"
                  step="100"
                  value={formData.costPrice || ''}
                  onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                {formData.price && formData.costPrice && formData.price > formData.costPrice && (
                  <p className="mt-2 text-sm text-gray-600">
                    Margin laba: <span className="font-semibold text-green-600">
                      {((formData.price - formData.costPrice) / formData.price * 100).toFixed(1)}%
                    </span>
                    {' '}({formatPrice(formData.price - formData.costPrice)} per unit)
                  </p>
                )}
              </div>

              {/* Kategori */}
              <div>
                <label htmlFor="product-category" className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <input
                  id="product-category"
                  type="text"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Masukkan kategori..."
                  className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Stok */}
              <div>
                <label htmlFor="product-stock" className="block text-sm font-medium text-gray-700 mb-2">
                  Stok
                </label>
                <input
                  id="product-stock"
                  type="number"
                  min="0"
                  value={formData.stock || ''}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label htmlFor="product-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  id="product-description"
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi produk (opsional)..."
                  className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveProduct}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
