'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ id, checked = false, onChange, label, error, className, disabled = false }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    return (
      <div className={cn("flex items-start gap-3", className)}>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
          />
          <div
            onClick={() => !disabled && onChange?.(!checked)}
            className={cn(
              "flex justify-center items-center mt-0.5 border-2 rounded w-5 h-5 transition-all cursor-pointer",
              checked
                ? "bg-[#00296B] border-[#00296B]"
                : "border-gray-300 bg-white hover:border-[#00296B]",
              disabled && "opacity-50 cursor-not-allowed",
              error && "border-red-500"
            )}
          >
            {checked && (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "flex-1 text-[#292929] text-sm cursor-pointer",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !disabled && onChange?.(!checked)}
          >
            {label}
          </label>
        )}
        {error && (
          <p className="mt-1 text-red-600 text-xs">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';