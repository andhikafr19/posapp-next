import { Product } from '@/types/pos';

// Mock data produk untuk POS
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Nasi Gudeg',
    price: 15000,
    description: 'Nasi gudeg khas Yogyakarta dengan ayam',
    category: 'Makanan',
    stock: 30
  },
  {
    id: '2',
    name: 'Ayam Bakar',
    price: 25000,
    description: 'Ayam bakar bumbu kecap dengan lalapan',
    category: 'Makanan',
    stock: 15
  },
  {
    id: '3',
    name: 'Gado-gado',
    price: 12000,
    description: 'Gado-gado sayuran segar dengan bumbu kacang',
    category: 'Makanan',
    stock: 25
  },
  {
    id: '4',
    name: 'Es Teh Manis',
    price: 5000,
    description: 'Es teh manis segar',
    category: 'Minuman',
    stock: 50
  },
  {
    id: '5',
    name: 'Es Jeruk',
    price: 8000,
    description: 'Es jeruk peras asli',
    category: 'Minuman',
    stock: 30
  },
  {
    id: '6',
    name: 'Kopi Hitam',
    price: 7000,
    description: 'Kopi hitam robusta pilihan',
    category: 'Minuman',
    stock: 40
  },
  {
    id: '7',
    name: 'Pisang Goreng',
    price: 8000,
    description: 'Pisang goreng crispy dengan gula halus',
    category: 'Snack',
    stock: 20
  },
  {
    id: '8',
    name: 'Tahu Isi',
    price: 6000,
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
