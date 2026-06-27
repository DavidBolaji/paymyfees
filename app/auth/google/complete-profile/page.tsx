'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useAuthStore from '@/src/authStore';
import { CustomInput } from '@/components/ui/custom-input';
import { motion, AnimatePresence } from 'framer-motion';
import { Gender, UserRole } from '@prisma/client';

interface CompleteProfileData {
  phone: string;
  dob: string;
  role: UserRole;
  address: string;
  city: string;
  gender: Gender | '';
  schoolName: string;
}

const ROLES = [
  { value: UserRole.PARENT, label: 'Parent' },
  { value: UserRole.SCHOOL, label: 'School' },
  { value: UserRole.STUDENT, label: 'Student' },
  { value: UserRole.TEACHER, label: 'Teacher' },
];

const GENDERS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

export default function CompleteProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { login } = useAuthStore();

  const [formData, setFormData] = useState<CompleteProfileData>({
    phone: '',
    dob: '',
    role: UserRole.PARENT,
    address: 'Nigeria',
    city: 'Lagos',
    gender: '',
    schoolName: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CompleteProfileData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CompleteProfileData, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Guard: redirect if profile already complete or no session
  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user?.id) {
      router.push('/auth/login');
      return;
    }

    const profileComplete = (session.user as any).profileComplete === true;
    if (profileComplete) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  const set = (field: keyof CompleteProfileData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) validateField(field, value);
  };

  const touch = (field: keyof CompleteProfileData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (field: keyof CompleteProfileData, value: any) => {
    setErrors((prev) => {
      const next = { ...prev };
      const str = String(value ?? '').trim();

      switch (field) {
        case 'phone': {
          const ph = String(value ?? '').replace(/\s/g, '');
          if (!ph) next.phone = 'Phone number is required';
          else if (!/^(\+?234|0)[789]\d{9}$/.test(ph))
            next.phone = 'Enter a valid Nigerian phone number (e.g. 08012345678)';
          else delete next.phone;
          break;
        }
        case 'dob':
          if (!str) next.dob = 'Date of birth is required';
          else delete next.dob;
          break;
        case 'role':
          if (!value) next.role = 'Account type is required';
          else delete next.role;
          break;
        case 'schoolName':
          if (formData.role === UserRole.SCHOOL && !str)
            next.schoolName = 'School name is required for School role';
          else delete next.schoolName;
          break;
        default:
          break;
      }
      return next;
    });
  };

  const isValid = (): boolean => {
    const requiredFields: (keyof CompleteProfileData)[] = ['phone', 'dob', 'role'];
    if (formData.role === UserRole.SCHOOL) requiredFields.push('schoolName');

    return requiredFields.every((field) => {
      const value = formData[field];
      return value && String(value).trim() !== '';
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate all fields
    Object.keys(formData).forEach((field) => {
      validateField(field as keyof CompleteProfileData, formData[field as keyof CompleteProfileData]);
    });

    if (!isValid()) {
      setSubmitError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/google/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
          dob: formData.dob,
          role: formData.role,
          address: formData.address,
          city: formData.city,
          gender: formData.gender || undefined,
          schoolName: formData.role === UserRole.SCHOOL ? formData.schoolName : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete profile');
      }

      // Store custom JWT in Zustand
      login(data.data.user, data.data.token, data.data.refreshToken);

      // Redirect based on role
      const role = data.data.user.role;
      if (role === 'ADMIN') {
        window.location.href = '/admin';
      } else if (role === 'SCHOOL_ADMIN') {
        window.location.href = '/school-admin';
      } else if (role === 'SCHOOL') {
        window.location.href = '/school-dashboard';
      } else if (role === 'TEACHER_ADMIN') {
        window.location.href = '/teacher-admin';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Complete profile error:', error);
      setSubmitError(
        error instanceof Error ? error.message : 'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00296B]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen pt-10 pb-10">
      <div className="w-full max-w-md p-6 border border-[#00296B] bg-white rounded-[16px] mx-4">
        <h1 className="text-[1.6875rem] font-semibold text-center mb-1">Complete Your Profile</h1>
        <p className="text-center font-semibold text-sm text-[#525252] mb-6">
          Just a few more details to get started
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone Number */}
          <div>
            <CustomInput
              type="phone"
              placeholder="Phone Number"
              label="Phone Number"
              value={formData.phone}
              onChange={(val) => set('phone', val)}
              onBlur={() => touch('phone')}
              error={touched.phone && !!errors.phone}
            />
            {touched.phone && errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <CustomInput
              type="date"
              label="Date of Birth"
              value={formData.dob}
              onChange={(val) => set('dob', val)}
              onBlur={() => touch('dob')}
              error={touched.dob && !!errors.dob}
            />
            {touched.dob && errors.dob && (
              <p className="text-red-500 text-xs mt-1">{errors.dob}</p>
            )}
          </div>

          {/* Account Type / Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => set('role', e.target.value)}
              onBlur={() => touch('role')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00296B] focus:border-transparent"
              required
            >
              <option value="">Select Account Type</option>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            {touched.role && errors.role && (
              <p className="text-red-500 text-xs mt-1">{errors.role}</p>
            )}
          </div>

          {/* School Name (conditional) */}
          <AnimatePresence>
            {formData.role === UserRole.SCHOOL && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div>
                  <CustomInput
                    type="text"
                    placeholder="School Name"
                    label="School Name"
                    value={formData.schoolName}
                    onChange={(val) => set('schoolName', val)}
                    onBlur={() => touch('schoolName')}
                    error={touched.schoolName && !!errors.schoolName}
                  />
                  {touched.schoolName && errors.schoolName && (
                    <p className="text-red-500 text-xs mt-1">{errors.schoolName}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => set('gender', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00296B] focus:border-transparent"
            >
              <option value="">Select Gender (Optional)</option>
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          {/* Address */}
          <CustomInput
            type="text"
            placeholder="Address"
            label="Address"
            value={formData.address}
            onChange={(val) => set('address', val)}
          />

          {/* City */}
          <CustomInput
            type="text"
            placeholder="City"
            label="City"
            value={formData.city}
            onChange={(val) => set('city', val)}
          />

          {/* Error Message */}
          {submitError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm text-center"
            >
              {submitError}
            </motion.p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#00296B] text-white rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
          >
            {loading ? 'Completing Profile...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
