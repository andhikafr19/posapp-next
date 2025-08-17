# Database Migration Guide

This document explains how to migrate your POS application from localStorage to PostgreSQL database.

## Prerequisites

1. **PostgreSQL Installation**: Make sure PostgreSQL is installed and running on your local machine
2. **Database Creation**: Create a database named `eo_app`
3. **Environment Configuration**: Set up your database credentials

## Setup Instructions

### 1. Environment Configuration

Copy and configure your `.env.local` file:

```bash
# Database Configuration
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/eo_app"

# Individual Database Settings (fallback)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_actual_password_here
DB_NAME=eo_app
```

**Important**: Replace `your_actual_password_here` with your PostgreSQL password.

### 2. Database Schema Setup

Initialize the database schema and sample data:

```bash
npm run db:init
```

This command will:
- Test database connectivity
- Create all required tables
- Set up indexes and triggers
- Insert sample products
- Create analytics views

### 3. Database Commands

Available database management commands:

```bash
# Initialize database (first time setup)
npm run db:init

# Reset database (drop all tables)
npm run db:reset

# Check database health
curl http://localhost:3000/api/health
```

## Database Schema Overview

### Core Tables

1. **products** - Product catalog with pricing and inventory
2. **transactions** - Sales transaction records
3. **transaction_items** - Line items for each transaction
4. **audit_log** - Change tracking for all operations

### Key Features

- **UUID Primary Keys**: Better performance and security
- **Automatic Timestamps**: Created/updated tracking
- **Data Integrity**: Foreign key constraints and check constraints
- **Audit Trail**: Complete change history
- **Performance Indexes**: Optimized for common queries
- **Soft Delete**: Products can be deactivated instead of deleted

## Migration Process

### From localStorage to Database

The application will automatically switch from localStorage to database when:

1. Database is properly configured
2. API endpoints are available
3. Database connection is healthy

### Data Migration

If you have existing data in localStorage, you can:

1. Export current localStorage data
2. Use the API endpoints to import data
3. Verify data integrity

Example migration script:

```javascript
// Export localStorage data
const products = JSON.parse(localStorage.getItem('products') || '[]');
const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

// Import to database via API
for (const product of products) {
  await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });
}
```

## API Endpoints

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create new product
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete/deactivate product

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create new transaction

### Analytics
- `GET /api/analytics` - Get sales analytics

### Health Check
- `GET /api/health` - Database and API health status

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **Database Access**: Use connection pooling for performance
3. **Input Validation**: All API endpoints use Zod schema validation
4. **SQL Injection**: Using parameterized queries
5. **Error Handling**: Comprehensive error logging and handling

## Performance Optimization

1. **Connection Pooling**: Maximum 20 concurrent connections
2. **Query Optimization**: Indexes on frequently queried fields
3. **Slow Query Logging**: Queries > 100ms are logged in development
4. **Transaction Support**: Atomic operations for data consistency

## Troubleshooting

### Common Issues

1. **Connection Failed**: Check PostgreSQL service is running
2. **Permission Denied**: Verify database user permissions
3. **Port Conflicts**: Ensure port 5432 is available
4. **Schema Errors**: Run `npm run db:reset` then `npm run db:init`

### Health Check

Always check the health endpoint first:

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "service": "POS Application API",
  "database": {
    "status": "healthy",
    "connections": 5
  }
}
```

## Best Practices

1. **Backup Strategy**: Regular database backups
2. **Migration Testing**: Test on development database first
3. **Monitoring**: Monitor database performance
4. **Error Handling**: Implement proper error boundaries
5. **Logging**: Comprehensive application logging

## Support

If you encounter issues during migration:

1. Check database connection settings
2. Verify PostgreSQL service status
3. Review application logs
4. Test API endpoints individually
5. Use database health check endpoint
