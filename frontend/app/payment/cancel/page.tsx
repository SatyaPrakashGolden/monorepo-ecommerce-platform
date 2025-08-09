
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [releaseStatus, setReleaseStatus] = useState<'processing' | 'success' | 'error'>('processing');

  // Get access token from localStorage
  const getAccessToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  };

  // Create axios instance with auth interceptor
  const createAxiosInstance = () => {
    const instance = axios.create();
    
    instance.interceptors.request.use((config) => {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return instance;
  };

  useEffect(() => {
    // Trigger compensation via backend on cancel
    const triggerCompensation = async () => {
      try {
        // Get sagaId from localStorage
        const sagaId = localStorage.getItem('sagaId');
        
        if (sagaId) {
          const axiosInstance = createAxiosInstance();

          // Call backend to trigger failure/compensation
          await axiosInstance.post(
            'http://localhost:2004/api/payment/cancel',
            {
              saga_id: sagaId,
              error_code: 'USER_CANCEL',
              error_description: 'Payment cancelled by user',
            },
            { timeout: 5000 }
          );

          setReleaseStatus('success');
          console.log('Compensation triggered for saga:', sagaId);
        } else {
          console.warn('No sagaId found for compensation');
          setReleaseStatus('success'); // No saga to compensate
        }
      } catch (error) {
        console.error('Failed to trigger compensation:', error);
        setReleaseStatus('error');
      } finally {
        setIsProcessing(false);
      }
    };

    const cleanupAndCompensate = async () => {
      await triggerCompensation();

      // Clean up localStorage
      const keysToRemove = [
        'prefill_data_v1',
        'rzp_device_id',
        'truecaller_user_metric',
        'userConsent',
        'sagaId' // Clear sagaId on cancel
      ];
      
      keysToRemove.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error(`Failed to remove ${key} from localStorage:`, error);
        }
      });
    };

    cleanupAndCompensate();
  }, []);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold mb-2">Processing Cancellation</h2>
          <p className="text-gray-600">Triggering compensation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L5.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-yellow-600 mb-2">Payment Cancelled</h1>
          <p className="text-gray-600">Your payment has been cancelled. No charges were made.</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-center mb-2">
            {releaseStatus === 'success' ? (
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className={`text-sm font-medium ${
              releaseStatus === 'success' ? 'text-green-700' : 'text-red-700'
            }`}>
              {releaseStatus === 'success' && 'Compensation Successful'}
              {releaseStatus === 'error' && 'Compensation Failed'}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {releaseStatus === 'success' && 'The reserved resources have been released.'}
            {releaseStatus === 'error' && 'There was an issue with compensation. Please contact support.'}
          </p>
        </div>

        {searchParams.get('error') && (
          <div className="bg-red-50 p-4 rounded-lg mb-6">
            <h3 className="text-sm font-semibold text-red-800 mb-1">Cancellation Reason:</h3>
            <p className="text-sm text-red-700">{decodeURIComponent(searchParams.get('error') || '')}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/cart"
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition font-semibold"
          >
            Return to Cart
          </Link>
          
          <Link
            href="/payment"
            className="block w-full bg-yellow-600 text-white py-3 px-4 rounded-md hover:bg-yellow-700 transition font-semibold"
          >
            Try Payment Again
          </Link>
          
          <Link
            href="/"
            className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 font-medium mb-1">Need Help?</p>
          <p className="text-xs text-blue-600">
            If you're experiencing issues with payment, please contact our support team.
          </p>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          Delente Technologies Pvt. Ltd.<br />
          M3M Cosmopolitan, Sector 66, Gurugram, Haryana 122002<br />
          <span className="text-gray-400">Your items remain in cart</span>
        </p>
      </div>
    </div>
  );
}