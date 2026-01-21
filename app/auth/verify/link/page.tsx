"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/assets/images/logo/logo.png";
import SuccessIcon from "@/assets/images/chain-lock-clip.png";
import ExpiredIcon from "@/assets/images/lock-and-key-cartoon.png";

enum VerificationStatus {
  LOADING = "loading",
  SUCCESS = "success",
  EXPIRED = "expired",
  ERROR = "error",
}

export default function VerifyLinkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<VerificationStatus>(VerificationStatus.LOADING);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus(VerificationStatus.ERROR);
      setMessage("Invalid verification link. No token provided.");
      return;
    }

    const verifyEmail = async () => {
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

        // Call API to verify email
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            token,
            mode: "link",
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
          if (data.error === "expired") {
            setStatus(VerificationStatus.EXPIRED);
          } else {
            setStatus(VerificationStatus.ERROR);
            setMessage(data.message || "Failed to verify email. Please try again.");
          }
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus(VerificationStatus.ERROR);
        setMessage("An error occurred during verification. Please try again.");
      }
    };

    verifyEmail();
  }, [token, router]);

  const handleContinue = () => {
    router.push("/dashboard");
  };

  const handleResendVerification = async () => {
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

      // Call API to resend verification
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          mode: "link",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Verification link has been resent to your email.");
      } else {
        setMessage(data.message || "Failed to resend verification. Please try again.");
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      setMessage("An error occurred. Please try again.");
    }
  };

  const renderContent = () => {
    switch (status) {
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

      case VerificationStatus.EXPIRED:
        return (
          <div className="text-center">
            <div className="mb-6">
              <Image
                src={ExpiredIcon}
                alt="Expired"
                width={120}
                height={120}
                className="mx-auto"
              />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-[#00296B]">Verification Link Expired</h2>
            <p className="text-gray-600 mb-8">
              The verification link has expired. Please request a new verification link.
            </p>
            <button
              onClick={handleResendVerification}
              className="bg-[#00296B] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Resend Verification Link
            </button>
            {message && <p className="mt-4 text-red-500">{message}</p>}
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
              onClick={handleResendVerification}
              className="bg-[#00296B] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Resend Verification Link
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