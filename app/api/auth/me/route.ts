import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/lib/repositories/UserRepository';
import { authenticateRequest } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = authenticateRequest(request);
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Token tidak valid atau tidak ditemukan' },
        { status: 401 }
      );
    }
    
    // Get user data from database
    const user = await UserRepository.getUserById(authUser.userId);
    
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'User tidak valid atau tidak aktif' },
        { status: 401 }
      );
    }

    // Return user data (without sensitive information)
    const responseData = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt
      }
    };

    return NextResponse.json(
      { message: 'Token valid', data: responseData },
      { status: 200 }
    );

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Token tidak valid' },
      { status: 401 }
    );
  }
}
