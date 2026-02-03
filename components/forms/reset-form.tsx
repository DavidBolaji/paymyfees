"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CustomInput } from "@/components/ui/custom-input";

// Form data interface
interface FormData {
    password: string;
    confirmPassword: string;
}

// Props interface
interface ResetFormProps {
    onSubmit: (data: FormData) => Promise<void>;
    isSubmitting?: boolean;
}

export function ResetForm({ onSubmit, isSubmitting = false }: ResetFormProps) {
    // Form state
    const [formData, setFormData] = useState<FormData>({
        password: "",
        confirmPassword: "",
    });

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

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
            case "password":
                if (!value) {
                    newErrors.password = "Password is required";
                } else if (value.length < 8) {
                    newErrors.password = "Password must be at least 8 characters";
                } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                    newErrors.password = "Password must contain uppercase, lowercase, and number";
                } else {
                    delete newErrors.password;
                }
                // Re-validate confirm password if it's been touched
                if (touched.confirmPassword && formData.confirmPassword) {
                    if (formData.confirmPassword !== value) {
                        newErrors.confirmPassword = "Passwords don't match";
                    } else {
                        delete newErrors.confirmPassword;
                    }
                }
                break;
            case "confirmPassword":
                if (!value) {
                    newErrors.confirmPassword = "Please confirm your password";
                } else if (value !== formData.password) {
                    newErrors.confirmPassword = "Passwords don't match";
                } else {
                    delete newErrors.confirmPassword;
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
        const requiredFields = ["confirmPassword", "password"];
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

        if (validateForm() && isFormValid()) {
            await onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 md:min-w-96">
            {/* Password */}
            <div>
                <CustomInput
                    label="New Password"
                    type="password"
                    value={formData.password}
                    placeholder="Enter your new password"
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

            {/* Confirm Password */}
            <div>
                <CustomInput
                    label="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    placeholder="Confirm your new password"
                    onChange={(value) => handleChange("confirmPassword", value)}
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => {
                        setConfirmPasswordFocused(false);
                        handleBlur("confirmPassword");
                    }}
                    error={
                        touched.confirmPassword &&
                        !!errors.confirmPassword &&
                        !confirmPasswordFocused
                    }
                />

                <AnimatePresence>
                    {touched.confirmPassword &&
                        errors.confirmPassword &&
                        !confirmPasswordFocused && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="text-red-500 text-xs mt-1"
                            >
                                {errors.confirmPassword}
                            </motion.p>
                        )}
                </AnimatePresence>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting || !isFormValid()}
                className={`bg-[#002561] w-full font-bold py-[0.9375rem] rounded-lg text-white ${isSubmitting || !isFormValid() ? "opacity-50 cursor-not-allowed" : ""
                    }`}
            >
                {isSubmitting ? "Resetting Password..." : "Reset Password"}
            </button>
        </form>
    );
}