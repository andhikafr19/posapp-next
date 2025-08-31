# Fitur User Login - POS Application

## Overview
Sistem autentikasi yang lengkap dengan role-based access control untuk aplikasi POS. Sistem ini mendukung tiga level user: Admin, Manager, dan Cashier dengan hak akses yang berbeda.

## Fitur Utama

### 1. Authentication System
- **JWT-based Authentication**: Menggunakan JSON Web Tokens untuk session management
- **Secure Password Storage**: Password di-hash menggunakan PBKDF2 dengan salt
- **Session Persistence**: Token disimpan di localStorage dan HTTP-only cookies
- **Auto-logout**: Token otomatis expired setelah 24 jam

### 2. Role-Based Access Control (RBAC)

#### Admin
- Akses penuh ke semua fitur
- Manajemen produk (CRUD)
- Melihat analytics dan laporan
- Manajemen user (create, view)
- Riwayat transaksi

#### Manager
- Point of Sale operations
- Manajemen produk (CRUD)
- Melihat analytics dan laporan
- Riwayat transaksi
- Tidak dapat mengelola user

#### Cashier
- Point of Sale operations
- Riwayat transaksi
- Tidak dapat mengakses analytics
- Tidak dapat mengelola produk atau user

### 3. User Interface Components

#### Login Component (`/components/Login.tsx`)
- Form login dengan username dan password
- Show/hide password toggle
- Error handling dan loading states
- Responsive design

#### User Profile Component (`/components/UserProfile.tsx`)
- Dropdown menu dengan user information
- Menampilkan role dan status user
- Quick logout functionality

#### Protected Route Component (`/components/ProtectedRoute.tsx`)
- Wrapper untuk melindungi halaman yang memerlukan authentication
- Role-based access checking
- Automatic redirect ke login jika belum authenticated

#### User Management Component (`/components/UserManagement.tsx`)
- Khusus untuk admin
- Melihat daftar semua user
- Membuat user baru
- Melihat status dan activity user

## Struktur Database

### Tabel Users
```sql
CREATE TABLE users (
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
```

## API Endpoints

### Authentication Endpoints

#### `POST /api/auth/login`
Login user dengan username dan password.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (Success):**
```json
{
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": "uuid",
      "username": "admin",
      "email": "admin@posapp.com",
      "fullName": "Administrator",
      "role": "admin",
      "isActive": true,
      "lastLoginAt": "2025-08-31T14:53:31.870Z"
    },
    "token": "jwt_token_here",
    "expiresAt": "2025-09-01T14:53:31.870Z"
  }
}
```

#### `POST /api/auth/logout`
Logout user dan clear session.

#### `GET /api/auth/me`
Verifikasi token dan mendapatkan informasi user yang sedang login.

#### `GET /api/auth/users` (Admin Only)
Mendapatkan daftar semua user.

#### `POST /api/auth/users` (Admin Only)
Membuat user baru.

**Request Body:**
```json
{
  "username": "kasir2",
  "password": "kasir123",
  "email": "kasir2@posapp.com",
  "fullName": "Kasir Dua",
  "role": "cashier"
}
```

## Setup dan Instalasi

### 1. Install Dependencies
```bash
npm install jsonwebtoken @types/jsonwebtoken
```

### 2. Setup Database
```bash
# Buat tabel users
npm run db:create-users

# Inisialisasi default users
npm run db:init-users
```

### 3. Environment Variables
Pastikan file `.env.local` memiliki:
```bash
JWT_SECRET=your-super-secure-jwt-secret-key-here-change-this-in-production
```

### 4. Default User Accounts

Setelah menjalankan `npm run db:init-users`, akan terbuat 3 user default:

| Username  | Password    | Role     | Email               |
|-----------|-------------|----------|---------------------|
| admin     | admin123    | admin    | admin@posapp.com    |
| manager1  | manager123  | manager  | manager1@posapp.com |
| kasir1    | kasir123    | cashier  | kasir1@posapp.com   |

## Struktur File

```
/app
  /api/auth
    /login/route.ts        # Login endpoint
    /logout/route.ts       # Logout endpoint
    /me/route.ts           # User verification endpoint
    /users/route.ts        # User management endpoint
  /login/page.tsx          # Login page

/components
  Login.tsx                # Login form component
  ProtectedRoute.tsx       # Route protection wrapper
  UserProfile.tsx          # User profile dropdown
  UserManagement.tsx       # User management (admin only)

/contexts
  AuthContext.tsx          # Authentication state management

/lib/repositories
  UserRepository.ts        # Database operations for users

/scripts
  create-users-table.ts    # Script untuk membuat tabel users
  init-users.ts           # Script untuk inisialisasi default users

/types
  pos.ts                  # Type definitions (User, LoginCredentials, AuthSession)

middleware.ts             # API route protection middleware
```

## Security Features

### 1. Password Security
- Passwords di-hash menggunakan PBKDF2 dengan 10,000 iterations
- Random salt untuk setiap password
- Password minimum 6 karakter

### 2. JWT Security
- Token signed dengan secret key
- Token expires setelah 24 jam
- Refresh tidak otomatis (user harus login ulang)

### 3. Route Protection
- Middleware melindungi API routes
- Client-side route protection dengan ProtectedRoute component
- Role-based access control

### 4. Session Management
- Token disimpan di localStorage dan HTTP-only cookies
- Automatic cleanup saat logout
- Token verification pada setiap request

## Usage Examples

### 1. Melindungi Halaman
```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute requireRole="admin">
      <AdminContent />
    </ProtectedRoute>
  );
}
```

### 2. Menggunakan Auth Context
```tsx
import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { state, login, logout } = useAuth();
  
  if (!state.isAuthenticated) {
    return <Login />;
  }
  
  return (
    <div>
      <p>Welcome, {state.user?.fullName}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 3. Role-based UI
```tsx
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const { state } = useAuth();
  
  return (
    <nav>
      <Link href="/">POS</Link>
      {(state.user?.role === 'admin' || state.user?.role === 'manager') && (
        <Link href="/analytics">Analytics</Link>
      )}
      {state.user?.role === 'admin' && (
        <Link href="/users">User Management</Link>
      )}
    </nav>
  );
}
```

## Best Practices

### 1. Security
- Selalu gunakan HTTPS di production
- Ganti JWT_SECRET dengan nilai yang kuat dan unik
- Implementasikan rate limiting untuk endpoint login
- Tambahkan CAPTCHA untuk mencegah brute force

### 2. User Experience
- Berikan feedback yang jelas saat login gagal
- Implement loading states
- Remember last visited page setelah login
- Graceful error handling

### 3. Development
- Test semua role scenarios
- Monitor session durations
- Log authentication events
- Regular security audits

## Troubleshooting

### 1. Database Connection Issues
```bash
# Verifikasi koneksi database
npm run db:verify

# Reset database jika diperlukan
npm run db:reset
npm run db:init
npm run db:create-users
npm run db:init-users
```

### 2. Token Issues
- Clear localStorage dan cookies jika ada masalah dengan token
- Verifikasi JWT_SECRET di environment variables
- Check token expiration time

### 3. Permission Issues
- Verifikasi role user di database
- Check middleware configuration
- Ensure proper role checks di components

## Performance Considerations

### 1. Database
- Index pada username, email, role columns
- Connection pooling untuk concurrent users
- Lazy loading untuk user lists

### 2. Client-side
- Token caching di memory
- Efficient state management
- Minimal re-renders

### 3. Security vs Performance
- Balance antara security checks dan response time
- Cache user permissions yang tidak sering berubah
- Optimize middleware untuk high-traffic endpoints
