import { query, transaction } from '../db';
import { Transaction, CartItem } from '../../types/pos';

export interface TransactionCreateInput {
  receiptNumber?: string;
  items: CartItem[];
  totalAmount: number;
  amountPaid: number;
  changeAmount: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  buyerName?: string;
  buyerAddress?: string;
  status?: 'pending' | 'completed' | 'cancelled';
}

export interface TransactionFilter {
  startDate?: Date;
  endDate?: Date;
  paymentMethod?: string;
  status?: string;
  buyerName?: string;
}

export class TransactionRepository {

  private generateReceiptNumber(): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TXN-${dateStr}-${timeStr}-${randomStr}`;
  }

  async create(data: TransactionCreateInput): Promise<Transaction> {
    return transaction(async (client) => {
      // Generate receipt number
      const receiptNumber = this.generateReceiptNumber();

      // Create transaction
      const transactionSql = `
        INSERT INTO transactions (
          receipt_number, total_amount, amount_paid, change_amount, 
          payment_method, buyer_name, buyer_address, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const transactionParams = [
        data.receiptNumber || receiptNumber,
        data.totalAmount,
        data.amountPaid,
        data.changeAmount,
        data.paymentMethod,
        data.buyerName || null,
        data.buyerAddress || null,
        data.status || 'completed'
      ];

      const transactionResult = await client.query(transactionSql, transactionParams);
      const newTransaction = transactionResult.rows[0];

      // Create transaction items and update stock
      const items: any[] = [];
      
      for (const item of data.items) {
        // Insert transaction item
        const itemSql = `
          INSERT INTO transaction_items (
            transaction_id, product_id, product_name, quantity, 
            unit_price, unit_cost_price, subtotal
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `;

        const subtotal = item.quantity * item.product.price;
        const itemParams = [
          newTransaction.id,
          item.product.id,
          item.product.name,
          item.quantity,
          item.product.price,
          item.product.costPrice || 0,
          subtotal
        ];

        const itemResult = await client.query(itemSql, itemParams);
        items.push({
          product: item.product,
          quantity: item.quantity
        });

        // Update product stock
        const stockUpdateSql = `
          UPDATE products 
          SET stock = stock - $1 
          WHERE id = $2 AND stock >= $1
        `;

        const stockResult = await client.query(stockUpdateSql, [item.quantity, item.product.id]);
        
        if (stockResult.rowCount === 0) {
          throw new Error(`Insufficient stock for product: ${item.product.name}`);
        }
      }

      // Return formatted transaction
      return {
        id: newTransaction.id,
        receiptNumber: newTransaction.receipt_number,
        items: items,
        totalAmount: newTransaction.total_amount,
        amountPaid: newTransaction.amount_paid,
        changeAmount: newTransaction.change_amount,
        paymentMethod: newTransaction.payment_method,
        buyerName: newTransaction.buyer_name,
        buyerAddress: newTransaction.buyer_address,
        status: 'completed' as const,
        createdAt: new Date(newTransaction.created_at), // Convert string to Date object
      };
    });
  }

  async findAll(filter?: TransactionFilter, limit: number = 100, offset: number = 0): Promise<Transaction[]> {
    let whereConditions: string[] = ['t.status = $1'];
    let params: any[] = ['completed'];
    let paramIndex = 2;

    if (filter?.startDate) {
      whereConditions.push(`t.created_at >= $${paramIndex}`);
      params.push(filter.startDate);
      paramIndex++;
    }

    if (filter?.endDate) {
      whereConditions.push(`t.created_at <= $${paramIndex}`);
      params.push(filter.endDate);
      paramIndex++;
    }

    if (filter?.paymentMethod) {
      whereConditions.push(`t.payment_method = $${paramIndex}`);
      params.push(filter.paymentMethod);
      paramIndex++;
    }

    if (filter?.buyerName) {
      whereConditions.push(`t.buyer_name ILIKE $${paramIndex}`);
      params.push(`%${filter.buyerName}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const sql = `
      SELECT 
        t.id,
        t.receipt_number,
        t.total_amount,
        t.amount_paid,
        t.change_amount,
        t.payment_method,
        t.buyer_name,
        t.buyer_address,
        t.created_at,
        json_agg(
          json_build_object(
            'id', p.id,
            'name', ti.product_name,
            'price', ti.unit_price,
            'quantity', ti.quantity,
            'product', json_build_object(
              'id', p.id,
              'name', ti.product_name,
              'price', ti.unit_price,
              'costPrice', ti.unit_cost_price,
              'description', p.description,
              'category', p.category
            )
          )
        ) as items
      FROM transactions t
      JOIN transaction_items ti ON t.id = ti.transaction_id
      LEFT JOIN products p ON ti.product_id = p.id
      WHERE ${whereClause}
      GROUP BY t.id, t.receipt_number, t.total_amount, t.amount_paid, 
               t.change_amount, t.payment_method, t.buyer_name, 
               t.buyer_address, t.created_at
      ORDER BY t.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const result = await query(sql, params);
    
    return result.rows.map((row: any) => ({
      id: row.id,
      receiptNumber: row.receipt_number,
      items: row.items,
      totalAmount: parseFloat(row.total_amount),
      amountPaid: parseFloat(row.amount_paid),
      changeAmount: parseFloat(row.change_amount),
      paymentMethod: row.payment_method,
      buyerName: row.buyer_name,
      buyerAddress: row.buyer_address,
      status: 'completed' as const,
      createdAt: new Date(row.created_at), // Convert string to Date object
    }));
  }

  async findById(id: string): Promise<Transaction | null> {
    const sql = `
      SELECT 
        t.id,
        t.receipt_number,
        t.total_amount,
        t.amount_paid,
        t.change_amount,
        t.payment_method,
        t.buyer_name,
        t.buyer_address,
        t.created_at,
        json_agg(
          json_build_object(
            'id', p.id,
            'name', ti.product_name,
            'price', ti.unit_price,
            'quantity', ti.quantity,
            'product', json_build_object(
              'id', p.id,
              'name', ti.product_name,
              'price', ti.unit_price,
              'costPrice', ti.unit_cost_price,
              'description', p.description,
              'category', p.category
            )
          )
        ) as items
      FROM transactions t
      JOIN transaction_items ti ON t.id = ti.transaction_id
      LEFT JOIN products p ON ti.product_id = p.id
      WHERE t.id = $1
      GROUP BY t.id, t.receipt_number, t.total_amount, t.amount_paid, 
               t.change_amount, t.payment_method, t.buyer_name, 
               t.buyer_address, t.created_at
    `;

    const result = await query(sql, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      receiptNumber: row.receipt_number,
      items: row.items,
      totalAmount: parseFloat(row.total_amount),
      amountPaid: parseFloat(row.amount_paid),
      changeAmount: parseFloat(row.change_amount),
      paymentMethod: row.payment_method,
      buyerName: row.buyer_name,
      buyerAddress: row.buyer_address,
      status: 'completed' as const,
      createdAt: new Date(row.created_at), // Convert string to Date object
    };
  }

  async getAnalytics(startDate?: Date, endDate?: Date): Promise<any> {
    let whereConditions = ['t.status = $1'];
    let params: any[] = ['completed'];
    let paramIndex = 2;

    if (startDate) {
      whereConditions.push(`t.created_at >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereConditions.push(`t.created_at <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const sql = `
      SELECT 
        COUNT(t.id) as total_transactions,
        SUM(t.total_amount) as total_revenue,
        AVG(t.total_amount) as avg_transaction_value,
        SUM(ti.quantity * ti.unit_cost_price) as total_cost,
        SUM(t.total_amount) - SUM(ti.quantity * ti.unit_cost_price) as total_profit,
        
        -- Daily breakdown
        json_agg(
          DISTINCT json_build_object(
            'date', DATE(t.created_at),
            'transactions', COUNT(t.id) OVER (PARTITION BY DATE(t.created_at)),
            'revenue', SUM(t.total_amount) OVER (PARTITION BY DATE(t.created_at)),
            'profit', SUM(t.total_amount) OVER (PARTITION BY DATE(t.created_at)) - 
                     SUM(ti.quantity * ti.unit_cost_price) OVER (PARTITION BY DATE(t.created_at))
          )
        ) as daily_summary,
        
        -- Top products
        json_agg(
          DISTINCT json_build_object(
            'product_name', ti.product_name,
            'quantity_sold', SUM(ti.quantity) OVER (PARTITION BY ti.product_id),
            'revenue', SUM(ti.subtotal) OVER (PARTITION BY ti.product_id)
          )
        ) as product_performance
        
      FROM transactions t
      JOIN transaction_items ti ON t.id = ti.transaction_id
      WHERE ${whereClause}
    `;

    const result = await query(sql, params);
    return result.rows[0];
  }

  async getTodayStats(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getAnalytics(today, tomorrow);
  }
}

// Export singleton instance
export const transactionRepository = new TransactionRepository();
