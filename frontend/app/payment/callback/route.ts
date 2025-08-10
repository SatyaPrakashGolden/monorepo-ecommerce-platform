

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const razorpay_payment_id = formData.get('razorpay_payment_id') as string;
    const razorpay_order_id = formData.get('razorpay_order_id') as string;
    const razorpay_signature = formData.get('razorpay_signature') as string;
    const saga_id = request.nextUrl.searchParams.get('saga_id') || '';

    console.log('Frontend callback received:', { razorpay_payment_id, razorpay_order_id, razorpay_signature, saga_id });

    const axiosInstance = axios.create({
      baseURL: 'http://localhost:2004/api',
    });

    const response = await axiosInstance.post('/payment/callback', {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      isFailedPayment: false,
    }, {
      timeout: 10000,
    });

    const redirectUrl = new URL(response.data.redirect_url || 
      `/payment/success?payment_id=${razorpay_payment_id}&order_id=${razorpay_order_id}&saga_id=${saga_id}`, 
      request.url
    );

    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error('Frontend callback error:', error);

    const saga_id = request.nextUrl.searchParams.get('saga_id') || 'unknown';

    try {
      const axiosInstance = axios.create({
        baseURL: 'http://localhost:2004/api',
      });

      await axiosInstance.post('/payment/failure', {
        orderId: 'unknown',
        paymentId: 'unknown',
        errorCode: error.response?.status?.toString() || 'FRONTEND_CALLBACK_ERROR',
        errorDescription: error.response?.data?.message || error.message || 'Frontend callback processing failed',
        errorReason: 'FRONTEND_ERROR',
        type: 'frontend_error',
        sagaId: saga_id,
      });
    } catch (logError) {
      console.error('Failed to log frontend callback error:', logError);
    }

    const redirectUrl = new URL(`/payment/cancel?error=${encodeURIComponent(
      error.response?.data?.message || error.message || 'frontend_callback_error'
    )}&saga_id=${saga_id}`, request.url);

    return NextResponse.redirect(redirectUrl);
  }
}
