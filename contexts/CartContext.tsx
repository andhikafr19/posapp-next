'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Product, CartItem, Cart, Transaction, PaymentData } from '@/types/pos';
import { mockProducts } from '@/data/products';
import { 
  saveProductsToStorage, 
  loadProductsFromStorage,
  saveTransactionsToStorage,
  loadTransactionsFromStorage 
} from '@/utils/storage';

// Action types untuk cart reducer
type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'COMPLETE_TRANSACTION'; payload: { paymentData: PaymentData; transaction: Transaction } }
  | { type: 'UPDATE_PRODUCT_STOCK'; payload: { productId: string; newStock: number } }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'HYDRATE_PRODUCTS'; payload: Product[] }
  | { type: 'HYDRATE_TRANSACTIONS'; payload: Transaction[] };

// Interface untuk Cart Context
interface CartContextType {
  cart: Cart;
  transactions: Transaction[];
  products: Product[];
  addToCart: (product: Product) => boolean; // Returns false if insufficient stock
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  completeTransaction: (paymentData: PaymentData) => Transaction;
  clearTransactionHistory: () => void;
  getProductById: (productId: string) => Product | undefined;
  isLowStock: (productId: string, threshold?: number) => boolean;
  // Product management functions
  updateProduct: (product: Product) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  updateProductStock: (productId: string, newStock: number) => void;
}

// Initial state untuk cart dan transactions
interface AppState {
  cart: Cart;
  transactions: Transaction[];
  products: Product[];
}

const initialState: AppState = {
  cart: { items: [], total: 0 },
  transactions: [],
  products: [...mockProducts] // Start with mock data, will be hydrated from localStorage
};

