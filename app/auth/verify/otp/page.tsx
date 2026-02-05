'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Logo from '@/assets/images/logo/logo.png';
import { CheckBoldIcon } from '@/assets/icons/CheckBoldIcon';
import { LogoutIcon } from '@/assets/icons/LogoutIcon';
import { LinkSwapIcon } from '@/assets/icons/LinkSwapIcon';
import { SentIcon } from '@/assets/icons/SentIcon';
import useAuthStore from '@/src/authStore';

enum VerificationStatus {
  INPUT = 'input',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

export default function VerifyOtpPage() {
  const router = useRouter();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [status, setStatus] = useState<VerificationStatus>(
    VerificationStatus.INPUT
  );
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes

  // ✅ Zustand auth store
  const { user, hasHydrated, login } = useAuthStore();

  // Refs for OTP inputs - moved before early return
  const inputRefs = useRef<(HTMLInputElement | null)[]>(
    Array(6).fill(null)
  );

  // Guard: missing user session
  useEffect(() => {
    if (!user?.id) {
      setStatus(VerificationStatus.ERROR);
      setMessage('User session not found. Please try logging in again.');
    }
  }, [user]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Block render until Zustand rehydrates
  if (!hasHydrated) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.charAt(0);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }

    if (value && index === 5 && newOtp.every((d) => d)) {
      handleVerify();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Focus previous input on backspace if current input is empty 
      const prevInput = inputRefs.current[index - 1]; 
      if (prevInput) { 
        prevInput.focus(); 
      }
    }
  };

  const handleVerify = async () => {
    if (otp.some((digit) => !digit)) {
      setMessage('Please enter the complete 6-digit OTP code.');
      return;
    }

    if (!user?.id) {
      setStatus(VerificationStatus.ERROR);
      setMessage('User session not found. Please try logging in again.');
      return;
    }

    setStatus(VerificationStatus.LOADING);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          token: otp.join(''),
          mode: 'otp',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus(VerificationStatus.SUCCESS);

        // ✅ Update user in Zustand (persisted)
        login({
          ...user,
          emailVerified: true,
        });
      } else {
        setStatus(VerificationStatus.ERROR);
        setMessage(data.message || 'Invalid OTP code. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus(VerificationStatus.ERROR);
      setMessage('An error occurred during verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      if (!user?.email) {
        setMessage('User email not found. Please try logging in again.');
        return;
      }

      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          mode: 'otp',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('A new OTP has been sent to your email.');
        setTimeLeft(600);
        setOtp(Array(6).fill(''));
      } else {
        setMessage(data.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  const renderContent = () => {
    switch (status) {
      case VerificationStatus.INPUT:
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-center text-[#00296B]">
              Verify Your Email
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Enter the 6-digit code sent to your email address
            </p>

            {/* OTP Inputs */}
            <div className="flex justify-center gap-2 mb-6">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#00296B] focus:outline-none"
                  maxLength={1}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500">
                Time remaining:{' '}
                <span className="font-semibold">
                  {formatTime(timeLeft)}
                </span>
              </p>
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={otp.some((d) => !d)}
              className={`w-full py-3 rounded-lg font-semibold ${otp.some((d) => !d)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#00296B] text-white hover:bg-blue-700'
                } transition-colors`}
            >
              Verify
            </button>

            {/* Resend */}
            <div className="text-center mt-4">
              <button
                onClick={handleResendOtp}
                disabled={timeLeft > 0}
                className={`text-sm ${timeLeft > 0
                    ? 'text-gray-400'
                    : 'text-[#00296B] hover:underline'
                  }`}
              >
                {timeLeft > 0
                  ? 'Resend code after timer expires'
                  : 'Resend code'}
              </button>
            </div>

            {message && (
              <p className="mt-4 text-red-500 text-center">{message}</p>
            )}
          </div>
        );

      case VerificationStatus.LOADING:
        return (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold mb-2">
              Verifying your email
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your email address...
            </p>
          </div>
        );

      case VerificationStatus.SUCCESS:
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-[#00296B] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckBoldIcon color="white" />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-[#00296B]">
              Verification Successful
            </h2>
            <p className="text-gray-600 mb-8">
              Congratulations! Your email has been verified successfully.
            </p>
            <button
              onClick={() => router.push('/auth/login')}
              className="inline-flex items-center gap-2 text-[#00296B] font-semibold"
            >
              <LogoutIcon /> Back to Log in
            </button>
          </div>
        );

      case VerificationStatus.ERROR:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2 text-[#00296B]">
              Verification Failed
            </h2>

            <div className="flex items-center justify-center">
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-[#E6EAF0] mt-5 mb-4">
                <LinkSwapIcon />
              </div>
            </div>

            <p className="text-[#525252] font-medium mb-8 text-sm">
              {message || 'An error occurred during verification.'}
            </p>

            <button
              type="button"
              onClick={() => setStatus(VerificationStatus.INPUT)}
              disabled={loading}
              className={`bg-[#002561] w-full flex justify-center items-center gap-2 font-bold py-3 rounded-lg text-white ${loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              <SentIcon /> {loading ? 'Sending...' : 'Try Again'}
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Logo */}
      <div className="my-24">
        <Image src={Logo} alt="PayMyFees Logo" width={140} height={38} />
      </div>

      {/* Content */}
      <div className="w-full max-w-md p-8 border border-[#00296B] bg-white rounded-lg">
        {renderContent()}
      </div>
    </div>
  );
}
