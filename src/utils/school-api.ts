/**
 * School API Utilities
 * Client-side API calls for school operations
 */

import { api } from "../lib/api";

export interface RegisterSchoolPayload {
  schoolName: string;
  schoolAddress: string;
  city?: string;
  state?: string;
  country?: string;
  schoolEmail?: string;
  schoolPhone?: string;
  website?: string;
  schoolType?: string;
  yearEstablished?: number;
  registrationNumber?: string;
  contactPersonName?: string;
  contactPersonPosition?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  academicLevel?: string;
  currentAcademicSession?: string;
  isPrimary?: boolean;
}

export interface UpdateSchoolPayload {
  schoolName?: string;
  schoolAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  schoolEmail?: string;
  schoolPhone?: string;
  website?: string;
  schoolType?: string;
  yearEstablished?: number;
  registrationNumber?: string;
  contactPersonName?: string;
  contactPersonPosition?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  academicLevel?: string;
  currentAcademicSession?: string;
  note?: string;
}

/**
 * Fetch primary/specific school profile
 */
export const fetchSchoolProfile = async (schoolId?: string): Promise<any> => {
  try {
    const url = schoolId 
      ? `/api/schools/profile?schoolId=${schoolId}`
      : '/api/schools/profile';
      
    const response = await api.get(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch profile');
    }

    const result = await response.json();
    return result.data || null;
  } catch (error: any) {
    console.error('Error fetching school profile:', error);
    throw error;
  }
};

/**
 * Fetch all schools for authenticated user
 */
export const fetchAllUserSchools = async (): Promise<any[]> => {
  try {
    const response = await api.get('/api/schools/my-schools');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch schools');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error: any) {
    console.error('Error fetching user schools:', error);
    throw error;
  }
};

/**
 * Fetch primary school
 */
export const fetchPrimarySchool = async (): Promise<any> => {
  try {
    const response = await api.get('/api/schools/primary');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch primary school');
    }

    const result = await response.json();
    return result.data || null;
  } catch (error: any) {
    console.error('Error fetching primary school:', error);
    throw error;
  }
};

/**
 * Fetch all verified schools (public)
 */
export const fetchAllSchools = async (): Promise<any[]> => {
  try {
    const response = await api.get('/api/schools');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch schools');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error: any) {
    console.error('Error fetching schools:', error);
    throw error;
  }
};

/**
 * Register a new school
 */
export const registerSchoolApi = async (data: RegisterSchoolPayload): Promise<any> => {
  try {
    const response = await api.post('/api/schools/register', data);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to register school');
    }

    const result = await response.json();
    return result.data;
  } catch (error: any) {
    console.error('Error registering school:', error);
    throw error;
  }
};

/**
 * Set school as primary
 */
export const setPrimarySchoolApi = async (schoolId: string): Promise<any> => {
  try {
    const response = await api.put(`/api/schools/${schoolId}/set-primary`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to set primary school');
    }

    const result = await response.json();
    return result.data;
  } catch (error: any) {
    console.error('Error setting primary school:', error);
    throw error;
  }
};

/**
 * Update school profile
 */
export const updateSchoolProfileApi = async (
  schoolId: string,
  data: UpdateSchoolPayload
): Promise<any> => {
  try {
    const response = await api.put(`/api/schools/${schoolId}/profile`, data);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    const result = await response.json();
    return result.data;
  } catch (error: any) {
    console.error('Error updating school profile:', error);
    throw error;
  }
};

/**
 * Fetch verification requests for a school
 */
export const fetchVerificationRequestsApi = async (schoolId: string): Promise<any[]> => {
  try {
    const response = await api.get(`/api/schools/${schoolId}/verification-requests`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch verification requests');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error: any) {
    console.error('Error fetching verification requests:', error);
    throw error;
  }
};

/**
 * Fetch verification logs
 */
export const fetchVerificationLogsApi = async (schoolId: string, limit: number = 10): Promise<any[]> => {
  try {
    const response = await api.get(`/api/schools/${schoolId}/verification-logs?limit=${limit}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch verification logs');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error: any) {
    console.error('Error fetching verification logs:', error);
    throw error;
  }
};

/**
 * Fetch support messages
 */
export const fetchSupportMessagesApi = async (schoolId: string): Promise<{ messages: any[]; unreadCount: number }> => {
  try {
    const response = await api.get(`/api/schools/${schoolId}/support-messages`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch support messages');
    }

    const result = await response.json();
    return result.data || { messages: [], unreadCount: 0 };
  } catch (error: any) {
    console.error('Error fetching support messages:', error);
    throw error;
  }
};

/**
 * Mark support message as read
 */
export const markSupportMessageAsReadApi = async (messageId: string): Promise<boolean> => {
  try {
    const response = await api.put(`/api/schools/support-messages/${messageId}/mark-read`, );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to mark message as read');
    }

    return true;
  } catch (error: any) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

/**
 * Respond to verification request
 */
export const respondToVerificationRequestApi = async (
  verificationId: string,
  status: 'VERIFIED' | 'REJECTED',
  notes?: string
): Promise<any> => {
  try {
    const response = await api.post(`/api/school/verification-requests/${verificationId}/respond`, { status, notes });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to respond to verification');
    }

    const result = await response.json();
    return result.data;
  } catch (error: any) {
    console.error('Error responding to verification:', error);
    throw error;
  }
};

/**
 * Fetch disbursements for a school
 */
export const fetchDisbursementsApi = async (schoolId: string): Promise<any[]> => {
  try {
    const response = await api.get(`/api/schools/${schoolId}/disbursements`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch disbursements');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error: any) {
    console.error('Error fetching disbursements:', error);
    throw error;
  }
};