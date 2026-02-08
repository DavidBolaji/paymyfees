/**
 * Payment Method API Utilities
 * Client-side functions for payment method operations
 */

import { api } from '@/src/lib/api';

export interface PaymentMethodDTO {
  id: string;
  cardType: string;
  last4: string;
  expMonth: string;
  expYear: string;
  bank: string | null;
  brand: string;
  isDefault: boolean;
  createdAt: string;
}

/**
 * Get all saved payment methods
 */
export async function getPaymentMethods(): Promise<{ success: boolean; data?: PaymentMethodDTO[]; error?: string }> {
  try {
    const response = await api.get('/api/payment-methods');
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || 'Failed to fetch payment methods',
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch payment methods',
    };
  }
}

/**
 * Initialize card addition
 */
export async function initializeCardAddition(amount: number = 50): Promise<{ success: boolean; data?: { paymentUrl: string; reference: string }; error?: string }> {
  try {
    const response = await api.post('/api/payment-methods/add-card', { amount });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || 'Failed to initialize card addition',
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('Error initializing card addition:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initialize card addition',
    };
  }
}

/**
 * Verify card addition
 */
export async function verifyCardAddition(reference: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await api.get(`/api/payment-methods/verify-card/${reference}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || 'Failed to verify card',
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('Error verifying card:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify card',
    };
  }
}

/**
 * Charge a saved card
 */
export async function chargeSavedCard(paymentMethodId: string, amount: number, note?: string): Promise<{ success: boolean; data?: { reference: string; amount: number; message: string }; error?: string }> {
  try {
    const response = await api.post('/api/payment-methods/charge', {
      paymentMethodId,
      amount,
      note,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || 'Failed to charge card',
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('Error charging card:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to charge card',
    };
  }
}

/**
 * Set default payment method
 */
export async function setDefaultPaymentMethod(paymentMethodId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await api.post('/api/payment-methods/set-default', {
      paymentMethodId,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || 'Failed to set default payment method',
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error setting default payment method:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to set default payment method',
    };
  }
}

/**
 * Delete a payment method
 */
export async function deletePaymentMethod(paymentMethodId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await api.delete(`/api/payment-methods/${paymentMethodId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || 'Failed to delete payment method',
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete payment method',
    };
  }
}
