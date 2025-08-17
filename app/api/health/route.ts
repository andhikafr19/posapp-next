import { NextRequest, NextResponse } from 'next/server';
import { healthCheck } from '../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const dbHealth = await healthCheck();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      service: 'POS Application API',
      version: '1.0.0',
      database: dbHealth,
      uptime: process.uptime(),
    });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        success: false,
        timestamp: new Date().toISOString(),
        service: 'POS Application API',
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}
