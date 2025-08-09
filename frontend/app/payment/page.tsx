
'use client';

import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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

interface Order {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

interface OrderResponse {
  success: boolean;
  saga_id: string;
  message: string;
  order: Order;
}

interface User {
  id: number;
  emailId: string;
}

export default function PaymentPage() {
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Get access token from localStorage
  const getAccessToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  };

  // Get user data from localStorage
  const getUserData = (): User | null => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
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

  // Format price in INR
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  // Load checkout data and user data from local storage
  useEffect(() => {
    const data = localStorage.getItem('checkoutData');
    const userData = getUserData();

    if (data) {
      try {
        const parsedData: CheckoutData = JSON.parse(data);
        setCheckoutData(parsedData);
      } catch (err) {
        console.error('Failed to parse checkout data:', err);
        setError('Failed to load cart details. Please return to cart.');
      }
    } else {
      setError('No cart data found. Please return to cart.');
    }

    if (userData) {
      setUser(userData);
    } else {
      setError('User not authenticated. Please login.');
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!checkoutData) {
      setError('No cart data available. Please return to cart.');
      setLoading(false);
      return;
    }

    if (!user) {
      setError('User not authenticated. Please login.');
      setLoading(false);
      return;
    }

    const { cartItems, total } = checkoutData;
    const accessToken = getAccessToken();

    if (!accessToken) {
      setError('Authentication token not found. Please login again.');
      setLoading(false);
      return;
    }

    if (!total || total <= 0) {
      setError('Invalid total amount.');
      setLoading(false);
      return;
    }

    const axiosInstance = createAxiosInstance();

    try {
      // Generate a product_id from cart items
      const productIds = cartItems.map(item => item.productId).join(',');

      const { data }: { data: OrderResponse } = await axiosInstance.post(
        `http://localhost:2004/api/payment/order`,
        {
          total_amount: total,
          currency: 'INR',
          checkout_data: checkoutData,
          product_id: productIds
        },
        { timeout: 10000 }
      );

      console.log("------------------------->", data);

      if (!data.success) {
        throw new Error(data.message || 'Failed to start payment process');
      }

      // Check if order data exists in the response
      if (!data.order) {
        throw new Error('Order data not received from server. Please check your backend response.');
      }

      const orderData = data.order;

      // Store sagaId for cancel handling
      localStorage.setItem('sagaId', data.saga_id);

      // Create form and submit to Razorpay
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://api.razorpay.com/v1/checkout/embedded';

      // Add form fields
      const fields = {
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_StrkvgR0IMUtoF',
        amount: (orderData.amount * 100).toString(), // Convert to paise
        currency: orderData.currency,
        order_id: orderData.id,
        name: 'Delente Technologies Pvt. Ltd.',
        description: 'Payment for Cart Items',
        prefill_name: user.emailId.split('@')[0] || 'Customer',
        prefill_email: user.emailId,
        notes_address: 'M3M Cosmopolitan, Sector 66, Gurugram, Haryana 122002',
        theme_color: '#1E40AF',
        callback_url: `http://localhost:2004/api/payment/callback`,
        cancel_url: `${window.location.origin}/payment/cancel`,
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
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to process payment'
      );
      setLoading(false);
    }
  };

  if (!checkoutData || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-6">Error</h1>
          <p className="text-red-500 mb-4">{error || 'Loading...'}</p>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/cart">Return to Cart</Link>
            </Button>
            {!user && (
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Delente Technologies Payment</h1>

        {/* User Info */}
        <div className="mb-4 text-sm text-gray-600">
          <p>Logged in as: {user.emailId.split('@')[0]}</p>
        </div>

        {/* Order Summary */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            {checkoutData.cartItems.map((item) => (
              <div
                key={`${item.productId}-${item.size}-${item.color}`}
                className="flex justify-between text-sm"
              >
                <span>
                  {item.name} (Size: {item.size}, Color: {item.color}, Qty: {item.quantity})
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(checkoutData.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatPrice(checkoutData.shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatPrice(checkoutData.tax)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(checkoutData.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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