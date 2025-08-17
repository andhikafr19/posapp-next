import { query, testConnection, closePool } from '../lib/db';

async function verifyDatabase() {
  console.log('🔍 Verifying database setup...');
  
  try {
    // Test connection
    console.log('📡 Testing connection...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ Failed to connect to database');
      return;
    }

    // Check tables
    console.log('\n📋 Checking tables...');
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log(`✅ Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach((row: any) => {
      console.log(`   - ${row.table_name}`);
    });

    // Check sample data
    console.log('\n📦 Checking sample data...');
    const productCount = await query('SELECT COUNT(*) as count FROM products');
    console.log(`   - Products: ${productCount.rows[0].count} records`);

    const products = await query('SELECT name, price, category, stock FROM products LIMIT 5');
    console.log('   - Sample products:');
    products.rows.forEach((product: any) => {
      console.log(`     * ${product.name} - Rp ${product.price} (${product.category}) - Stock: ${product.stock}`);
    });

    // Check views
    console.log('\n👁️ Checking views...');
    const viewsResult = await query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log(`✅ Found ${viewsResult.rows.length} views:`);
    viewsResult.rows.forEach((row: any) => {
      console.log(`   - ${row.table_name}`);
    });

    // Test API functions
    console.log('\n🧪 Testing API functionality...');
    
    // Test product search
    const searchResult = await query('SELECT * FROM products WHERE category = $1', ['Makanan']);
    console.log(`   - Found ${searchResult.rows.length} food products`);

    console.log('\n✅ Database verification completed successfully!');
    console.log('🎯 Database is ready for the POS application!');

  } catch (error) {
    console.error('❌ Database verification failed:', error);
  } finally {
    await closePool();
  }
}

verifyDatabase();
