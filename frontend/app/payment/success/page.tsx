'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const orderId = searchParams.get('order_id');
  const userId = searchParams.get('user_id');
  const amount = searchParams.get('amount');
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Clean up any Razorpay related localStorage items
    const keysToRemove = [
      'prefill_data_v1',
      'rzp_device_id',
      'truecaller_user_metric',
      'userConsent',
      'checkoutData', // Also clear checkout data since payment is successful
    ];
    
    keysToRemove.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Failed to remove ${key} from localStorage:`, error);
      }
    });

    // Optional: Send analytics or confirmation to your backend
    if (paymentId && orderId) {
      // You can add analytics tracking here
      console.log('Payment successful:', { paymentId, orderId, userId });
      
      // Optional: Call your backend to confirm the payment was processed
      // confirmPaymentSuccess(paymentId, orderId);
    }

    setIsLoading(false);
  }, [paymentId, orderId, userId]);

  // Optional function to confirm payment with backend
  // const confirmPaymentSuccess = async (paymentId: string, orderId: string) => {
  //   try {
  //     await fetch('/api/payment/confirm', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ paymentId, orderId })
  //     });
  //   } catch (error) {
  //     console.error('Failed to confirm payment:', error);
  //   }
  // };

  const formatPaymentId = (id: string) => {
    // Format payment ID for better readability (e.g., pay_1234567890 -> pay_****7890)
    if (id.length > 8) {
      return id.substring(0, 4) + '****' + id.substring(id.length - 4);
    }
    return id;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Processing payment confirmation...</p>
        </div>
      </div>
    );
  }

  // Show error if no payment details are found
  if (!paymentId && !orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Invalid Access</h1>
          <p className="text-gray-600 mb-6">No payment information found.</p>
          <Link
            href="/"
            className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <div className="mb-6">
          {/* Success Animation */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Your payment has been processed successfully.</p>
          <p className="text-sm text-gray-500 mt-2">You will receive a confirmation email shortly.</p>
        </div>

        {/* Transaction Details */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
          <h2 className="text-lg font-semibold mb-3 text-center">Transaction Details</h2>
          
          {paymentId && (
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Payment ID:</span>
              <span className="text-sm text-gray-800 font-mono">{formatPaymentId(paymentId)}</span>
            </div>
          )}
          
          {orderId && (
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Order ID:</span>
              <span className="text-sm text-gray-800 font-mono">{orderId}</span>
            </div>
          )}
          
          {amount && (
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Amount:</span>
              <span className="text-sm text-gray-800 font-semibold">₹{amount}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-medium text-gray-600">Status:</span>
            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
              Completed
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/orders"
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition font-semibold"
          >
            View Order Details
          </Link>
          
          <Link
            href="/"
            className="block w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition font-semibold"
          >
            Continue Shopping
          </Link>
          
          <Link
            href="/payment"
            className="block w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition text-sm"
          >
            Make Another Payment
          </Link>
        </div>

        {/* Additional Information */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 font-medium mb-1">What happens next?</p>
          <ul className="text-xs text-blue-600 text-left space-y-1">
            <li>• Order confirmation email sent</li>
            <li>• Item(s) will be processed for shipping</li>
            <li>• Track your order in "My Orders"</li>
          </ul>
        </div>

        {/* Company Info */}
        <p className="mt-6 text-xs text-gray-500">
          Delente Technologies Pvt. Ltd.<br />
          M3M Cosmopolitan, Sector 66, Gurugram, Haryana 122002<br />
          <span className="text-gray-400">Transaction processed securely</span>
        </p>
      </div>
    </div>
  );
}