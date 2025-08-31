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
  subtotal: number;
  discount: number;
  totalAmount: number;
  amountPaid: number;
  changeAmount: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  buyerName?: string;
  buyerAddress?: string;
  status: 'pending' | 'completed' | 'cancelled';
  discountStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvalTimestamp?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface DiscountApproval {
  id: string;
  transactionId: string;
  adminId: string;
  adminUsername: string;
  discountAmount: number;
  discountPercentage: number;
  originalTotal: number;
  newTotal: number;
  status: 'approved' | 'rejected';
  timestamp: Date;
  notes?: string;
}

export interface PaymentData {
  amountPaid: number;
  changeAmount: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  buyerName?: string;
  buyerAddress?: string;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  fullName?: string;
  role: 'admin' | 'cashier' | 'manager';
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: Date;
}
