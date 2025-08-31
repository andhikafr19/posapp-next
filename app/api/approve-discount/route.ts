import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/lib/repositories/UserRepository';
import { verifyToken } from '@/lib/jwt-utils';

interface ApprovalLog {
  id: string;
  adminId: string;
  adminUsername: string;
  transactionId?: string;
  discountAmount: number;
  discountPercentage: number;
  originalTotal: number;
  newTotal: number;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Simple in-memory store for approval logs (in production, use database)
const approvalLogs: ApprovalLog[] = [];

// Admin PINs - in production, store this in database with encryption
const ADMIN_PINS: Record<string, string> = {
  'admin': '123456',      // Admin default PIN
  'manager1': '654321',   // Manager PIN
  'manager2': '111111'    // Another manager PIN
};

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token tidak ditemukan' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      );
    }

    // Get current user
    const currentUser = await UserRepository.getUserById(decoded.userId);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { pin, transactionAmount, discountPercentage, discountAmount, newTotal } = body;

    // Validate required fields
    if (!pin || typeof transactionAmount !== 'number' || typeof discountPercentage !== 'number') {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    // Check if PIN is valid for any admin/manager
    let approverUsername: string | null = null;
    let approverId: string | null = null;

    // First, check if the PIN belongs to an admin/manager user
    const allUsers = await UserRepository.getAllUsers();
    const adminUsers = allUsers.filter(user => 
      user.isActive && (user.role === 'admin' || user.role === 'manager')
    );

    for (const admin of adminUsers) {
      if (ADMIN_PINS[admin.username] === pin) {
        approverUsername = admin.username;
        approverId = admin.id;
        break;
      }
    }

    if (!approverUsername || !approverId) {
      // Log failed attempt
      console.log(`Failed PIN attempt by ${currentUser.username} with PIN: ${pin}`);
      
      return NextResponse.json(
        { error: 'PIN tidak valid' },
        { status: 403 }
      );
    }

    // Check user permissions (only admin and manager can approve discounts)
    const approverUser = await UserRepository.getUserById(approverId);
    if (!approverUser || (approverUser.role !== 'admin' && approverUser.role !== 'manager')) {
      return NextResponse.json(
        { error: 'Hanya admin atau manager yang dapat menyetujui diskon' },
        { status: 403 }
      );
    }

    // Create approval log
    const approvalLog: ApprovalLog = {
      id: crypto.randomUUID(),
      adminId: approverId,
      adminUsername: approverUsername,
      transactionId: crypto.randomUUID(), // This would be the actual transaction ID
      discountAmount,
      discountPercentage,
      originalTotal: transactionAmount,
      newTotal,
      timestamp: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };

    // Store approval log (in production, save to database)
    approvalLogs.push(approvalLog);

    // Log successful approval
    console.log(`✅ Discount approved by ${approverUsername} (${approverId}) for amount ${discountAmount}`);
    console.log(`   Original: ${transactionAmount}, Discount: ${discountPercentage}%, New Total: ${newTotal}`);
    console.log(`   Requested by: ${currentUser.username} (${currentUser.id})`);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Diskon berhasil disetujui',
      data: {
        approvalId: approvalLog.id,
        adminId: approverId,
        adminUsername: approverUsername,
        discountAmount,
        discountPercentage,
        originalTotal: transactionAmount,
        newTotal,
        timestamp: approvalLog.timestamp
      }
    });

  } catch (error) {
    console.error('Approve discount error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve approval logs (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token tidak ditemukan' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      );
    }

    // Get current user
    const currentUser = await UserRepository.getUserById(decoded.userId);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Hanya admin yang dapat melihat log approval' },
        { status: 403 }
      );
    }

    // Return approval logs
    return NextResponse.json({
      success: true,
      data: approvalLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    });

  } catch (error) {
    console.error('Get approval logs error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    );
  }
}
