"use client";

import { useState } from "react";
import Image from "next/image";
import { RegisterForm } from "@/components/forms/register-form";
import Logo from "@/assets/images/logo/logo.png";

// Interface for form data
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  agreeToTerms: boolean;
  verificationMode: 'otp' | 'link';
}

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      
      // Prepare data for API
      const apiData = {
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.password,
        phone: "", // This would need to be added to the form
        role: "PARENT", // Default role
        mode: formData.verificationMode
      };
      
      // Call API to register the user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Store user data in localStorage for verification pages
        localStorage.setItem("userData", JSON.stringify(data.data));
        
        // Redirect to appropriate verification page based on mode
        if (formData.verificationMode === 'link') {
          // Show message about checking email
          // alert("Registration successful! Please check your email for a verification link.");
           window.location.href = "/auth/verify/link";
        } else {
          // Redirect to OTP verification page
          window.location.href = "/auth/verify/otp";
        }
      } else {
        // Handle registration error
        alert(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("An error occurred during registration. Please try again.");
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

      {/* Registration Form */}
      <div className="w-full max-w-md p-6 border border-[#00296B] bg-white rounded-lg">
        <h1 className="text-[1.6875rem] font-semibold text-center mb-1">Sign Up</h1>
        <p className="text-center font-semibold text-sm text-[#525252] mb-6">Finance Your Education, Stress Free</p>
        
        <RegisterForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}