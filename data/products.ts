import { Product } from '@/types/pos';

// Mock data produk untuk POS
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Makaroni Original 0',
    price: 14000,
    costPrice: 7000,
    description: 'Berat 200 gram, Makaroni Original Level 0',
    category: 'Makaroni',
    stock: 30
  },
  {
    id: '2',
    name: 'Makaroni Original 1',
    price: 17000,
    costPrice: 8500,
    description: 'Berat 200 gram, Makaroni Original Level 1',
    category: 'Makaroni',
    stock: 15
  },
  {
    id: '3',
    name: 'Makaroni Original 2',
    price: 18000,
    costPrice: 9000,
    description: 'Berat 200 gram, Makaroni Original Level 2',
    category: 'Makaroni',
    stock: 25
  },
  {
    id: '4',
    name: 'Makaroni Original 3',
    price: 19000,
    costPrice: 9500,
    description: 'Berat 200 gram, Makaroni Original Level 3',
    category: 'Makaroni',
    stock: 50
  },
  {
    id: '5',
    name: 'Es Jeruk',
    price: 8000,
    costPrice: 4000, // HPP: Rp 4.000
    description: 'Es jeruk peras asli',
    category: 'Minuman',
    stock: 30
  },
  {
    id: '6',
    name: 'Kopi Hitam',
    price: 7000,
    costPrice: 3000, // HPP: Rp 3.000
    description: 'Kopi hitam robusta pilihan',
    category: 'Minuman',
    stock: 40
  },
  {
    id: '7',
    name: 'Pisang Goreng',
    price: 8000,
    costPrice: 4000, // HPP: Rp 4.000
    description: 'Pisang goreng crispy dengan gula halus',
    category: 'Snack',
    stock: 20
  },
  {
    id: '8',
    name: 'Tahu Isi',
    price: 6000,
    costPrice: 3000, // HPP: Rp 3.000
    description: 'Tahu isi sayuran dengan bumbu kacang',
    category: 'Snack',
    stock: 30
  }
];

// Fungsi helper untuk mencari produk
export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(product => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return mockProducts.filter(product => product.category === category);
};

export const getAllCategories = (): string[] => {
  const categories = mockProducts.map(product => product.category || 'Lainnya');
  return [...new Set(categories)];
};
