// localStorage utilities untuk POS App
import { Product, Transaction } from '@/types/pos';

const STORAGE_KEYS = {
  PRODUCTS: 'pos_products',
  TRANSACTIONS: 'pos_transactions',
  SETTINGS: 'pos_settings'
} as const;

interface POSSettings {
  lowStockThreshold: number;
  storeName: string;
  autoBackup: boolean;
}

interface BackupData {
  products: Product[] | null;
  transactions: Transaction[];
  settings: POSSettings;
  exportDate: string;
}

// Product persistence
export const saveProductsToStorage = (products: Product[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (error) {
    console.error('Failed to save products to localStorage:', error);
  }
};

export const loadProductsFromStorage = (): Product[] | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load products from localStorage:', error);
    return null;
  }
};

// Transaction persistence
export const saveTransactionsToStorage = (transactions: Transaction[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (error) {
    console.error('Failed to save transactions to localStorage:', error);
  }
};

export const loadTransactionsFromStorage = (): Transaction[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load transactions from localStorage:', error);
    return [];
  }
};

// Settings persistence
export const saveSettingsToStorage = (settings: POSSettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error);
  }
};

export const loadSettingsFromStorage = (): POSSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return stored ? JSON.parse(stored) : {
      lowStockThreshold: 5,
      storeName: 'Warung Sembako',
      autoBackup: true
    };
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error);
    return {
      lowStockThreshold: 5,
      storeName: 'Warung Sembako',
      autoBackup: true
    };
  }
};

// Backup utilities
export const exportDataToJSON = () => {
  const data: BackupData = {
    products: loadProductsFromStorage(),
    transactions: loadTransactionsFromStorage(),
    settings: loadSettingsFromStorage(),
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pos-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importDataFromJSON = (file: File): Promise<BackupData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.products) saveProductsToStorage(data.products);
        if (data.transactions) saveTransactionsToStorage(data.transactions);
        if (data.settings) saveSettingsToStorage(data.settings);
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
