"use client";

import { useState } from "react";
import Image from "next/image";
import Logo from "@/assets/images/logo/logo.png";
import { ForgotForm } from "@/components/forms/forgot-form";
import { SentIcon } from "@/assets/icons/SentIcon";

// Interface for form data
interface FormData {
  email: string;
}

export default function ForgotPage() {
  const [, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string>("");

  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setEmailSent(true);
      } else {
        setError(data.message || "Failed to send reset email. Please try again.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
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

      {/* Form Container */}
      <div className="w-full max-w-md p-6 border border-[#00296B] bg-white rounded-lg">
        {!emailSent ? (
          <>
            <h1 className="text-[1.6875rem] font-semibold text-center mb-1">
              Forgot Password
            </h1>
            <p className="text-center font-semibold text-sm text-[#525252] mb-6">
              Enter your email to reset your password
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <ForgotForm onSubmit={handleSubmit} />
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2 text-[#00296B]">
              Check Your Email
            </h2>

            <div className="flex items-center justify-center">
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-[#E6EAF0] mt-5 mb-4">
                <SentIcon />
              </div>
            </div>

            <p className="text-[#525252] font-medium mb-8 text-sm">
              If an account exists with the email you provided, you will receive a password reset link shortly. Please check your inbox and spam folder.
            </p>

            <button
              type="button"
              onClick={() => {
                setEmailSent(false);
                setError("");
              }}
              className="text-[#002561] font-semibold hover:underline"
            >
              Try another email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}