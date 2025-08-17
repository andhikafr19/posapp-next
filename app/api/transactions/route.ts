import { NextRequest, NextResponse } from 'next/server';
import { transactionRepository } from '../../../lib/repositories/TransactionRepository';
import { z } from 'zod';

// Validation schemas
const CartItemSchema = z.object({
  id: z.string(), // Product ID
  name: z.string(),
  price: z.any().transform(val => {
    if (typeof val === 'string') {
      return parseFloat(val.replace('.00', ''));
    }
    return typeof val === 'number' ? val : 0;
  }),
  quantity: z.any().transform(val => {
    if (typeof val === 'string') {
      return parseInt(val);
    }
    return typeof val === 'number' ? val : 0;
  }),
  product: z.object({
    id: z.string(),
    name: z.string(),
    price: z.any().transform(val => {
      if (typeof val === 'string') {
        return parseFloat(val.replace('.00', ''));
      }
      return typeof val === 'number' ? val : 0;
    }),
    costPrice: z.any().transform(val => {
      if (typeof val === 'string') {
        return parseFloat(val.replace('.00', ''));
      }
      return typeof val === 'number' ? val : 0;
    }).optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    stock: z.any().transform(val => {
      if (typeof val === 'string') {
        return parseInt(val);
      }
      return typeof val === 'number' ? val : 0;
    }).optional(),
    isActive: z.boolean().optional(),
  }),
});

const TransactionCreateSchema = z.object({
  receiptNumber: z.string(),
  items: z.array(CartItemSchema).min(1, 'At least one item is required'),
  totalAmount: z.any().transform(val => {
    if (typeof val === 'string') {
      return parseFloat(val.replace('.00', ''));
    }
    return typeof val === 'number' ? val : 0;
  }),
  amountPaid: z.any().transform(val => {
    if (typeof val === 'string') {
      return parseFloat(val.replace('.00', ''));
    }
    return typeof val === 'number' ? val : 0;
  }),
  changeAmount: z.any().transform(val => {
    if (typeof val === 'string') {
      return parseFloat(val.replace('.00', ''));
    }
    return typeof val === 'number' ? val : 0;
  }),
  paymentMethod: z.enum(['cash', 'card', 'digital']),
  buyerName: z.string().optional(),
  buyerAddress: z.string().optional(),
  status: z.enum(['pending', 'completed', 'cancelled']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const filter = {
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      paymentMethod: searchParams.get('paymentMethod') || undefined,
      buyerName: searchParams.get('buyerName') || undefined,
    };

    const transactions = await transactionRepository.findAll(filter, limit, offset);
    
    return NextResponse.json({
      success: true,
      data: transactions,
      count: transactions.length,
      pagination: {
        limit,
        offset,
        hasMore: transactions.length === limit
      }
    });

  } catch (error) {
    console.error('GET /api/transactions error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch transactions',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Debug logging
    console.log('Received transaction data:', JSON.stringify(body, null, 2));
    
    // Validate input
    const validatedData = TransactionCreateSchema.parse(body);
    // Map to repository input shape
    const createInput = {
      receiptNumber: validatedData.receiptNumber,
      items: validatedData.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        product: item.product,
      })),
      totalAmount: validatedData.totalAmount,
      amountPaid: validatedData.amountPaid,
      changeAmount: validatedData.changeAmount,
      paymentMethod: validatedData.paymentMethod,
      buyerName: validatedData.buyerName,
      buyerAddress: validatedData.buyerAddress,
      status: validatedData.status || 'completed',
    };
    const transaction = await transactionRepository.create(createInput);
    
    return NextResponse.json({
      success: true,
      data: transaction,
      message: 'Transaction created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/transactions error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation error',
          details: error.issues
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create transaction',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
