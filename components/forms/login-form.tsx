"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CustomInput } from "@/components/ui/custom-input";
import Link from "next/link";
import { signIn } from "next-auth/react";

// Form data interface
interface FormData {
  email: string;
  password: string;
}

// Props interface
interface LoginFormProps {
  onSubmit: (data: FormData) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",

  });

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [passwordFocused, setPasswordFocused] = useState(false);
  // Loading state
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await signIn('google', { callbackUrl: '/auth/google/callback' });
    // signIn redirects, so setGoogleLoading(false) won't run — but reset on error
    setGoogleLoading(false);
  };

  // Handle input changes
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Validate on change if the field has been touched
    if (touched[field]) {
      validateField(field, value);
    }
  };

  // Handle blur events
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field as keyof typeof formData]);
  };

  // Validate a single field
  const validateField = (field: string, value: any) => {
    let newErrors = { ...errors };

    switch (field) {
      case "email":
        if (!value.trim()) {
          newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.email = "Email is invalid";
        } else {
          delete newErrors.email;
        }
        break;

      case "password":
        if (!value) {
          newErrors.password = "Password is required";
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  // Validate all fields
  const validateForm = () => {
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);

    setTouched(allTouched);

    // Validate each field
    Object.keys(formData).forEach((field) => {
      validateField(field, formData[field as keyof typeof formData]);
    });

    // Return true if no errors
    return Object.keys(errors).length === 0;
  };

  // Check if form is valid
  const isFormValid = () => {
    // Check if all required fields have values
    const requiredFields = ["email", "password"];
    const hasAllRequiredFields = requiredFields.every(field => {
      if (field === "agreeToTerms") return formData[field as keyof typeof formData];
      return !!formData[field as keyof typeof formData];
    });

    // Check if there are no validation errors
    const hasNoErrors = Object.keys(errors).length === 0;

    return hasAllRequiredFields && hasNoErrors;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        setLoading(true);
        // Normalize email before submission
        const normalizedFormData = {
          ...formData,
          email: formData.email.trim().toLowerCase()
        };
        await onSubmit(normalizedFormData);
      } catch (error) {
        console.error("Login error:", error);
        // Handle submission error
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:min-w-96">
      {/* Email */}
      <div>
        <CustomInput
          label="Email"
          type="email"
          value={formData.email}
          placeholder="Enter your email address"
          onChange={(value) => handleChange("email", value)}
          onBlur={() => handleBlur("email")}
          error={touched.email && !!errors.email}
        />
        <AnimatePresence>
          {touched.email && errors.email && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-red-500 text-xs mt-1"
            >
              {errors.email}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Password */}
      <div>
        <CustomInput
          label="Password"
          type="password"
          value={formData.password}
          placeholder="Enter your password"
          onChange={(value) => handleChange("password", value)}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => {
            setPasswordFocused(false);
            handleBlur("password");
          }}
          error={touched.password && !!errors.password && !passwordFocused}
        />

    
        <AnimatePresence>
          {touched.password && errors.password && !passwordFocused && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-red-500 text-xs mt-1"
            >
              {errors.password}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

     

      {/* Forgot Password Link */}
      <div className="-translate-y-3">
        <Link href="/auth/forgot" className="text-xs font-semibold text-[#00296B] hover:underline">
          Forgot Password?
        </Link>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !isFormValid()}
        className={`bg-[#002561] w-full font-bold py-[0.9375rem] rounded-lg text-white ${
          loading || !isFormValid() ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Submitting..." : "Sign In"}
      </button>

      {/* Divider */}
      <div className="flex items-center justify-center my-4">
        <span className="px-3 text-gray-500 text-sm">or</span>
      </div>

      {/* Google Sign In */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
        className="w-full py-3 border border-gray-300 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {googleLoading ? (
          <svg className="animate-spin h-[18px] w-[18px] text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
          </svg>
        )}
        <span>{googleLoading ? "Redirecting to Google..." : "Continue with Google"}</span>
      </button>

      {/* Sign In Link */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          New to PayMyFees?{" "}
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </form>
  );
}