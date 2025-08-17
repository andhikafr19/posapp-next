// Types untuk aplikasi POS
export interface Product {
  id: string;
  name: string;
  price: number; // Harga Jual
  costPrice?: number; // HPP (Harga Pokok Penjualan)
  description?: string;
  category?: string;
  stock?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CartItem {
  id: string; // Product ID
  name: string;
  price: number;
  quantity: number;
  product: Product;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface Transaction {
  id: string;
  receiptNumber: string;
  items: CartItem[];
  totalAmount: number;
  amountPaid: number;
  changeAmount: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  buyerName?: string;
  buyerAddress?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt?: Date;
}

export interface PaymentData {
  amountPaid: number;
  changeAmount: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  buyerName?: string;
  buyerAddress?: string;
}
