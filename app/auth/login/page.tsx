"use client";

import { useState } from "react";
import Image from "next/image";
import Logo from "@/assets/images/logo/logo.png";
import { LoginForm } from "@/components/forms/login-form";

// Interface for form data
interface FormData {
  email: string;
  password: string;
}

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      
      // Simulate API call
      console.log("Form submitted:", formData);
      
      // Here you would typically call an API to register the user
      // Example:
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error("Registration error:", error);
      // Handle error (e.g., show toast notification)
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
        <h1 className="text-[1.6875rem] font-semibold text-center mb-1">Sign Up</h1>
        <p className="text-center font-semibold text-sm text-[#525252] mb-6">Finance Your Education, Stress Free</p>
        
        <LoginForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}