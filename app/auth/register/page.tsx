"use client";

import { useState } from "react";
import useAuthStore from "@/src/authStore";
import { RegisterForm, RegisterFormData } from "@/components/forms/register-form";
import { HomeHeader } from "@/components/home/home-header";

export default function RegisterPage() {
  const [, setIsSubmitting] = useState(false);
  const { login } = useAuthStore();

  const handleSubmit = async (formData: RegisterFormData) => {
    try {
      setIsSubmitting(true);

      const apiData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        middleName: formData.middleName.trim() || undefined,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        address: formData.address.trim(),
        city: formData.city.trim(),
        country: "Nigeria",
        role: formData.role || "STUDENT",
        schoolName: formData.schoolName.trim() || undefined,
        password: formData.password,
        confirmPassword: formData.password,
        mode: formData.verificationMode,
      };

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });

      const data = await response.json();

      if (data.success) {
        login(data.data.user, data.data.token, data.data.refreshToken);

        if (formData.verificationMode === "link") {
          window.location.href = "/auth/register/complete";
        } else {
          window.location.href = "/auth/verify/otp";
        }
      } else {
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
    <>
      <HomeHeader />
      <div className="flex flex-col items-center">
        <div className="pt-40" />
        <div className="w-[480px] p-6 border border-[#00296B] bg-white rounded-lg mb-10">
          <h1 className="text-[1.6875rem] font-semibold text-center mb-1">Sign Up</h1>
          <p className="text-center font-semibold text-sm text-[#525252] mb-6">
            Finance Your Education, Stress Free
          </p>
          <RegisterForm onSubmit={handleSubmit} />
        </div>
      </div>
    </>
  );
}
