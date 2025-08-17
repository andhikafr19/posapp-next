import { Product } from '../types/pos';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}

class ApiClient {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Products API
  async getProducts(filters?: {
    category?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<ApiResponse<Product[]>> {
    const params = new URLSearchParams();
    
    if (filters?.category) params.append('category', filters.category);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

    return this.request<Product[]>(endpoint);
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${id}`);
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<ApiResponse<Product>> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: string, hardDelete: boolean = false): Promise<ApiResponse<void>> {
    const endpoint = `/products/${id}${hardDelete ? '?hard=true' : ''}`;
    return this.request<void>(endpoint, {
      method: 'DELETE',
    });
  }

  // Transactions API
  async getTransactions(filters?: {
    startDate?: Date;
    endDate?: Date;
    paymentMethod?: string;
    buyerName?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    
    if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
    if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
    if (filters?.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    if (filters?.buyerName) params.append('buyerName', filters.buyerName);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    const endpoint = `/transactions${queryString ? `?${queryString}` : ''}`;

    return this.request<any[]>(endpoint);
  }

  async createTransaction(transaction: any): Promise<ApiResponse<any>> {
    return this.request<any>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  // Analytics API
  async getAnalytics(startDate?: Date, endDate?: Date): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    const queryString = params.toString();
    const endpoint = `/analytics${queryString ? `?${queryString}` : ''}`;

    return this.request<any>(endpoint);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request<any>('/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Backward compatibility functions
export const fetchProducts = () => apiClient.getProducts();
export const createProduct = (product: Omit<Product, 'id'>) => apiClient.createProduct(product);
export const updateProduct = (id: string, product: Partial<Product>) => apiClient.updateProduct(id, product);
export const deleteProduct = (id: string) => apiClient.deleteProduct(id);

export const fetchTransactions = () => apiClient.getTransactions();
export const createTransaction = (transaction: any) => apiClient.createTransaction(transaction);

export const fetchAnalytics = () => apiClient.getAnalytics();
