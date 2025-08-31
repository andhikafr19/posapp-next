import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/lib/repositories/UserRepository';
import { authenticateRequest, requireAdmin } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = authenticateRequest(request);
    if (!requireAdmin(user)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat membuat user baru.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { username, password, email, fullName, role } = body;

    // Validasi input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password harus diisi' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username minimal 3 karakter' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await UserRepository.getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username sudah digunakan' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = await UserRepository.createUser({
      username,
      password,
      email,
      fullName,
      role: role || 'cashier'
    });

    // Return user data (without sensitive information)
    const responseData = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt
    };

    return NextResponse.json(
      { message: 'User berhasil dibuat', data: responseData },
      { status: 201 }
    );

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = authenticateRequest(request);
    if (!requireAdmin(user)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat melihat daftar user.' },
        { status: 403 }
      );
    }

    const users = await UserRepository.getAllUsers();
    
    // Return users data (without sensitive information)
    const responseData = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    }));

    return NextResponse.json(
      { message: 'Users retrieved successfully', data: responseData },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
