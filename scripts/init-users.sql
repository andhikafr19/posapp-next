-- SQL script untuk membuat tabel users dan inisialisasi data
-- File: scripts/init-users.sql

-- Buat tabel users
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

-- Buat index untuk optimasi query
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Trigger untuk update updated_at otomatis
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user
-- Password: admin123 (di-hash dengan salt)
-- Note: Ini akan di-handle oleh aplikasi Node.js untuk security yang lebih baik
INSERT INTO users (username, password_hash, password_salt, email, full_name, role, is_active)
VALUES (
    'admin',
    '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', -- placeholder, akan di-replace oleh app
    'placeholder_salt', -- placeholder, akan di-replace oleh app
    'admin@posapp.com',
    'Administrator',
    'admin',
    true
) ON CONFLICT (username) DO NOTHING;

-- Insert sample cashier user
INSERT INTO users (username, password_hash, password_salt, email, full_name, role, is_active)
VALUES (
    'kasir1',
    '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', -- placeholder
    'placeholder_salt', -- placeholder
    'kasir1@posapp.com',
    'Kasir Satu',
    'cashier',
    true
) ON CONFLICT (username) DO NOTHING;

-- Insert sample manager user
INSERT INTO users (username, password_hash, password_salt, email, full_name, role, is_active)
VALUES (
    'manager1',
    '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', -- placeholder
    'placeholder_salt', -- placeholder
    'manager1@posapp.com',
    'Manager Satu',
    'manager',
    true
) ON CONFLICT (username) DO NOTHING;
