'use client';

import { useState } from 'react';
import { FormInput, FormSelect } from '@/components/ui/form-input';
import { api } from '@/src/lib/api';
import useAuthStore from '@/src/authStore';
import { Loader2 } from 'lucide-react';
import { normalizeText } from '@/lib/utils';

const EMPLOYMENT_STATUS_OPTIONS = [
  { value: '', label: 'Select employment status' },
  { value: 'Employed', label: 'Employed' },
  { value: 'Self-Employed', label: 'Self-Employed' },
  { value: 'Unemployed', label: 'Unemployed' },
  { value: 'Retired', label: 'Retired' },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: '', label: 'Select employment type' },
  { value: 'Employee', label: 'Employee' },
  { value: 'Business', label: 'Business Person' },
];

const DURATION_OPTIONS = [
  { value: '', label: 'Select duration' },
  { value: '<1 year', label: 'Less than 1 year' },
  { value: '1-2 years', label: '1 – 2 years' },
  { value: '2-3 years', label: '2 – 3 years' },
  { value: '3-4 years', label: '3 – 4 years' },
  { value: '5+ years', label: '5 or more years' },
];

interface KycFormData {
  employmentStatus: string;
  employerName: string;
  employmentRole: string;
  employmentType: string;
  lengthOfEmployment: string;
  monthlyIncome: string;
}

interface ParentKycFormProps {
  /** Pre-filled values (e.g. from existing parentProfile) */
  initialValues?: Partial<KycFormData>;
  /** Called with the raw API response data on success */
  onSuccess?: (data: unknown) => void;
  /** Called when the user cancels / dismisses */
  onCancel?: () => void;
  /** Label for the submit button */
  submitLabel?: string;
  /** When true all fields are required for submission */
  requireAll?: boolean;
}

export function ParentKycForm({
  initialValues,
  onSuccess,
  onCancel,
  submitLabel = 'Save Details',
  requireAll = true,
}: ParentKycFormProps) {
  const { updateUser } = useAuthStore();

  const [form, setForm] = useState<KycFormData>({
    employmentStatus: initialValues?.employmentStatus ?? '',
    employerName: initialValues?.employerName ?? '',
    employmentRole: initialValues?.employmentRole ?? '',
    employmentType: initialValues?.employmentType ?? '',
    lengthOfEmployment: initialValues?.lengthOfEmployment ?? '',
    monthlyIncome: initialValues?.monthlyIncome ?? '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof KycFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const set = (field: keyof KycFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = ['employerName', 'employmentRole'].includes(field)
      ? normalizeText(e.target.value)
      : e.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setServerError(null);
  };

  const showEmployer = form.employmentStatus === 'Employed' || form.employmentStatus === 'Self-Employed';

  const validate = (): boolean => {
    if (!requireAll) return true;
    const errs: Partial<Record<keyof KycFormData, string>> = {};
    if (!form.employmentStatus) errs.employmentStatus = 'Employment status is required';
    if (!form.monthlyIncome || isNaN(Number(form.monthlyIncome)) || Number(form.monthlyIncome) <= 0) {
      errs.monthlyIncome = 'Please enter a valid monthly income';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError(null);
    try {
      const payload = {
        employmentStatus: form.employmentStatus,
        employerName: form.employerName || null,
        employmentRole: form.employmentRole || null,
        employmentType: form.employmentType || null,
        lengthOfEmployment: form.lengthOfEmployment || null,
        monthlyIncome: form.monthlyIncome ? Number(form.monthlyIncome) : null,
      };
      const rawRes = await api.put('/api/user/kyc', payload);
      const res = await rawRes.json();
      // Update the auth store so UI reflects changes immediately
      if (res?.data?.parentProfile) {
        updateUser({ parentProfile: res.data.parentProfile, isFirstTime: false } as never);
      } else {
        updateUser({ isFirstTime: false } as never);
      }
      onSuccess?.(res?.data);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message ?? 'Failed to save KYC details. Please try again.';
      setServerError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-[#7C7C7C]">
        <span className="text-red-500">*</span> Required fields
      </p>

      {serverError && (
        <p className="bg-red-50 px-3 py-2 border border-red-200 rounded-lg text-red-600 text-sm">{serverError}</p>
      )}

      <FormSelect
        label="Employment Status *"
        options={EMPLOYMENT_STATUS_OPTIONS}
        value={form.employmentStatus}
        onChange={set('employmentStatus')}
        error={errors.employmentStatus}
      />

      {showEmployer && (
        <FormInput
          label="Employer / Company Name"
          value={form.employerName}
          onChange={set('employerName')}
          placeholder="e.g. Acme Corporation"
          error={errors.employerName}
        />
      )}

      <FormInput
        label="Job Title / Role"
        value={form.employmentRole}
        onChange={set('employmentRole')}
        placeholder="e.g. Software Engineer"
        error={errors.employmentRole}
      />

      <FormSelect
        label="Employment Type"
        options={EMPLOYMENT_TYPE_OPTIONS}
        value={form.employmentType}
        onChange={set('employmentType')}
        error={errors.employmentType}
      />

      <FormSelect
        label="Duration with Current Employer"
        options={DURATION_OPTIONS}
        value={form.lengthOfEmployment}
        onChange={set('lengthOfEmployment')}
        error={errors.lengthOfEmployment}
      />

      <FormInput
        label="Monthly NET Income (₦) *"
        type="number"
        min="0"
        value={form.monthlyIncome}
        onChange={set('monthlyIncome')}
        placeholder="e.g. 250000"
        error={errors.monthlyIncome}
      />

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-[#00296B] rounded-lg h-12 font-medium text-[#00296B] transition-colors hover:bg-blue-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="flex flex-1 justify-center items-center gap-2 bg-[#00296B] hover:bg-[#002561] disabled:opacity-60 rounded-lg h-12 font-medium text-white transition-colors"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
