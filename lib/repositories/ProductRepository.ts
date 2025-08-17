import { query, transaction } from '../db';
import { Product } from '../../types/pos';

export interface ProductCreateInput {
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  category?: string;
  stock?: number;
}

export interface ProductUpdateInput extends Partial<ProductCreateInput> {
  isActive?: boolean;
}

export interface ProductFilter {
  category?: string;
  isActive?: boolean;
  search?: string;
}

export class ProductRepository {
  
  async findAll(filter?: ProductFilter): Promise<Product[]> {
    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (filter?.category) {
      whereConditions.push(`category = $${paramIndex}`);
      params.push(filter.category);
      paramIndex++;
    }

    if (filter?.isActive !== undefined) {
      whereConditions.push(`is_active = $${paramIndex}`);
      params.push(filter.isActive);
      paramIndex++;
    }

    if (filter?.search) {
      whereConditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      params.push(`%${filter.search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        id,
        name,
        description,
        price,
        cost_price as "costPrice",
        category,
        stock,
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM products 
      ${whereClause}
      ORDER BY name ASC
    `;

    const result = await query(sql, params);
    return result.rows;
  }

  async findById(id: string): Promise<Product | null> {
    const sql = `
      SELECT 
        id,
        name,
        description,
        price,
        cost_price as "costPrice",
        category,
        stock,
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM products 
      WHERE id = $1
    `;

    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  async create(data: ProductCreateInput): Promise<Product> {
    const sql = `
      INSERT INTO products (name, description, price, cost_price, category, stock)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING 
        id,
        name,
        description,
        price,
        cost_price as "costPrice",
        category,
        stock,
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const params = [
      data.name,
      data.description || null,
      data.price,
      data.costPrice || 0,
      data.category || null,
      data.stock || 0
    ];

    const result = await query(sql, params);
    return result.rows[0];
  }

  async update(id: string, data: ProductUpdateInput): Promise<Product | null> {
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updateFields.push(`name = $${paramIndex}`);
      params.push(data.name);
      paramIndex++;
    }

    if (data.description !== undefined) {
      updateFields.push(`description = $${paramIndex}`);
      params.push(data.description);
      paramIndex++;
    }

    if (data.price !== undefined) {
      updateFields.push(`price = $${paramIndex}`);
      params.push(data.price);
      paramIndex++;
    }

    if (data.costPrice !== undefined) {
      updateFields.push(`cost_price = $${paramIndex}`);
      params.push(data.costPrice);
      paramIndex++;
    }

    if (data.category !== undefined) {
      updateFields.push(`category = $${paramIndex}`);
      params.push(data.category);
      paramIndex++;
    }

    if (data.stock !== undefined) {
      updateFields.push(`stock = $${paramIndex}`);
      params.push(data.stock);
      paramIndex++;
    }

    if (data.isActive !== undefined) {
      updateFields.push(`is_active = $${paramIndex}`);
      params.push(data.isActive);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return this.findById(id);
    }

    params.push(id);

    const sql = `
      UPDATE products 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING 
        id,
        name,
        description,
        price,
        cost_price as "costPrice",
        category,
        stock,
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result = await query(sql, params);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const sql = 'UPDATE products SET is_active = false WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rowCount > 0;
  }

  async hardDelete(id: string): Promise<boolean> {
    return transaction(async (client) => {
      // Check if product is used in any transactions
      const checkSql = 'SELECT COUNT(*) as count FROM transaction_items WHERE product_id = $1';
      const checkResult = await client.query(checkSql, [id]);
      
      if (parseInt(checkResult.rows[0].count) > 0) {
        throw new Error('Cannot delete product that has been used in transactions');
      }

      const deleteSql = 'DELETE FROM products WHERE id = $1';
      const result = await client.query(deleteSql, [id]);
      return result.rowCount > 0;
    });
  }

  async updateStock(id: string, quantity: number, operation: 'add' | 'subtract'): Promise<Product | null> {
    const operator = operation === 'add' ? '+' : '-';
    
    const sql = `
      UPDATE products 
      SET stock = stock ${operator} $1
      WHERE id = $2 AND stock ${operator} $1 >= 0
      RETURNING 
        id,
        name,
        description,
        price,
        cost_price as "costPrice",
        category,
        stock,
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result = await query(sql, [quantity, id]);
    return result.rows[0] || null;
  }

  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    const sql = `
      SELECT 
        id,
        name,
        description,
        price,
        cost_price as "costPrice",
        category,
        stock,
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM products 
      WHERE stock <= $1 AND is_active = true
      ORDER BY stock ASC, name ASC
    `;

    const result = await query(sql, [threshold]);
    return result.rows;
  }
}

// Export singleton instance
export const productRepository = new ProductRepository();
