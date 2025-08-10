

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

interface CheckoutData {
  cartItems: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const sagaId = searchParams.get('saga_id');
  const [isProcessing, setIsProcessing] = useState(true);
  const [releaseStatus, setReleaseStatus] = useState<'processing' | 'success' | 'error'>('processing');

  const getAccessToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  };

  const createAxiosInstance = () => {
    const instance = axios.create({
      baseURL: 'http://localhost:2004/api',
    });
    
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
    const releaseInventory = async () => {
      try {
        const checkoutDataStr = localStorage.getItem('checkoutData');
        
        if (checkoutDataStr) {
          const checkoutData: CheckoutData = JSON.parse(checkoutDataStr);
          const axiosInstance = createAxiosInstance();

          for (const item of checkoutData.cartItems) {
            try {
              await axiosInstance.post(
                'http://localhost:2000/api/product/release-stock',
                {
                  productId: item.productId,
                  quantity: item.quantity,
                },
                { timeout: 5000 }
              );
              console.log(`Inventory released for product: ${item.productId}, quantity: ${item.quantity}`);
            } catch (itemError) {
              console.error(`Failed to release inventory for product ${item.productId}:`, itemError);
              setReleaseStatus('error');
            }
          }

          setReleaseStatus('success');
          console.log('All inventory released due to payment cancellation');
        } else {
          console.warn('No checkout data found to release inventory');
          setReleaseStatus('success');
        }
      } catch (error) {
        console.error('Failed to release inventory:', error);
        setReleaseStatus('error');
      } finally {
        setIsProcessing(false);
      }
    };

    const cleanupAndRelease = async () => {
      await releaseInventory();

      const keysToRemove = [
        'prefill_data_v1',
        'rzp_device_id',
        'truecaller_user_metric',
        'userConsent',
      ];
      
      keysToRemove.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error(`Failed to remove ${key} from localStorage:`, error);
        }
      });
    };

    cleanupAndRelease();
  }, []);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold mb-2">Processing Cancellation</h2>
          <p className="text-gray-600">Releasing reserved inventory...</p>
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
          <p className="text-gray-600">Your payment has been cancelled. No charges were made to your account.</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-center mb-2">
            {releaseStatus === 'success' ? (
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : releaseStatus === 'error' ? (
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
            )}
            <span className={`text-sm font-medium ${
              releaseStatus === 'success' ? 'text-green-700' : 
              releaseStatus === 'error' ? 'text-red-700' : 
              'text-gray-700'
            }`}>
              {releaseStatus === 'success' && 'Inventory Successfully Released'}
              {releaseStatus === 'error' && 'Inventory Release Failed'}
              {releaseStatus === 'processing' && 'Processing...'}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {releaseStatus === 'success' && 'The reserved inventory has been released and is now available for other customers.'}
            {releaseStatus === 'error' && 'There was an issue releasing the inventory. Please contact support if needed.'}
            {releaseStatus === 'processing' && 'Please wait while we process your cancellation...'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-lg mb-6">
            <h3 className="text-sm font-semibold text-red-800 mb-1">Cancellation Reason:</h3>
            <p className="text-sm text-red-700">{decodeURIComponent(error)}</p>
          </div>
        )}

        {sagaId && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Transaction Reference:</h3>
            <p className="text-sm text-gray-600">Saga ID: {sagaId}</p>
            <p className="text-xs text-gray-500 mt-1">Please provide this ID if you contact support.</p>
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
