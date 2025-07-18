// Types untuk aplikasi POS
export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  stock?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  amountPaid: number;
  change: number;
  paymentMethod: 'cash';
  timestamp: Date;
  receiptNumber: string;
}

export interface PaymentData {
  total: number;
  amountPaid: number;
  change: number;
}
