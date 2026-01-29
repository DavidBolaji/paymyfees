'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle2, Loader2, AlertTriangle, Calendar, CreditCard, Wallet as WalletIcon } from 'lucide-react';
import { api } from '@/src/lib/api';

interface NextDueInstallment {
    id: string;
    amount: number;
    dueDate: Date;
    loanNumber: string;
    schoolName: string;
    installmentNumber: number;
    daysUntilDue: number;
    lateFee: number;
    totalAmount: number;
}

interface MakeRepaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    walletBalance: number;
}

export default function MakeRepaymentModal({
    isOpen,
    onClose,
    onSuccess,
    walletBalance
}: MakeRepaymentModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingInstallment, setIsFetchingInstallment] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [nextDue, setNextDue] = useState<NextDueInstallment | null>(null);
    const [hasInsufficientBalance, setHasInsufficientBalance] = useState(false);
    const [amountNeeded, setAmountNeeded] = useState(0);
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Fetch next due installment
    useEffect(() => {
        if (isOpen) {
            fetchNextDueInstallment();
        }
    }, [isOpen]);

    const fetchNextDueInstallment = async () => {
        setIsFetchingInstallment(true);
        setError(null);

        try {
            const response = await api.get('/api/repayment/next-due');

            if (!response.ok) {
                throw new Error('Failed to fetch next due installment');
            }

            const data = await response.json();

            if (data.success) {
                setNextDue(data.data.nextDue);
                setHasInsufficientBalance(data.data.hasInsufficientBalance);
                setAmountNeeded(data.data.amountNeeded);
            }
        } catch (err) {
            console.error('Error fetching installment:', err);
            setError('Failed to load payment information');
        } finally {
            setIsFetchingInstallment(false);
        }
    };

    const handleConfirmPayment = () => {
        // Show confirmation before processing
        setShowConfirmation(true);
    };

    const handleMakeRepayment = async () => {
        if (!nextDue) return;

        setError(null);
        setIsLoading(true);

        try {
            const response = await api.post('/api/repayment/pay', {
                installmentId: nextDue.id,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Repayment failed');
            }

            if (data.success) {
                // Show success message
                onSuccess?.();
                onClose();
            } else {
                throw new Error(data.message || 'Repayment failed');
            }
        } catch (err) {
            console.error('Repayment error:', err);
            setError(err instanceof Error ? err.message : 'Failed to process repayment');
            setShowConfirmation(false); // Go back to main view on error
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !isLoading) {
            onClose();
        }
    };

    // Confirmation Screen
    if (showConfirmation && nextDue) {
        return (
            <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={handleOverlayClick}
            >
                <div
                    className="bg-white rounded-2xl shadow-2xl border border-[#F2F2F2] w-full max-w-md"
                    style={{ padding: '23px 15px' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-semibold text-[#191919]">Confirm Payment</h2>
                        <button
                            onClick={() => setShowConfirmation(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Go back"
                            disabled={isLoading}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Confirmation Message */}
                    <div className="mb-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Confirm Repayment
                        </h3>
                        <p className="text-sm text-gray-600">
                            You are about to pay your loan installment. This action cannot be undone.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Payment Details */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">School</span>
                            <span className="font-medium text-gray-900">{nextDue.schoolName}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Loan Number</span>
                            <span className="font-medium text-gray-900">{nextDue.loanNumber}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Installment</span>
                            <span className="font-medium text-gray-900">#{nextDue.installmentNumber}</span>
                        </div>
                        <div className="pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Amount to Deduct</span>
                                <span className="text-xl font-bold text-[#00296B]">
                                    ₦{nextDue.totalAmount.toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Current Balance</span>
                            <span className="font-semibold text-gray-900">
                                ₦{walletBalance.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Balance After Payment</span>
                            <span className="font-semibold text-green-600">
                                ₦{(walletBalance - nextDue.totalAmount).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setShowConfirmation(false)}
                            disabled={isLoading}
                            className="h-12 rounded-lg border-2 border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleMakeRepayment}
                            disabled={isLoading}
                            className="h-12 rounded-lg bg-[#00296B] text-white font-semibold hover:bg-[#003D82] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    Confirm & Pay
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main Screen
    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleOverlayClick}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl border border-[#F2F2F2] w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                style={{ padding: '23px 15px' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-[#191919]">Make Repayment</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close modal"
                        disabled={isLoading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Wallet Balance Display */}
                <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                            <WalletIcon className="w-4 h-4" />
                            Available Balance
                        </span>
                        <span className="text-lg font-semibold text-[#00296B]">
                            ₦{walletBalance.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Loading State */}
                {isFetchingInstallment ? (
                    <div className="py-12 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-[#00296B] animate-spin mb-3" />
                        <p className="text-sm text-gray-600">Loading payment information...</p>
                    </div>
                ) : (
                    <>
                        {/* No Pending Installments */}
                        {!nextDue ? (
                            <div className="py-12 flex flex-col items-center justify-center">
                                <CheckCircle2 className="w-12 h-12 text-green-600 mb-3" />
                                <p className="text-lg font-medium text-gray-900 mb-1">All Paid Up!</p>
                                <p className="text-sm text-gray-600">You have no pending payments</p>
                            </div>
                        ) : (
                            <>
                                {/* Next Due Payment */}
                                <div className="mb-5">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Next Payment Due</h3>
                                    <div className="p-5 rounded-lg border-2 border-[#00296B] bg-blue-50">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="font-semibold text-lg text-gray-900">{nextDue.schoolName}</p>
                                                <p className="text-sm text-gray-600">Loan #{nextDue.loanNumber}</p>
                                                <p className="text-xs text-gray-500 mt-1">Installment #{nextDue.installmentNumber}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600 mb-1">Amount Due</p>
                                                <p className="font-bold text-2xl text-[#00296B]">
                                                    ₦{nextDue.totalAmount.toLocaleString()}
                                                </p>
                                                {nextDue.lateFee > 0 && (
                                                    <p className="text-xs text-red-600 mt-1">
                                                        (includes ₦{nextDue.lateFee.toLocaleString()} late fee)
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm pt-3 border-t border-blue-200">
                                            <div className="flex items-center gap-1 text-gray-700">
                                                <Calendar className="w-4 h-4" />
                                                <span>Due: {new Date(nextDue.dueDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}</span>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${nextDue.daysUntilDue < 0
                                                    ? 'bg-red-100 text-red-700'
                                                    : nextDue.daysUntilDue <= 7
                                                        ? 'bg-orange-100 text-orange-700'
                                                        : 'bg-green-100 text-green-700'
                                                }`}>
                                                {nextDue.daysUntilDue < 0
                                                    ? `${Math.abs(nextDue.daysUntilDue)} days overdue`
                                                    : nextDue.daysUntilDue === 0
                                                        ? 'Due today'
                                                        : `${nextDue.daysUntilDue} days until due`
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Insufficient Balance Warning */}
                                {hasInsufficientBalance && (
                                    <div className="mb-5 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-orange-900 mb-1">Insufficient Wallet Balance</p>
                                                <p className="text-sm text-orange-800 mb-3">
                                                    You need <span className="font-semibold">₦{amountNeeded.toLocaleString()}</span> more to make this payment.
                                                </p>
                                                <p className="text-xs text-orange-700">
                                                    Please fund your wallet before making this repayment.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Payment Summary */}
                                <div className="mb-5 p-4 bg-gray-50 rounded-lg space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Base Amount</span>
                                        <span className="font-semibold text-gray-900">
                                            ₦{nextDue.amount.toLocaleString()}
                                        </span>
                                    </div>
                                    {nextDue.lateFee > 0 && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Late Fee</span>
                                            <span className="font-semibold text-red-600">
                                                ₦{nextDue.lateFee.toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                    <div className="pt-2 border-t border-gray-200">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 font-semibold">Total to Pay</span>
                                            <span className="font-bold text-lg text-[#00296B]">
                                                ₦{nextDue.totalAmount.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Wallet Balance</span>
                                        <span className="font-semibold text-gray-900">
                                            ₦{walletBalance.toLocaleString()}
                                        </span>
                                    </div>
                                    {!hasInsufficientBalance && (
                                        <div className="pt-2 border-t border-gray-200">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Balance After Payment</span>
                                                <span className="font-semibold text-green-600">
                                                    ₦{(walletBalance - nextDue.totalAmount).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="h-12 rounded-lg border-2 border-[#00296B] bg-white text-[#00296B] font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <X className="w-5 h-5" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmPayment}
                                        disabled={isLoading || hasInsufficientBalance}
                                        className="h-12 rounded-lg bg-[#00296B] text-white font-semibold hover:bg-[#003D82] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CreditCard className="w-5 h-5" />
                                        {hasInsufficientBalance ? 'Insufficient Balance' : 'Proceed to Pay'}
                                    </button>
                                </div>

                                {/* Info Text */}
                                <div className="flex items-start gap-2 mt-5">
                                    <div className="w-4 h-4 mt-0.5 flex-shrink-0">
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <circle cx="8" cy="8" r="7" stroke="#00296B" strokeWidth="1.5" />
                                            <path
                                                d="M8 4.5V5.5M8 7.5V11.5"
                                                stroke="#00296B"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        You can only pay the next due installment. Payments are processed in chronological order.
                                        Full installment amount will be deducted from your wallet.
                                    </p>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}