

// Frontend - PaymentPage.tsx
'use client';
import { useState, FormEvent } from 'react';
import axios from 'axios';

interface OrderResponse {
  success: boolean;
  order: {
    id: string;
    amount: number;
    currency: string;
  };
}

export default function PaymentPage() {
  const [variantId] = useState<string>('68185c4f14a5b7905a0574b6');
  const [showroomId] = useState<number>(22);
  const [colorId] = useState<string>('68185c4f14a5b7905a0574b7');

  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const parsedAmount = Number(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      setLoading(false);
      return;
    }

    let orderData = null;

    try {
      // Reserve inventory
      await axios.get('http://localhost:5000/api/product/reserve-stock', {
        params: { productId: variantId, showroom_id: showroomId, color_id: colorId },
        timeout: 5000,
      });

      // Create order
      const { data }: { data: OrderResponse } = await axios.post(
        `http://localhost:5006/api/payment/order`,
        { amount: parsedAmount, currency: 'INR' },
        { timeout: 10000 }
      );

      if (!data.success || !data.order) {
        throw new Error('Failed to create order');
      }

      orderData = data.order;

      // Create form and submit to Razorpay
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://api.razorpay.com/v1/checkout/embedded';
      
      // Add form fields
      const fields = {
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_StrkvgR0IMUtoF',
        amount: data.order.amount.toString(),
        currency: data.order.currency,
        order_id: data.order.id,
        name: 'Delente Technologies Pvt. Ltd.',
        description: 'Payment for Services',
        prefill_name: 'Satya Singh',
        prefill_email: 'satya@gmail.com',
        notes_address: 'M3M Cosmopolitan, Sector 66, Gurugram, Haryana 122002',
        theme_color: '#1E40AF',
        callback_url: `http://localhost:5006/api/payment/callback`,
        cancel_url: `${window.location.origin}/payment/cancel?variant_id=${variantId}&showroom_id=${showroomId}&color_id=${colorId}`,
      };

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      
    } catch (err: any) {
      // Release inventory on error
      try {
        await axios.get('http://localhost:5003/api/inventory/release', {
          params: { variant_id: variantId, showroom_id: showroomId, color_id: colorId },
          timeout: 5000,
        });
      } catch (releaseErr) {
        console.error('Failed to release inventory:', releaseErr);
      }

      // Log payment failure if order was created
      if (orderData) {
        try {
          await axios.post('http://localhost:5006/api/payment/failure', {
            orderId: orderData.id,
            paymentId: null,
            errorCode: err.response?.status?.toString() || 'UNKNOWN_ERROR',
            errorDescription: err.response?.data?.message || err.message || 'Payment initialization failed',
            errorReason: 'ORDER_CREATION_FAILED',
            type: 'frontend_error',
          });
        } catch (logErr) {
          console.error('Failed to log payment failure:', logErr);
        }
      }
      
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to process payment or reserve inventory'
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Delente Technologies Payment</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount (INR)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 border ${
                error ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Enter amount"
              min="1"
              step="0.01"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              'Pay Now'
            )}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600 text-center">
          Delente Technologies Pvt. Ltd.
          <br />
          M3M Cosmopolitan, Sector 66, Gurugram, Haryana 122002
        </p>
      </div>
    </div>
  );
}