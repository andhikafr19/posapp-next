import { NextRequest, NextResponse } from 'next/server';
import { transactionRepository } from '../../../lib/repositories/TransactionRepository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
    
    const analytics = await transactionRepository.getAnalytics(startDate, endDate);
    const todayStats = await transactionRepository.getTodayStats();
    
    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalTransactions: parseInt(analytics.total_transactions) || 0,
          totalRevenue: parseFloat(analytics.total_revenue) || 0,
          totalCost: parseFloat(analytics.total_cost) || 0,
          totalProfit: parseFloat(analytics.total_profit) || 0,
          avgTransactionValue: parseFloat(analytics.avg_transaction_value) || 0,
        },
        today: {
          totalTransactions: parseInt(todayStats.total_transactions) || 0,
          totalRevenue: parseFloat(todayStats.total_revenue) || 0,
          totalProfit: parseFloat(todayStats.total_profit) || 0,
        },
        dailySummary: analytics.daily_summary || [],
        productPerformance: analytics.product_performance || [],
      }
    });

  } catch (error) {
    console.error('GET /api/analytics error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
