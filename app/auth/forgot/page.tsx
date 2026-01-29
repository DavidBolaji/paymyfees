"use client";

import { useState } from "react";
import Image from "next/image";
import Logo from "@/assets/images/logo/logo.png";
import { ForgotForm } from "@/components/forms/forgot-form";

// Interface for form data
interface FormData {
  email: string;
}

export default function LoginPage() {
  const [, setIsSubmitting] = useState(false);

  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
    try {
    
    
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred. Please try again.");
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

      {/* Login Form */}
      <div className="w-full max-w-md p-6 border border-[#00296B] bg-white rounded-lg">
        <h1 className="text-[1.6875rem] font-semibold text-center mb-1">Forgot Password</h1>
        <p className="text-center font-semibold text-sm text-[#525252] mb-6">Enter your email to reset your password</p>

        <ForgotForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}