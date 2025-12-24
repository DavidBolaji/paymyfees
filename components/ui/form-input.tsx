'use client';

import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block font-semibold text-[#292929] text-sm">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "bg-[#f5f5f5] px-3 border focus:border-[#00296B] rounded-lg focus:outline-none w-full h-12 text-[#292929] transition-colors",
            error ? "border-red-500" : "border-[#d1d1d1]",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-red-600 text-xs">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-[#7C7C7C] text-xs">{helperText}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, helperText, options, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block font-semibold text-[#292929] text-sm">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "bg-[#f5f5f5] px-3 border focus:border-[#00296B] rounded-lg focus:outline-none w-full h-12 text-[#292929] transition-colors appearance-none",
              error ? "border-red-500" : "border-[#d1d1d1]",
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="top-1/2 right-3 absolute w-4 h-4 text-gray-500 -translate-y-1/2 pointer-events-none transform" />
        </div>
        {error && (
          <p className="text-red-600 text-xs">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-[#7C7C7C] text-xs">{helperText}</p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';