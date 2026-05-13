"use client";

import { useState } from "react";
import useAuthStore from "@/src/authStore";
// import Image from "next/image";
// import Logo from "@/assets/images/logo/logo.png";
import { LoginForm } from "@/components/forms/login-form";
import { api } from "@/src/lib/api";
import { HomeHeader } from "@/components/home/home-header";

// Interface for form data
interface FormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [, setIsSubmitting] = useState(false);
  const { login } = useAuthStore();

  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);

      console.log("Form submitted:", formData);

      // Call API to login the user (skipAuth since we're logging in)
      const response = await api.post('/api/auth/login', {
        email: formData.email,
        password: formData.password,
      }, { skipAuth: true }); // Skip auth header for login endpoint

      const data = await response.json();

      console.log(data.data)

      if (data.success) {
        // Check if 2FA is required
        if (data.data.requires2FA || data.data.user.twoFactorEnabled) {
          // Store temporary token and email in sessionStorage
          sessionStorage.setItem('2fa_temp_token', data.data.token);
          sessionStorage.setItem('2fa_email', formData.email);

          // Redirect to 2FA verification page
          window.location.href = "/auth/verify-2fa";
          return;
        }

        // Use Zustand to store user data
        login(data.data.user, data.data.token, data.data.refreshToken);

        // Redirect based on user role
        if (data.data.user.role === 'ADMIN') {
          window.location.href = "/admin";
        } else if (data.data.user.role === 'SCHOOL_ADMIN') {
          window.location.href = "/school-admin";
        } else if (data.data.user.role === 'SCHOOL') {
          window.location.href = "/school-dashboard";
        } else if (data.data.user.role === 'TEACHER_ADMIN') {
          window.location.href = "/teacher-admin";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        // Handle login error
        alert(data.message || "Login failed. Please try again.");
      }

    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <HomeHeader />
      <div className="flex flex-col items-center">
        {/* Logo */}
        {/* <div className="my-24">
          <Image
            src={Logo}
            alt="PayMyFees Logo"
            width={140}
            height={38}
          />
        </div> */}
        <div className="pt-24"/>

        {/* Login Form */}
        <div className="w-full max-w-sm sm:max-w-md p-6 border border-[#00296B] bg-white rounded-[16px] mx-4">
          <h1 className="text-[1.6875rem] font-semibold text-center mb-1">Sign In</h1>
          <p className="text-center font-semibold text-sm text-[#525252] mb-6">Finance Your Education, Stress Free</p>

          <LoginForm onSubmit={handleSubmit} />
        </div>
      </div>
    </>
  );
}