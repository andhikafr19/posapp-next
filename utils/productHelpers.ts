// Helper functions untuk mengelola data produk
import { Product } from '@/types/pos';

// Fungsi untuk mendapatkan semua kategori unik dari array produk
export const getAllCategories = (products: Product[]): string[] => {
  const categories = products.map(product => product.category || 'Lainnya');
  return [...new Set(categories)];
};

// Fungsi untuk mencari produk berdasarkan ID
export const getProductById = (products: Product[], id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

// Fungsi untuk filter produk berdasarkan kategori
export const getProductsByCategory = (products: Product[], category: string): Product[] => {
  return products.filter(product => product.category === category);
};

// Fungsi untuk filter produk berdasarkan search term
export const searchProducts = (products: Product[], searchTerm: string): Product[] => {
  const term = searchTerm.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(term) ||
    product.description?.toLowerCase().includes(term) ||
    product.category?.toLowerCase().includes(term)
  );
};
