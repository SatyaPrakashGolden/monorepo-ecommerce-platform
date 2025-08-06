
// /src/app/payment/success/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    // Clean up any Razorpay related localStorage items
    const keysToRemove = [
      'prefill_data_v1',
      'rzp_device_id',
      'truecaller_user_metric',
      'userConsent',
    ];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Your payment has been processed successfully.</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-2">Transaction Details</h2>
          {paymentId && (
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Payment ID:</span> {paymentId}
            </p>
          )}
          {orderId && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Order ID:</span> {orderId}
            </p>
          )}
        </div>
        
        <div className="space-y-3">
          <Link 
            href="/payment" 
            className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            Make Another Payment
          </Link>
          <Link 
            href="/" 
            className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition"
          >
            Go to Dashboard
          </Link>
        </div>
        
        <p className="mt-6 text-sm text-gray-600">
          Delente Technologies Pvt. Ltd.
          <br />
          M3M Cosmopolitan, Sector 66, Gurugram, Haryana 122002
        </p>
      </div>
    </div>
  );
}
