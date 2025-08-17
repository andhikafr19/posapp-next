'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect, useMemo } from 'react';
import { Product, CartItem, Cart, Transaction, PaymentData } from '@/types/pos';

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
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'SET_LOADING'; payload: boolean };

// Interface untuk Cart Context
interface CartContextType {
  cart: Cart;
  transactions: Transaction[];
  products: Product[];
  isLoading: boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  completeTransaction: (paymentData: PaymentData) => Promise<void>;
  updateProductStock: (productId: string, newStock: number) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

// State interface
interface CartState {
  cart: Cart;
  transactions: Transaction[];
  products: Product[];
  isLoading: boolean;
}

// Initial state
const initialState: CartState = {
  cart: { items: [], total: 0 },
  transactions: [],
  products: [],
  isLoading: true
};

// Utility function untuk calculate cart total
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

// Cart reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.cart.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        const updatedItems = state.cart.items.map(item =>
          item.id === action.payload.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return {
          ...state,
          cart: {
            items: updatedItems,
            total: calculateTotal(updatedItems)
          }
        };
      } else {
        const newItem: CartItem = {
          id: action.payload.id,
          name: action.payload.name,
          price: action.payload.price,
          quantity: 1,
          product: action.payload
        };
        const updatedItems = [...state.cart.items, newItem];
        return {
          ...state,
          cart: {
            items: updatedItems,
            total: calculateTotal(updatedItems)
          }
        };
      }
    }

    case 'REMOVE_ITEM': {
      const updatedItems = state.cart.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        cart: {
          items: updatedItems,
          total: calculateTotal(updatedItems)
        }
      };
    }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        const updatedItems = state.cart.items.filter(item => item.id !== action.payload.productId);
        return {
          ...state,
          cart: {
            items: updatedItems,
            total: calculateTotal(updatedItems)
          }
        };
      } else {
        const updatedItems = state.cart.items.map(item =>
          item.id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        );
        return {
          ...state,
          cart: {
            items: updatedItems,
            total: calculateTotal(updatedItems)
          }
        };
      }
    }

    case 'CLEAR_CART':
      return {
        ...state,
        cart: { items: [], total: 0 }
      };

    case 'COMPLETE_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload.transaction, ...state.transactions],
        cart: { items: [], total: 0 }
      };

    case 'UPDATE_PRODUCT_STOCK': {
      const updatedProducts = state.products.map(product =>
        product.id === action.payload.productId
          ? { ...product, stock: action.payload.newStock }
          : product
      );
      return {
        ...state,
        products: updatedProducts
      };
    }

    case 'UPDATE_PRODUCT': {
      const updatedProducts = state.products.map(product =>
        product.id === action.payload.id ? action.payload : product
      );
      return {
        ...state,
        products: updatedProducts
      };
    }

    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [action.payload, ...state.products]
      };

    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload)
      };

    case 'SET_PRODUCTS':
      return {
        ...state,
        products: action.payload
      };

    case 'SET_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    default:
      return state;
  }
};

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Custom hook to use cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// API helper functions
const api = {
  // Products API
  async getProducts(): Promise<Product[]> {
    const response = await fetch('/api/products?isActive=true');
    if (!response.ok) throw new Error('Failed to fetch products');
    const result = await response.json();
    return result.data || [];
  },

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
  },

  async updateProduct(product: Product): Promise<Product> {
    const response = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!response.ok) throw new Error('Failed to update product');
    return response.json();
  },

  async deleteProduct(productId: string): Promise<void> {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete product');
  },

  // Transactions API
  async getTransactions(): Promise<Transaction[]> {
    const response = await fetch('/api/transactions');
    if (!response.ok) throw new Error('Failed to fetch transactions');
    const result = await response.json();
    return result.data || [];
  },

  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create transaction');
    }
    const result = await response.json();
    return result.data;
  }
};

// Provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load initial data from database
  const refreshData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const [products, transactions] = await Promise.all([
        api.getProducts(),
        api.getTransactions()
      ]);

      dispatch({ type: 'SET_PRODUCTS', payload: products });
      dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
    } catch (error) {
      console.error('Failed to load data from database:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, []);

  // Cart actions
  const addToCart = (product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
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

  const completeTransaction = async (paymentData: PaymentData) => {
    try {
      // Generate receipt number
      const receiptNumber = `POS-${Date.now()}`;
      
      // Create transaction object
      const transaction: Omit<Transaction, 'id' | 'createdAt'> = {
        receiptNumber,
        items: state.cart.items,
        totalAmount: state.cart.total,
        amountPaid: paymentData.amountPaid,
        changeAmount: paymentData.changeAmount,
        paymentMethod: paymentData.paymentMethod,
        buyerName: paymentData.buyerName,
        buyerAddress: paymentData.buyerAddress,
        status: 'completed'
      };

      // Debug logging
      console.log('Sending transaction data:', JSON.stringify(transaction, null, 2));

      // Save to database - THIS IS THE CRITICAL PART
      const savedTransaction = await api.createTransaction(transaction);

      console.log('Transaction saved successfully:', savedTransaction);

      // Update local state first
      dispatch({ 
        type: 'COMPLETE_TRANSACTION', 
        payload: { 
          paymentData, 
          transaction: savedTransaction 
        } 
      });

      // Update product stock in background - don't let this fail the transaction
      const stockUpdatePromises = state.cart.items.map(async (item) => {
        try {
          const product = state.products.find(p => p.id === item.id);
          if (product?.stock !== undefined) {
            const newStock = Math.max(0, product.stock - item.quantity);
            console.log(`Updating stock for ${product.name}: ${product.stock} -> ${newStock}`);
            await updateProductStock(item.id, newStock);
          }
        } catch (stockError) {
          console.error(`Failed to update stock for product ${item.name} (${item.id}):`, stockError);
          // Don't throw - just log the error
        }
      });

      // Wait for all stock updates but don't fail if some fail
      await Promise.allSettled(stockUpdatePromises);

    } catch (error) {
      console.error('Failed to complete transaction:', error);
      throw error; // Re-throw only critical errors (transaction creation)
    }
  };

  const updateProductStock = async (productId: string, newStock: number) => {
    try {
      const product = state.products.find(p => p.id === productId);
      if (product) {
        const updatedProduct = { ...product, stock: newStock };
        console.log(`Updating product ${productId} stock to ${newStock}`);
        
        // Call API to update product
        const response = await fetch(`/api/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stock: newStock })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update product stock');
        }
        
        const result = await response.json();
        console.log('Stock update result:', result);
        
        // Update local state
        dispatch({ type: 'UPDATE_PRODUCT_STOCK', payload: { productId, newStock } });
      }
    } catch (error) {
      console.error('Failed to update product stock:', error);
      throw error;
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      const updatedProduct = await api.updateProduct(product);
      dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
      // Refresh data to get latest from database
      await refreshData();
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  };

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const newProduct = await api.createProduct(productData);
      dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
      // Refresh data to get latest from database
      await refreshData();
    } catch (error) {
      console.error('Failed to add product:', error);
      throw error;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await api.deleteProduct(productId);
      dispatch({ type: 'DELETE_PRODUCT', payload: productId });
      // Refresh data to get latest from database
      await refreshData();
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  };

  const contextValue: CartContextType = useMemo(() => ({
    cart: state.cart,
    transactions: state.transactions,
    products: state.products,
    isLoading: state.isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    completeTransaction,
    updateProductStock,
    updateProduct,
    addProduct,
    deleteProduct,
    refreshData
  }), [state, addToCart, removeFromCart, updateQuantity, clearCart, completeTransaction, updateProductStock, updateProduct, addProduct, deleteProduct, refreshData]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
