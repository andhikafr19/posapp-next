import { Pool, PoolConfig } from 'pg';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Database configuration with connection pooling for performance
const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'pos_app',
  
  // Connection pool settings for robust performance
  max: 20, // Maximum number of clients in the pool
  min: 2,  // Minimum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error if connection takes longer than 10 seconds
  
  // SSL configuration (disable for local development)
  ssl: false,
  
  // Additional options to handle authentication issues
  statement_timeout: 30000,
  query_timeout: 30000,
  application_name: 'posapp-next',
};

// Debug logging in development
if (process.env.NODE_ENV !== 'production') {
  console.log('Database config:', {
    host: poolConfig.host,
    port: poolConfig.port,
    user: poolConfig.user,
    password: poolConfig.password ? '***' : 'undefined',
    database: poolConfig.database,
  });
}

// Create connection pool
const pool = new Pool(poolConfig);

// Error handling for the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Connection test function
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Query execution wrapper with error handling
export async function query(text: string, params?: any[]): Promise<any> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries (over 100ms) in development
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.log('🐌 Slow query detected:', { text, duration, rows: result.rowCount });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Database query error:', { text, params, error });
    throw error;
  }
}

// Transaction wrapper for atomic operations
export async function transaction(callback: (client: any) => Promise<any>): Promise<any> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Health check function
export async function healthCheck(): Promise<{ status: string; timestamp: string; connections: number }> {
  try {
    const result = await query('SELECT NOW() as timestamp, COUNT(*) as connections FROM pg_stat_activity WHERE datname = $1', [process.env.DB_NAME]);
    return {
      status: 'healthy',
      timestamp: result.rows[0].timestamp,
      connections: parseInt(result.rows[0].connections)
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      connections: 0
    };
  }
}

// Graceful shutdown
export async function closePool(): Promise<void> {
  try {
    await pool.end();
    console.log('✅ Database pool closed gracefully');
  } catch (error) {
    console.error('❌ Error closing database pool:', error);
  }
}

// Export the pool for direct access if needed
export { pool };
export default pool;
