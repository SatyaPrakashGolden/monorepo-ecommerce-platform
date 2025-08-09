// /home/satya/myproject/frontend/app/payment/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const razorpay_payment_id = formData.get('razorpay_payment_id') as string;
    const razorpay_order_id = formData.get('razorpay_order_id') as string;
    const razorpay_signature = formData.get('razorpay_signature') as string;
    
    console.log('Frontend callback received:', { razorpay_payment_id, razorpay_order_id, razorpay_signature });
    
    // Forward to backend for processing
    const response = await axios.post('http://localhost:2004/api/payment/callback', {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    }, {
      timeout: 10000,
    });
    
    // Backend will handle the redirect, but if response has redirect_url, use it
    const redirectUrl = response.data.redirect_url || 
      `/payment/success?payment_id=${razorpay_payment_id}&order_id=${razorpay_order_id}`;

    return NextResponse.redirect(new URL(redirectUrl, request.url));
    
  } catch (error) {
    console.error('Frontend callback error:', error);
    
    // Log failure to backend
    try {
      await axios.post('http://localhost:2004/api/payment/failure', {
        orderId: 'unknown',
        paymentId: 'unknown',
        errorCode: 'FRONTEND_CALLBACK_ERROR',
        errorDescription: 'Frontend callback processing failed',
        errorReason: 'FRONTEND_ERROR',
        type: 'frontend_error',
      });
    } catch (logError) {
      console.error('Failed to log frontend callback error:', logError);
    }
    
    return NextResponse.redirect(
      new URL('/payment/failure?error=frontend_callback_error', request.url)
    );
  }
}