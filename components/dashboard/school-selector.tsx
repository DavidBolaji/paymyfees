/**
 * School Selector Component
 * Allows users to select from verified schools + user's registered schools
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useSchoolProfile } from '@/hooks/useSchoolProfile';
import { fetchAllSchools } from '@/src/utils/school-api';
import { cn } from '@/lib/utils';

interface SchoolSelectorProps {
  value: string;
  onChange: (schoolId: string, schoolName: string) => void;
  error?: string;
  onRegisterClick?: () => void;
}

interface School {
  id: string;
  schoolName: string;
  isPrimary?: boolean;
  isUserSchool?: boolean;
}

export function SchoolSelector({ value, onChange, error, onRegisterClick }: SchoolSelectorProps) {
  const { schools: userSchools, getAllSchools } = useSchoolProfile();
  const [verifiedSchools, setVerifiedSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allSchools, setAllSchools] = useState<School[]>([]);

  // Fetch schools on mount
  useEffect(() => {
    loadSchools();
  }, []);

  // Combine schools when either list changes
  useEffect(() => {
    combineSchools();
  }, [userSchools, verifiedSchools]);

  const loadSchools = async () => {
    setIsLoading(true);
    try {
      // Fetch both user schools and verified schools in parallel
      const [, verifiedSchoolsData] = await Promise.all([
        getAllSchools().catch(() => []),
        fetchAllSchools().catch(() => [])
      ]);

      setVerifiedSchools(verifiedSchoolsData || []);
    } catch (error) {
      console.error('Error loading schools:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const combineSchools = () => {
    // Mark user schools
    const userSchoolsMarked = userSchools.map(school => ({
      ...school,
      isUserSchool: true
    }));

    // Get verified school IDs that are not already in user schools
    const userSchoolIds = new Set(userSchools.map(s => s.id));
    const uniqueVerifiedSchools = verifiedSchools.filter(
      school => !userSchoolIds.has(school.id)
    );

    // Combine: user schools first, then verified schools
    const combined = [...userSchoolsMarked, ...uniqueVerifiedSchools];
    setAllSchools(combined);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const schoolId = e.target.value;
    const school = allSchools.find(s => s.id === schoolId);
    if (school) {
      onChange(schoolId, school.schoolName);
    }
  };

  const schoolOptions = allSchools.map(school => {
    let label = school.schoolName;
    if (school.isPrimary) {
      label += ' (Primary)';
    } else if (school.isUserSchool) {
      label += ' (My School)';
    }
    return {
      value: school.id,
      label
    };
  });

  if (!isLoading && allSchools.length === 0) {
    return (
      <div className="space-y-2">
        <label className="block font-medium text-gray-700 text-sm">School Name</label>
        <div className="bg-gray-50 border-gray-200 p-4 border rounded-lg text-center">
          <p className="mb-3 text-gray-600 text-sm">No schools registered yet</p>
          <button
            type="button"
            onClick={onRegisterClick}
            className="inline-flex justify-center items-center gap-2 bg-[#00296B] hover:bg-[#002561] px-4 py-2 rounded-lg font-medium text-sm text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Register School
          </button>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block font-medium text-gray-700 text-sm">School Name</label>
      <div className="relative">
        <select
          value={value}
          onChange={handleChange}
          className={cn(
            "block px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-full",
            error ? "border-red-500" : "border-gray-300"
          )}
          disabled={isLoading}
        >
          <option value="">Select School</option>
          {schoolOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {isLoading && (
          <div className="right-3 absolute inset-y-0 flex items-center pointer-events-none">
            <div className="border-2 border-gray-300 border-t-transparent rounded-full w-4 h-4 animate-spin" />
          </div>
        )}
      </div>
      
      {onRegisterClick && (
        <button
          type="button"
          onClick={onRegisterClick}
          className="inline-flex items-center gap-1 hover:text-[#002561] text-[#00296B] text-sm transition-colors"
        >
          <Plus className="w-3 h-3" />
          Register New School
        </button>
      )}
      
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}