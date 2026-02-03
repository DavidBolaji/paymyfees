"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CustomInput } from "@/components/ui/custom-input";

// Form data interface
interface FormData {
  email: string;
}

// Props interface
interface ForgotFormProps {
  onSubmit: (data: FormData) => Promise<void>;
}

export function ForgotForm({ onSubmit }: ForgotFormProps) {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    email: "",
  });

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [emailFocused, setEmailFocused] = useState(false);

  // Loading state
  const [loading, setLoading] = useState(false);

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
    const requiredFields = ["email"];
    const hasAllRequiredFields = requiredFields.every((field) => {
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
        await onSubmit(formData);
      } catch (error) {
        console.error("Forgot password error:", error);
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
          onFocus={() => setEmailFocused(true)}
          onBlur={() => {
            setEmailFocused(false);
            handleBlur("email");
          }}
          error={touched.email && !!errors.email && !emailFocused}
        />
        <AnimatePresence>
          {touched.email && errors.email && !emailFocused && (
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

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !isFormValid()}
        className={`bg-[#002561] w-full font-bold py-[0.9375rem] rounded-lg text-white ${
          loading || !isFormValid() ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </button>
    </form>
  );
}