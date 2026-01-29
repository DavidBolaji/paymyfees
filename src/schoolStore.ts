/**
 * School Store
 * Zustand store for managing school state
 * Supports multiple schools per user
 */

import { SchoolProfile } from '@prisma/client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VerificationRequest {
  id: string;
  loanId: string;
  schoolId: string;
  studentName: string;
  studentClass: string;
  invoiceAmount: number;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
  enrollmentConfirmed: boolean;
  invoiceConfirmed: boolean;
  notes?: string;
  requestedAt: string;
  respondedAt?: string;
  loan: {
    id: string;
    loanNumber: string;
    user: {
      id: string;
      fullName: string;
      email: string;
    };
  };
}

export interface VerificationLog {
  id: string;
  date: string;
  activity: string;
  details: string;
  status: string;
  studentName: string;
  loanNumber: string;
}

export interface SupportMessage {
  id: string;
  message: string;
  priority: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

interface SchoolStore {
  // State
  profile: SchoolProfile | null; // Primary/current school
  schools: SchoolProfile[]; // All user schools
  selectedSchoolId: string | null; // Currently selected school
  verificationRequests: VerificationRequest[];
  verificationLogs: VerificationLog[];
  supportMessages: SupportMessage[];
  unreadSupportCount: number;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  setProfile: (profile: SchoolProfile | null) => void;
  setSchools: (schools: SchoolProfile[]) => void;
  setSelectedSchoolId: (schoolId: string | null) => void;
  setVerificationRequests: (requests: VerificationRequest[]) => void;
  setVerificationLogs: (logs: VerificationLog[]) => void;
  setSupportMessages: (messages: SupportMessage[]) => void;
  setUnreadSupportCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastFetched: (timestamp: number) => void;
  
  // Computed
  getCurrentSchool: () => SchoolProfile | null;
  getPrimarySchool: () => SchoolProfile | null;
  shouldRefetch: () => boolean;
  
  // Utilities
  clearStore: () => void;
}

const initialState = {
  profile: null,
  schools: [],
  selectedSchoolId: null,
  verificationRequests: [],
  verificationLogs: [],
  supportMessages: [],
  unreadSupportCount: 0,
  isLoading: false,
  error: null,
  lastFetched: null,
};

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export const useSchoolStore = create<SchoolStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setProfile: (profile) => set({ profile }),

      setSchools: (schools) => {
        // If there's no selected school and we have schools, select the primary one
        const state = get();
        if (!state.selectedSchoolId && schools.length > 0) {
          const primary = schools.find(s => s.isPrimary) || schools[0];
          set({ 
            schools, 
            selectedSchoolId: primary?.id,
            profile: primary 
          });
        } else {
          set({ schools });
        }
      },

      setSelectedSchoolId: (schoolId) => {
        const state = get();
        const school = state.schools.find(s => s.id === schoolId);
        set({ 
          selectedSchoolId: schoolId,
          profile: school || state.profile 
        });
      },

      setVerificationRequests: (requests) =>
        set({ verificationRequests: requests }),

      setVerificationLogs: (logs) =>
        set({ verificationLogs: logs }),

      setSupportMessages: (messages) =>
        set({ supportMessages: messages }),

      setUnreadSupportCount: (count) =>
        set({ unreadSupportCount: count }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      setLastFetched: (timestamp) =>
        set({ lastFetched: timestamp }),

      getCurrentSchool: () => {
        const state = get();
        if (state.selectedSchoolId) {
          return state.schools.find(s => s.id === state.selectedSchoolId) || state.profile;
        }
        return state.profile;
      },

      getPrimarySchool: () => {
        const state = get();
        return state.schools.find(s => s.isPrimary) || state.profile;
      },

      shouldRefetch: () => {
        const { lastFetched, schools } = get();

        // No data in store, should fetch
        if (schools.length === 0) {
          return true;
        }

        // No last fetch timestamp, should fetch
        if (!lastFetched) {
          return true;
        }

        // Check if cache has expired
        const now = Date.now();
        const cacheAge = now - lastFetched;
        return cacheAge > CACHE_DURATION;
      },

      clearStore: () => set(initialState),
    }),
    {
      name: 'paymyfees-school-storage',
      partialize: (state) => ({
        profile: state.profile,
        schools: state.schools,
        selectedSchoolId: state.selectedSchoolId,
      }),
    }
  )
);