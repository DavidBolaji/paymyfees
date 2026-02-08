'use client';

import { useState } from 'react';
import { CreditCard, Trash2, Loader2, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PaymentMethodsSkeleton } from './payment-methods-skeleton';

export interface PaymentMethodData {
  id: string;
  cardType: string;
  last4: string;
  expMonth: string;
  expYear: string;
  bank: string | null;
  brand: string;
  isDefault: boolean;
}

interface LinkedPaymentMethodsProps {
  paymentMethods: PaymentMethodData[];
  isLoading: boolean;
  onAddCard: () => Promise<void>;
  onRemoveCard: (id: string) => Promise<void>;
  onCardClick: (card: PaymentMethodData) => void;
  className?: string;
}

export function LinkedPaymentMethods({
  paymentMethods,
  isLoading,
  onAddCard,
  onRemoveCard,
  onCardClick,
  className
}: LinkedPaymentMethodsProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (isLoading) {
    return <PaymentMethodsSkeleton className={className} />;
  }
  
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to remove this card?')) {
      return;
    }
    
    setDeletingId(id);
    try {
      await onRemoveCard(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddCardClick = async () => {
    setIsSubmitting(true);
    try {
      await onAddCard();
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={cn("rounded-xl border border-gray-200 p-6 bg-white", className)}>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Linked Payment Methods</h2>
      
      {/* Existing payment methods */}
      {paymentMethods.length > 0 && (
        <div className="mb-6 space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              onClick={() => onCardClick(method)}
              className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-[#00296B] hover:bg-blue-50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{method.brand}</span>
                    <span className="text-sm text-gray-600">****{method.last4}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Expiry {method.expMonth}/{method.expYear}
                  </div>
                  {method.isDefault && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                      Default
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Edit functionality can be added later
                  }}
                  className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                  aria-label="Edit payment method"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => handleDelete(method.id, e)}
                  disabled={deletingId === method.id}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  aria-label="Remove payment method"
                >
                  {deletingId === method.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Add Card Button - Always Visible */}
      <div className="space-y-4">
        <button
          onClick={handleAddCardClick}
          disabled={isSubmitting}
          className="w-full h-12 rounded-lg bg-[#00296B] text-white font-semibold hover:bg-[#003D82] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Redirecting to Paystack...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Add New Card
            </>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="mt-4 space-y-2">
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600">
            You'll be redirected to Paystack to securely enter your card details. A verification amount of ₦50 will be charged and immediately added to your wallet. Your card will be saved for quick future payments.
          </p>
        </div>
        
        {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs font-semibold text-yellow-800 mb-1">⚠️ Test Mode - Use Test Cards Only</p>
            <div className="text-xs text-yellow-700 space-y-1">
              <p className="font-medium">Visa: 4084084084084081</p>
              <p className="font-medium">Verve: 5060666666666666666</p>
              <p>CVV: 408 | Expiry: any future date | PIN: 0000 | OTP: 123456</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
