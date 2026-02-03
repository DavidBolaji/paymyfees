"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Logo from "@/assets/images/logo/logo.png";
import { ResetForm } from "@/components/forms/reset-form";
import { useSearchParams, useRouter } from "next/navigation";
import { LinkSwapIcon } from "@/assets/icons/LinkSwapIcon";
import { SentIcon } from "@/assets/icons/SentIcon";
import Link from "next/link";
import { LogoutIcon } from "@/assets/icons/LogoutIcon";
import { CheckBoldIcon } from "@/assets/icons/CheckBoldIcon";

// Interface for form data
interface FormData {
  password: string;
  confirmPassword: string;
}

enum VerificationStatus {
  LOADING = "loading",
  VALID = "valid",
  EXPIRED = "expired",
  ERROR = "error",
  SUCCESS = "success",
}

export default function ResetPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<VerificationStatus>(VerificationStatus.LOADING);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus(VerificationStatus.ERROR);
      setMessage("Invalid reset link. No token provided.");
      return;
    }

    // Token exists, set to valid to show the form
    setStatus(VerificationStatus.VALID);
  }, [token]);

  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus(VerificationStatus.SUCCESS);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } else {
        if (data.error === "reset_failed") {
          setStatus(VerificationStatus.EXPIRED);
        } else {
          setError(data.message || "Failed to reset password. Please try again.");
        }
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendRequest = () => {
    router.push("/auth/forgot-password");
  };

  const renderContent = () => {
    switch (status) {
      case VerificationStatus.LOADING:
        return (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold mb-2">Verifying link</h2>
            <p className="text-gray-600">
              Please wait while we verify your reset link...
            </p>
          </div>
        );

      case VerificationStatus.VALID:
        return (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            <ResetForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </>
        );

      case VerificationStatus.SUCCESS:
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-[#00296B] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckBoldIcon color="white" />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-[#00296B]">
              Password Reset Successful!
            </h2>
            <p className="text-gray-600 mb-8">
              Your password has been successfully reset. You will be redirected to the login page shortly.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-[#00296B] font-semibold"
            >
              <LogoutIcon /> Back to Log in
            </Link>
          </div>

        );

      case VerificationStatus.EXPIRED:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2 text-[#00296B]">
              Link Expired
            </h2>

            <div className="flex items-center justify-center">
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-[#E6EAF0] mt-5 mb-4">
                <LinkSwapIcon />
              </div>
            </div>

            <p className="text-[#525252] font-medium mb-8 text-sm">
              The reset link has expired or is invalid. Please request a new one.
            </p>

            <button
              type="button"
              onClick={handleResendRequest}
              className="bg-[#002561] w-full flex justify-center items-center gap-2 font-bold py-3 rounded-lg text-white"
            >
              <SentIcon /> Request New Link
            </button>

            {message && (
              <p className="mt-4 text-red-500 text-sm">{message}</p>
            )}
          </div>
        );

      case VerificationStatus.ERROR:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2 text-[#00296B]">
              Invalid Link
            </h2>

            <div className="flex items-center justify-center">
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-[#E6EAF0] mt-5 mb-4">
                <LinkSwapIcon />
              </div>
            </div>

            <p className="text-[#525252] font-medium mb-8 text-sm">
              {message || "The reset link is invalid. Please request a new one."}
            </p>

            <button
              type="button"
              onClick={handleResendRequest}
              className="bg-[#002561] w-full flex justify-center items-center gap-2 font-bold py-3 rounded-lg text-white"
            >
              <SentIcon /> Request New Link
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

      {/* Reset Form */}
      <div className="w-full max-w-md p-6 border border-[#00296B] bg-white rounded-lg">
        <h1 className="text-[1.6875rem] font-semibold text-center mb-1">
          Reset Password
        </h1>
        <p className="text-center font-semibold text-sm text-[#525252] mb-6">
          Enter your new password
        </p>

        {renderContent()}
      </div>
    </div>
  );
}