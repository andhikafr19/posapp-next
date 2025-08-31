import { query, testConnection } from '../lib/db';

async function createUsersTable() {
  console.log('🚀 Creating users table...');
  
  try {
    // Test database connection
    console.log('📡 Testing database connection...');
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Database connection failed. Please check your database configuration.');
      process.exit(1);
    }

    // Create users table
    console.log('📦 Creating users table...');
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(128) NOT NULL,
        password_salt VARCHAR(32) NOT NULL,
        email VARCHAR(255),
        full_name VARCHAR(100),
        role VARCHAR(20) NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'manager', 'cashier')),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_login_at TIMESTAMP WITH TIME ZONE
      );
    `);
    console.log('✅ Users table created successfully');

    // Create indexes
    console.log('📑 Creating indexes...');
    await query(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);`);
    console.log('✅ Indexes created successfully');

    // Create trigger function for updating updated_at
    console.log('⚙️ Creating trigger function...');
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create trigger
    await query(`DROP TRIGGER IF EXISTS update_users_updated_at ON users;`);
    await query(`
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('✅ Trigger created successfully');

    console.log('🎉 Users table and related objects created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating users table:', error);
    process.exit(1);
  }
}

// Run the table creation
createUsersTable()
  .then(() => {
    console.log('✅ Users table setup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
