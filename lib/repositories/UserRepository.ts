import { User } from '@/types/pos';
import { query } from '../db';
import crypto from 'crypto';

type UserRole = 'admin' | 'cashier' | 'manager';

interface UserRow {
  id: string;
  username: string;
  password_hash?: string;
  password_salt?: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string | Date;
  updated_at: string | Date | null;
  last_login_at: string | Date | null;
}

export class UserRepository {
  // Hash password menggunakan SHA-256 dengan salt
  private static hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const saltValue = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, saltValue, 10000, 64, 'sha256').toString('hex');
    return { hash, salt: saltValue };
  }

  // Verifikasi password
  private static verifyPassword(password: string, hash: string, salt: string): boolean {
    const { hash: newHash } = this.hashPassword(password, salt);
    return hash === newHash;
  }

  // Membuat user baru
  static async createUser(userData: {
    username: string;
    password: string;
    email?: string;
    fullName?: string;
    role?: UserRole;
  }): Promise<User> {
    const { hash, salt } = this.hashPassword(userData.password);
    const id = crypto.randomUUID();
    
    const result = await query(
      `INSERT INTO users (id, username, password_hash, password_salt, email, full_name, role, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING id, username, email, full_name, role, is_active, created_at, updated_at`,
      [
        id,
        userData.username,
        hash,
        salt,
        userData.email || null,
        userData.fullName || null,
        userData.role || 'cashier',
        true
      ]
    );

    return this.mapRowToUser(result.rows[0]);
  }

  // Login user dengan username dan password
  static async authenticateUser(username: string, password: string): Promise<User | null> {
    const result = await query(
      `SELECT id, username, password_hash, password_salt, email, full_name, role, is_active, created_at, updated_at, last_login_at
       FROM users 
       WHERE username = $1 AND is_active = true`,
      [username]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const userRow = result.rows[0];
    const isValidPassword = this.verifyPassword(password, userRow.password_hash, userRow.password_salt);

    if (!isValidPassword) {
      return null;
    }

    // Update last login time
    await this.updateLastLogin(userRow.id);

    return this.mapRowToUser(userRow);
  }

  // Get user by ID
  static async getUserById(id: string): Promise<User | null> {
    const result = await query(
      `SELECT id, username, email, full_name, role, is_active, created_at, updated_at, last_login_at
       FROM users 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  // Get user by username
  static async getUserByUsername(username: string): Promise<User | null> {
    const result = await query(
      `SELECT id, username, email, full_name, role, is_active, created_at, updated_at, last_login_at
       FROM users 
       WHERE username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  // Get all users
  static async getAllUsers(): Promise<User[]> {
    const result = await query(
      `SELECT id, username, email, full_name, role, is_active, created_at, updated_at, last_login_at
       FROM users 
       ORDER BY created_at DESC`
    );

    return result.rows.map((row: UserRow) => this.mapRowToUser(row));
  }

  // Update user
  static async updateUser(id: string, userData: {
    email?: string;
    fullName?: string;
    role?: UserRole;
    isActive?: boolean;
  }): Promise<User | null> {
    const setParts: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (userData.email !== undefined) {
      setParts.push(`email = $${paramIndex++}`);
      values.push(userData.email);
    }
    if (userData.fullName !== undefined) {
      setParts.push(`full_name = $${paramIndex++}`);
      values.push(userData.fullName);
    }
    if (userData.role !== undefined) {
      setParts.push(`role = $${paramIndex++}`);
      values.push(userData.role);
    }
    if (userData.isActive !== undefined) {
      setParts.push(`is_active = $${paramIndex++}`);
      values.push(userData.isActive);
    }

    if (setParts.length === 0) {
      return this.getUserById(id);
    }

    setParts.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE users 
       SET ${setParts.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, username, email, full_name, role, is_active, created_at, updated_at, last_login_at`,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  // Update password
  static async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const { hash, salt } = this.hashPassword(newPassword);
    
    const result = await query(
      `UPDATE users 
       SET password_hash = $1, password_salt = $2, updated_at = NOW()
       WHERE id = $3`,
      [hash, salt, id]
    );

    return result.rowCount > 0;
  }

  // Delete user (soft delete)
  static async deleteUser(id: string): Promise<boolean> {
    const result = await query(
      `UPDATE users 
       SET is_active = false, updated_at = NOW()
       WHERE id = $1`,
      [id]
    );

    return result.rowCount > 0;
  }

  // Update last login time
  private static async updateLastLogin(id: string): Promise<void> {
    await query(
      `UPDATE users 
       SET last_login_at = NOW()
       WHERE id = $1`,
      [id]
    );
  }

  // Map database row to User object
  private static mapRowToUser(row: UserRow): User {
    return {
      id: row.id,
      username: row.username,
      email: row.email || undefined,
      fullName: row.full_name || undefined,
      role: row.role,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
    };
  }

  // Initialize default admin user (for setup)
  static async initializeDefaultAdmin(): Promise<User> {
    const existingAdmin = await this.getUserByUsername('admin');
    if (existingAdmin) {
      return existingAdmin;
    }

    return this.createUser({
      username: 'admin',
      password: 'admin123',
      fullName: 'Administrator',
      email: 'admin@posapp.com',
      role: 'admin'
    });
  }
}
