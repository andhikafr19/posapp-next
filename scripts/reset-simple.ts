import { Pool } from 'pg';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function resetDatabase() {
  console.log('🔄 Resetting database...');
  
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME || 'pos_app',
    ssl: false,
  });

  try {
    // Drop all tables
    await pool.query('DROP SCHEMA public CASCADE;');
    await pool.query('CREATE SCHEMA public;');
    
    console.log('✅ Database reset successfully!');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
  } finally {
    await pool.end();
  }
}

resetDatabase();
