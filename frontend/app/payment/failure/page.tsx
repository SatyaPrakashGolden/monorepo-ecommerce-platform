// /src/app/payment/failure/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function PaymentFailurePage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const keysToRemove = [
      'prefill_data_v1',
      'rzp_device_id',
      'truecaller_user_metric',
      'userConsent',
    ];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }, []);

  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case 'verification_failed':
        return 'Payment verification failed. Please try again.';
      case 'callback_error':
        return 'An error occurred while processing your payment.';
      case 'cancelled':
        return 'Payment was cancelled by user.';
      default:
        return 'Payment failed. Please try again.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h1>
          <p className="text-gray-600">{getErrorMessage(error)}</p>
        </div>
        
        {orderId && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-2">Transaction Details</h2>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Order ID:</span> {orderId}
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          <Link 
            href="/payment" 
            className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            Try Again
          </Link>
          <Link 
            href="/" 
            className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition"
          >
            Go to Dashboard
          </Link>
        </div>
        
        <p className="mt-6 text-sm text-gray-600">
          If you continue to face issues, please contact our support team.
        </p>
        
        <p className="mt-6 text-sm text-gray-600">
          Delente Technologies Pvt. Ltd.
          <br />
          M3M Cosmopolitan, Sector 66, Gurugram, Haryana 122002
        </p>
      </div>
    </div>
  );
}