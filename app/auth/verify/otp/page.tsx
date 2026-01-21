"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Logo from "@/assets/images/logo/logo.png";
import SuccessIcon from "@/assets/images/chain-lock-clip.png";

enum VerificationStatus {
  INPUT = "input",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [status, setStatus] = useState<VerificationStatus>(VerificationStatus.INPUT);
  const [message, setMessage] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes in seconds
  
  // Create refs for each input field
  const inputRef1 = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLInputElement>(null);
  const inputRef3 = useRef<HTMLInputElement>(null);
  const inputRef4 = useRef<HTMLInputElement>(null);
  const inputRef5 = useRef<HTMLInputElement>(null);
  const inputRef6 = useRef<HTMLInputElement>(null);
  
  // Array of refs for easier access
  const inputRefs = [inputRef1, inputRef2, inputRef3, inputRef4, inputRef5, inputRef6];

  // Timer for OTP expiration
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle OTP input change
  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.charAt(0);
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = inputRefs[index + 1];
      if (nextInput && nextInput.current) {
        nextInput.current.focus();
      }
    }

    // Auto-submit when all fields are filled
    if (value && index === 5 && newOtp.every((digit) => digit)) {
      handleVerify();
    }
  };

  // Handle key press for backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Focus previous input on backspace if current input is empty
      const prevInput = inputRefs[index - 1];
      if (prevInput && prevInput.current) {
        prevInput.current.focus();
      }
    }
  };

  // Handle OTP verification
  const handleVerify = async () => {
    if (otp.some((digit) => !digit)) {
      setMessage("Please enter the complete 6-digit OTP code.");
      return;
    }

    setStatus(VerificationStatus.LOADING);

    try {
      // Get userId from localStorage or session
      const userDataStr = localStorage.getItem("userData");
      if (!userDataStr) {
        setStatus(VerificationStatus.ERROR);
        setMessage("User session not found. Please try logging in again.");
        return;
      }

      const userData = JSON.parse(userDataStr);
      const userId = userData.user?.id;

      if (!userId) {
        setStatus(VerificationStatus.ERROR);
        setMessage("User ID not found. Please try logging in again.");
        return;
      }

      // Call API to verify email with OTP
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          token: otp.join(""),
          mode: "otp",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus(VerificationStatus.SUCCESS);
        // Update local storage with verified status
        const updatedUserData = {
          ...userData,
          user: {
            ...userData.user,
            emailVerified: true,
          },
        };
        localStorage.setItem("userData", JSON.stringify(updatedUserData));
      } else {
        setStatus(VerificationStatus.ERROR);
        setMessage(data.message || "Invalid OTP code. Please try again.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus(VerificationStatus.ERROR);
      setMessage("An error occurred during verification. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    try {
      // Get user email from localStorage
      const userDataStr = localStorage.getItem("userData");
      if (!userDataStr) {
        setMessage("User session not found. Please try logging in again.");
        return;
      }

      const userData = JSON.parse(userDataStr);
      const email = userData.user?.email;

      if (!email) {
        setMessage("User email not found. Please try logging in again.");
        return;
      }

      // Call API to resend OTP
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          mode: "otp",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("A new OTP has been sent to your email.");
        setTimeLeft(600); // Reset timer to 10 minutes
        setOtp(Array(6).fill("")); // Clear OTP input fields
      } else {
        setMessage(data.message || "Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setMessage("An error occurred. Please try again.");
    }
  };

  const handleContinue = () => {
    router.push("/dashboard");
  };

  const renderContent = () => {
    switch (status) {
      case VerificationStatus.INPUT:
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-center text-[#00296B]">Verify Your Email</h2>
            <p className="text-gray-600 mb-6 text-center">
              Enter the 6-digit code sent to your email address
            </p>

            {/* OTP Input Fields */}
            <div className="flex justify-center gap-2 mb-6">
              <input
                ref={inputRef1}
                type="text"
                value={otp[0]}
                onChange={(e) => handleChange(0, e.target.value)}
                onKeyDown={(e) => handleKeyDown(0, e)}
                className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#00296B] focus:outline-none"
                maxLength={1}
                autoFocus
              />
              <input
                ref={inputRef2}
                type="text"
                value={otp[1]}
                onChange={(e) => handleChange(1, e.target.value)}
                onKeyDown={(e) => handleKeyDown(1, e)}
                className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#00296B] focus:outline-none"
                maxLength={1}
              />
              <input
                ref={inputRef3}
                type="text"
                value={otp[2]}
                onChange={(e) => handleChange(2, e.target.value)}
                onKeyDown={(e) => handleKeyDown(2, e)}
                className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#00296B] focus:outline-none"
                maxLength={1}
              />
              <input
                ref={inputRef4}
                type="text"
                value={otp[3]}
                onChange={(e) => handleChange(3, e.target.value)}
                onKeyDown={(e) => handleKeyDown(3, e)}
                className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#00296B] focus:outline-none"
                maxLength={1}
              />
              <input
                ref={inputRef5}
                type="text"
                value={otp[4]}
                onChange={(e) => handleChange(4, e.target.value)}
                onKeyDown={(e) => handleKeyDown(4, e)}
                className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#00296B] focus:outline-none"
                maxLength={1}
              />
              <input
                ref={inputRef6}
                type="text"
                value={otp[5]}
                onChange={(e) => handleChange(5, e.target.value)}
                onKeyDown={(e) => handleKeyDown(5, e)}
                className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#00296B] focus:outline-none"
                maxLength={1}
              />
            </div>

            {/* Timer */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500">
                Time remaining: <span className="font-semibold">{formatTime(timeLeft)}</span>
              </p>
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={otp.some((digit) => !digit)}
              className={`w-full py-3 rounded-lg font-semibold ${
                otp.some((digit) => !digit)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#00296B] text-white hover:bg-blue-700"
              } transition-colors`}
            >
              Verify
            </button>

            {/* Resend OTP */}
            <div className="text-center mt-4">
              <button
                onClick={handleResendOtp}
                disabled={timeLeft > 0}
                className={`text-sm ${
                  timeLeft > 0 ? "text-gray-400" : "text-[#00296B] hover:underline"
                }`}
              >
                {timeLeft > 0 ? "Resend code after timer expires" : "Resend code"}
              </button>
            </div>

            {message && <p className="mt-4 text-red-500 text-center">{message}</p>}
          </div>
        );

      case VerificationStatus.LOADING:
        return (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold mb-2">Verifying your email</h2>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
          </div>
        );

      case VerificationStatus.SUCCESS:
        return (
          <div className="text-center">
            <div className="mb-6">
              <Image
                src={SuccessIcon}
                alt="Success"
                width={120}
                height={120}
                className="mx-auto"
              />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-[#00296B]">Email Verified Successfully!</h2>
            <p className="text-gray-600 mb-8">
              Your email has been verified successfully. You can now access all features of PayMyFees.
            </p>
            <button
              onClick={handleContinue}
              className="bg-[#00296B] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        );

      case VerificationStatus.ERROR:
        return (
          <div className="text-center">
            <div className="mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 text-red-500 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-[#00296B]">Verification Failed</h2>
            <p className="text-gray-600 mb-8">{message || "An error occurred during verification."}</p>
            <button
              onClick={() => setStatus(VerificationStatus.INPUT)}
              className="bg-[#00296B] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Logo */}
      <div className="my-24">
        <Image
          src={Logo}
          alt="PayMyFees Logo"
          width={140}
          height={38}
        />
      </div>

      {/* Verification Content */}
      <div className="w-full max-w-md p-8 border border-[#00296B] bg-white rounded-lg">
        {renderContent()}
      </div>
    </div>
  );
}