// Generate receipt number
const generateReceiptNumber = (): string => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const time = now.toTimeString().slice(0, 8).replace(/:/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${date}${time}${random}`;
};

// App reducer untuk mengelola state cart dan transactions
const appReducer = (state: AppState, action: CartAction): AppState => {
  switch (action.type) {    case 'ADD_ITEM': {      // Check stock availability in reducer as well (defensive programming)
      const currentProduct = state.products.find(p => p.id === action.payload.id);
      if (!currentProduct?.stock || currentProduct.stock === 0) {
        return state; // Don't add if no stock
      }

      const existingItem = state.cart.items.find(
        item => item.product.id === action.payload.id
      );

      const currentCartQuantity = existingItem ? existingItem.quantity : 0;
      
      // Check if adding one more would exceed stock
      if (currentCartQuantity >= currentProduct.stock) {
        return state; // Don't add if would exceed stock
      }

      let newItems: CartItem[];
      
      if (existingItem) {
        // Jika item sudah ada, tambah quantity
        newItems = state.cart.items.map(item =>
          item.product.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Jika item belum ada, tambah item baru
        newItems = [...state.cart.items, { product: action.payload, quantity: 1 }];
      }

      const total = newItems.reduce(
        (sum, item) => sum + (item.product.price * item.quantity),
        0
      );

      return { 
        ...state, 
        cart: { items: newItems, total } 
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.cart.items.filter(
        item => item.product.id !== action.payload
      );
      
      const total = newItems.reduce(
        (sum, item) => sum + (item.product.price * item.quantity),
        0
      );

      return { 
        ...state, 
        cart: { items: newItems, total } 
      };
    }    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Jika quantity 0 atau negatif, hapus item
        return appReducer(state, { type: 'REMOVE_ITEM', payload: productId });
      }      // Check stock availability
      const currentProduct = state.products.find(p => p.id === productId);
      if (!currentProduct?.stock || quantity > currentProduct.stock) {
        return state; // Don't update if quantity exceeds available stock
      }

      const newItems = state.cart.items.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );

      const total = newItems.reduce(
        (sum, item) => sum + (item.product.price * item.quantity),
        0
      );

      return { 
        ...state, 
        cart: { items: newItems, total } 
      };
    }

    case 'CLEAR_CART':
      return { 
        ...state, 
        cart: { items: [], total: 0 } 
      };    case 'COMPLETE_TRANSACTION': {
      const newTransaction = action.payload.transaction;
        // Update stock for all items in the transaction
      const updatedProducts = state.products.map(product => {
        const soldItem = newTransaction.items.find(item => item.product.id === product.id);
        if (soldItem && product.stock !== undefined) {
          return {
            ...product,
            stock: Math.max(0, product.stock - soldItem.quantity)
          };
        }
        return product;
      });

      return {
        cart: { items: [], total: 0 }, // Clear cart
        transactions: [...state.transactions, newTransaction],
        products: updatedProducts
      };
    }    case 'UPDATE_PRODUCT_STOCK': {
      const { productId, newStock } = action.payload;
      const updatedProducts = state.products.map(product =>
        product.id === productId
          ? { ...product, stock: Math.max(0, newStock) }
          : product
      );      return {
        ...state,
        products: updatedProducts
      };
    }

    case 'UPDATE_PRODUCT': {
      const updatedProducts = state.products.map(product =>
        product.id === action.payload.id
          ? { ...action.payload }
          : product
      );
      return {
        ...state,
        products: updatedProducts
      };
    }

    case 'ADD_PRODUCT': {
      return {
        ...state,
        products: [...state.products, action.payload]
      };
    }

    case 'DELETE_PRODUCT': {
      const filteredProducts = state.products.filter(
        product => product.id !== action.payload
      );
      // Also remove from cart if exists
      const filteredCartItems = state.cart.items.filter(
        item => item.product.id !== action.payload
      );
      const newTotal = filteredCartItems.reduce(
        (sum, item) => sum + (item.product.price * item.quantity),
        0
      );
      return {
        ...state,
        products: filteredProducts,
        cart: { items: filteredCartItems, total: newTotal }
      };
    }

    case 'HYDRATE_PRODUCTS': {
      return {
        ...state,
        products: action.payload
      };
    }

    case 'HYDRATE_TRANSACTIONS': {
      return {
        ...state,
        transactions: action.payload
      };
    }

    default:
      return state;
  }
};

// Create Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart Provider Component
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Load data from localStorage after component mounts (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedProducts = loadProductsFromStorage();
      const storedTransactions = loadTransactionsFromStorage();
      
      // Update state with stored data if available
      if (storedProducts) {
        dispatch({ type: 'HYDRATE_PRODUCTS', payload: storedProducts });
      }
      if (storedTransactions && storedTransactions.length > 0) {
        dispatch({ type: 'HYDRATE_TRANSACTIONS', payload: storedTransactions });
      }
      
      setIsHydrated(true);
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
      setIsHydrated(true);
    }
  }, []);

  // Effect to save data to localStorage when state changes (only after hydration)
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;

    try {
      saveProductsToStorage(state.products);
      saveTransactionsToStorage(state.transactions);
    } catch (error) {
      console.error('Failed to save state to localStorage:', error);
    }
  }, [state.products, state.transactions, isHydrated]);  const addToCart = (product: Product): boolean => {
    // Check stock availability
    const currentProduct = state.products.find(p => p.id === product.id);
    if (!currentProduct?.stock || currentProduct.stock === 0) {
      return false; // No stock available
    }

    const existingCartItem = state.cart.items.find(
      item => item.product.id === product.id
    );
    const currentCartQuantity = existingCartItem ? existingCartItem.quantity : 0;
    
    // Check if adding one more would exceed stock
    if (currentCartQuantity >= currentProduct.stock) {
      return false; // Would exceed available stock
    }

    dispatch({ type: 'ADD_ITEM', payload: product });
    return true; // Successfully added
  };

  const removeFromCart = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemCount = () => {
    return state.cart.items.reduce((count: number, item: CartItem) => count + item.quantity, 0);
  };

  const completeTransaction = (paymentData: PaymentData): Transaction => {
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      items: [...state.cart.items],
      total: paymentData.total,
      amountPaid: paymentData.amountPaid,
      change: paymentData.change,
      paymentMethod: 'cash',
      timestamp: new Date(),
      receiptNumber: generateReceiptNumber(),
      buyerName: paymentData.buyerName,
      buyerAddress: paymentData.buyerAddress
    };

    dispatch({ 
      type: 'COMPLETE_TRANSACTION', 
      payload: { paymentData, transaction } 
    });

    return transaction;
  };
  const clearTransactionHistory = () => {
    // For now, we'll implement this later if needed
    // Could add a new action type for this
  };

  const getProductById = (productId: string): Product | undefined => {
    return state.products.find(product => product.id === productId);
  };  const isLowStock = (productId: string, threshold: number = 5): boolean => {
    const product = getProductById(productId);
    if (!product?.stock) return false;
    return product.stock <= threshold && product.stock > 0;
  };

  // Product management functions
  const updateProduct = (product: Product) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: product });
  };

  const addProduct = (product: Product) => {
    dispatch({ type: 'ADD_PRODUCT', payload: product });
  };

  const deleteProduct = (productId: string) => {
    dispatch({ type: 'DELETE_PRODUCT', payload: productId });
  };

  const updateProductStock = (productId: string, newStock: number) => {
    dispatch({ type: 'UPDATE_PRODUCT_STOCK', payload: { productId, newStock } });
  };  const contextValue = {
    cart: state.cart,
    transactions: state.transactions,
    products: state.products,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemCount,
    completeTransaction,
    clearTransactionHistory,
    getProductById,
    isLowStock,
    updateProduct,
    addProduct,
    deleteProduct,
    updateProductStock
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Hook untuk menggunakan Cart Context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
