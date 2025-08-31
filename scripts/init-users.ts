import { UserRepository } from '../lib/repositories/UserRepository';
import { testConnection } from '../lib/db';

async function initializeUsersTable() {
  console.log('🚀 Initializing users table and default data...');
  
  try {
    // Test database connection
    console.log('📡 Testing database connection...');
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Database connection failed. Please check your database configuration.');
      process.exit(1);
    }
    
    console.log('👤 Creating default admin user...');
    
    // Create default admin user
    try {
      const adminUser = await UserRepository.initializeDefaultAdmin();
      console.log('✅ Default admin user created/verified:', {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role
      });
    } catch (error: any) {
      if (error.message?.includes('duplicate key')) {
        console.log('ℹ️  Admin user already exists, skipping...');
      } else {
        throw error;
      }
    }

    // Create sample users
    console.log('👥 Creating sample users...');
    
    try {
      const cashierUser = await UserRepository.createUser({
        username: 'kasir1',
        password: 'kasir123',
        fullName: 'Kasir Satu',
        email: 'kasir1@posapp.com',
        role: 'cashier'
      });
      console.log('✅ Cashier user created:', {
        id: cashierUser.id,
        username: cashierUser.username,
        role: cashierUser.role
      });
    } catch (error: any) {
      if (error.message?.includes('duplicate key') || error.code === '23505') {
        console.log('ℹ️  Cashier user already exists, skipping...');
      } else {
        console.error('⚠️  Error creating cashier user:', error.message);
      }
    }

    try {
      const managerUser = await UserRepository.createUser({
        username: 'manager1',
        password: 'manager123',
        fullName: 'Manager Satu',
        email: 'manager1@posapp.com',
        role: 'manager'
      });
      console.log('✅ Manager user created:', {
        id: managerUser.id,
        username: managerUser.username,
        role: managerUser.role
      });
    } catch (error: any) {
      if (error.message?.includes('duplicate key') || error.code === '23505') {
        console.log('ℹ️  Manager user already exists, skipping...');
      } else {
        console.error('⚠️  Error creating manager user:', error.message);
      }
    }

    console.log('🎉 Users initialization completed successfully!');
    console.log('\n📋 Default Login Credentials:');
    console.log('Admin     - Username: admin     | Password: admin123');
    console.log('Manager   - Username: manager1  | Password: manager123');
    console.log('Cashier   - Username: kasir1    | Password: kasir123');
    
  } catch (error) {
    console.error('❌ Error initializing users:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeUsersTable()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
