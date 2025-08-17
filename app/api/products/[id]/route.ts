import { NextRequest, NextResponse } from 'next/server';
import { productRepository } from '../../../../lib/repositories/ProductRepository';
import { z } from 'zod';

const ProductUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.any().transform(val => {
    if (typeof val === 'string') {
      return parseFloat(val);
    }
    return typeof val === 'number' ? val : undefined;
  }).optional(),
  costPrice: z.any().transform(val => {
    if (typeof val === 'string') {
      return parseFloat(val);
    }
    return typeof val === 'number' ? val : undefined;
  }).optional(),
  category: z.string().optional(),
  stock: z.any().transform(val => {
    if (typeof val === 'string') {
      return parseInt(val);
    }
    return typeof val === 'number' ? val : undefined;
  }).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await productRepository.findById(params.id);
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error(`GET /api/products/${params.id} error:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch product',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = ProductUpdateSchema.parse(body);
    
    const product = await productRepository.update(params.id, validatedData);
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error(`PUT /api/products/${params.id} error:`, error);
    
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
        error: 'Failed to update product',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';
    
    let success: boolean;
    
    if (hardDelete) {
      success = await productRepository.hardDelete(params.id);
    } else {
      success = await productRepository.delete(params.id);
    }
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Product not found or cannot be deleted' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: hardDelete ? 'Product permanently deleted' : 'Product deactivated'
    });

  } catch (error) {
    console.error(`DELETE /api/products/${params.id} error:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete product',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
