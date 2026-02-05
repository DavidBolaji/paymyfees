'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/src/lib/api';

/**
 * Payment Callback Page
 * Handles the redirect from Paystack after payment
 * /wallet/payment-callback
 */
export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('Verifying your payment...');
  const [transactionDetails, setTransactionDetails] = useState<{
    amount?: number;
    reference?: string;
    newBalance?: number;
  }>({});

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get reference from URL params
        const reference = searchParams.get('reference');
        
        if (!reference) {
          setStatus('failed');
          setMessage('Payment reference not found');
          return;
        }

        // Get stored payment details
        const storedReference = sessionStorage.getItem('pending_payment_reference');
        // const storedAmount = sessionStorage.getItem('pending_payment_amount');

        if (storedReference !== reference) {
          setStatus('failed');
          setMessage('Payment reference mismatch');
          return;
        }

        // Verify payment with backend
        const response = await api.get(`/api/wallet/verify-payment/${reference}`);

        if (!response.ok) {
          throw new Error('Payment verification failed');
        }

        const data = await response.json();

        if (data.success && data.data.verified) {
          setStatus('success');
          setMessage('Payment successful! Your wallet has been credited.');
          setTransactionDetails({
            amount: data.data.amount,
            reference: reference,
            newBalance: data.data.newBalance,
          });

          // Clear stored payment details
          sessionStorage.removeItem('pending_payment_reference');
          sessionStorage.removeItem('pending_payment_amount');

          // Redirect to wallet page after 3 seconds
          setTimeout(() => {
            router.push('/dashboard/wallet');
          }, 3000);
        } else {
          setStatus('failed');
          setMessage('Payment verification failed. Please contact support.');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('failed');
        setMessage('Failed to verify payment. Please contact support if funds were debited.');
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          {status === 'verifying' && (
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          )}
          {status === 'failed' && (
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          )}
        </div>

        {/* Status Message */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {status === 'verifying' && 'Verifying Payment'}
            {status === 'success' && 'Payment Successful'}
            {status === 'failed' && 'Payment Failed'}
          </h1>
          <p className="text-gray-600">{message}</p>
        </div>

        {/* Transaction Details */}
        {status === 'success' && transactionDetails.amount && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Amount Paid</span>
              <span className="text-lg font-semibold text-gray-900">
                ₦{transactionDetails.amount.toLocaleString()}
              </span>
            </div>
            {transactionDetails.newBalance && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Balance</span>
                <span className="text-lg font-semibold text-gray-900">
                  ₦{transactionDetails.newBalance.toLocaleString()}
                </span>
              </div>
            )}
            {transactionDetails.reference && (
              <div className="pt-3 border-t border-gray-200">
                <span className="text-xs text-gray-500">Reference: {transactionDetails.reference}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {status === 'success' && (
            <p className="text-sm text-center text-gray-500">
              Redirecting to wallet in 3 seconds...
            </p>
          )}
          
          <button
            onClick={() => router.push('/wallet')}
            className="w-full h-12 rounded-lg bg-[#00296B] text-white font-semibold hover:bg-[#003D82] transition-colors"
          >
            {status === 'verifying' ? 'Please wait...' : 'Go to Wallet'}
          </button>

          {status === 'failed' && (
            <button
              onClick={() => router.push('/wallet')}
              className="w-full h-12 rounded-lg border-2 border-[#00296B] bg-white text-[#00296B] font-semibold hover:bg-gray-50 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>

        {/* Support Link */}
        {status === 'failed' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help?{' '}
              <a href="/support" className="text-[#00296B] font-medium hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}