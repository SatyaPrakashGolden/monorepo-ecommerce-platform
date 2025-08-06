// /src/app/payment/cancel/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const variantId = searchParams.get('variant_id');
  const showroomId = searchParams.get('showroom_id');
  const colorId = searchParams.get('color_id');

  useEffect(() => {
    // Release inventory when payment is cancelled
    const releaseInventory = async () => {
      if (variantId && showroomId && colorId) {
        try {
          await axios.get('http://localhost:5003/api/inventory/release', {
            params: { 
              variant_id: variantId, 
              showroom_id: parseInt(showroomId), 
              color_id: colorId 
            },
            timeout: 5000,
          });
          console.log('Inventory released due to payment cancellation');
        } catch (releaseErr) {
          console.error('Failed to release inventory:', releaseErr);
        }
      }
    };

    releaseInventory();

    // Clean up any Razorpay related localStorage items
    const keysToRemove = [
      'prefill_data_v1',
      'rzp_device_id',
      'truecaller_user_metric',
      'userConsent',
    ];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }, [variantId, showroomId, colorId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L5.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-yellow-600 mb-2">Payment Cancelled</h1>
          <p className="text-gray-600">Your payment has been cancelled. No charges were made to your account.</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-600">
            The reserved inventory has been released and is now available for other customers.
          </p>
        </div>
        
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
          Delente Technologies Pvt. Ltd.
          <br />
          M3M Cosmopolitan, Sector 66, Gurugram, Haryana 122002
        </p>
      </div>
    </div>
  );
}