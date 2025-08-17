import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'pos_app',
  ssl: false,
});

async function initializeDatabase() {
  console.log('🚀 Starting simple database initialization...');
  
  try {
    // 1. Enable UUID extension
    console.log('🔧 Enabling UUID extension...');
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    
    // 2. Create products table
    console.log('📋 Creating products table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
        cost_price DECIMAL(12,2) DEFAULT 0 CHECK (cost_price >= 0),
        category VARCHAR(100),
        stock INTEGER DEFAULT 0 CHECK (stock >= 0),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create transactions table
    console.log('📋 Creating transactions table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        receipt_number VARCHAR(50) UNIQUE NOT NULL,
        total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
        amount_paid DECIMAL(12,2) NOT NULL CHECK (amount_paid >= 0),
        change_amount DECIMAL(12,2) DEFAULT 0 CHECK (change_amount >= 0),
        payment_method VARCHAR(20) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'digital')),
        buyer_name VARCHAR(255),
        buyer_address TEXT,
        status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Create transaction_items table
    console.log('📋 Creating transaction_items table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transaction_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
        product_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        unit_price DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0),
        unit_cost_price DECIMAL(12,2) DEFAULT 0 CHECK (unit_cost_price >= 0),
        subtotal DECIMAL(12,2) NOT NULL CHECK (subtotal >= 0),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Create indexes
    console.log('📇 Creating indexes...');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_transactions_receipt ON transactions(receipt_number);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON transaction_items(transaction_id);');

    // 6. Insert sample data
    console.log('📦 Inserting sample data...');
    await pool.query(`
      INSERT INTO products (name, description, price, cost_price, category, stock) 
      VALUES 
        ('Nasi Gudeg', 'Nasi gudeg khas Yogyakarta dengan ayam', 15000, 8000, 'Makanan', 50),
        ('Es Teh Manis', 'Es teh manis segar', 5000, 2000, 'Minuman', 100),
        ('Kerupuk', 'Kerupuk rambak sapi', 3000, 1500, 'Snack', 75),
        ('Tempe Goreng', 'Tempe goreng crispy', 7000, 3500, 'Makanan', 30),
        ('Kopi Tubruk', 'Kopi tubruk tradisional', 8000, 4000, 'Minuman', 60)
      ON CONFLICT DO NOTHING;
    `);

    // 7. Create views
    console.log('👁️ Creating views...');
    await pool.query(`
      CREATE OR REPLACE VIEW product_performance AS
      SELECT 
        p.id,
        p.name,
        p.category,
        p.price,
        p.cost_price,
        COALESCE(SUM(ti.quantity), 0) as total_sold,
        COALESCE(SUM(ti.subtotal), 0) as total_revenue,
        p.stock as current_stock
      FROM products p
      LEFT JOIN transaction_items ti ON p.id = ti.product_id
      LEFT JOIN transactions t ON ti.transaction_id = t.id AND t.status = 'completed'
      GROUP BY p.id, p.name, p.category, p.price, p.cost_price, p.stock
      ORDER BY total_sold DESC;
    `);

    console.log('✅ Database initialization completed successfully!');
    console.log('🎉 Ready to use the POS application with PostgreSQL!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    await pool.end();
  }
}

initializeDatabase();
