'use client';

import { useState } from 'react';
import { Edit2, Trash2, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PaymentMethodsSkeleton } from './payment-methods-skeleton';
import { PaymentCard } from '@/src/stores/walletStore';

interface LinkedPaymentMethodsProps {
  paymentMethods: PaymentCard[];
  isLoading: boolean;
  onAddPaymentMethod: (paymentMethod: Omit<PaymentCard, 'id'>) => Promise<boolean>;
  onRemovePaymentMethod: (id: string) => Promise<boolean>;
  className?: string;
}

export function LinkedPaymentMethods({
  paymentMethods,
  isLoading,
  onAddPaymentMethod,
  onRemovePaymentMethod,
  className
}: LinkedPaymentMethodsProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (isLoading) {
    return <PaymentMethodsSkeleton className={className} />;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await onAddPaymentMethod({
        cardNumber,
        cardType: getCardType(cardNumber),
        expiryDate,
        isDefault: paymentMethods.length === 0, // Make default if it's the first card
      });
      
      if (success) {
        // Reset form
        setCardNumber('');
        setCardHolder('');
        setExpiryDate('');
        setCvv('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Simple function to determine card type based on first digit
  const getCardType = (number: string): string => {
    const firstDigit = number.charAt(0);
    
    switch (firstDigit) {
      case '4':
        return 'Visa';
      case '5':
        return 'Mastercard';
      case '3':
        return 'Amex';
      case '6':
        return 'Discover';
      default:
        return 'Card';
    }
  };
  
  return (
    <div className={cn("rounded-xl border border-gray-200 p-6 bg-white", className)}>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Linked Payment Methods</h2>
      
      {/* Existing payment methods */}
      {paymentMethods.length > 0 && (
        <div className="mb-6 space-y-4">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{method.cardType}</span>
                    <span className="text-sm text-gray-600">****{method.cardNumber.slice(-4)}</span>
                  </div>
                  <div className="text-xs text-gray-500">Expiry {method.expiryDate}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Edit payment method"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                  aria-label="Remove payment method"
                  onClick={() => onRemovePaymentMethod(method.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Add new payment method form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Card Holder Name</label>
            <input
              type="text"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              placeholder="Enter card name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="xxxx xxxx xxxx xxxx"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={16}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 4) {
                    const month = value.slice(0, 2);
                    const year = value.slice(2, 4);
                    setExpiryDate(
                      value.length > 2 ? `${month}/${year}` : month
                    );
                  }
                }}
                placeholder="MM/YY"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={5}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CVV / CVC</label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                placeholder="MM/YY"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={4}
              />
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || !cardNumber || !cardHolder || !expiryDate || !cvv}
          className={cn(
            "w-full mt-6 h-12 rounded-lg bg-[#00296B] text-white font-semibold flex items-center justify-center gap-2",
            "disabled:bg-gray-300 disabled:cursor-not-allowed"
          )}
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              <span>Saving...</span>
            </>
          ) : (
            <span>Save</span>
          )}
        </button>
      </form>
    </div>
  );
}