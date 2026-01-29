/**
 * useSchoolProfile Hook
 * Custom hook for managing school profile operations
 * Supports multiple schools per user
 */

import { useSchoolStore } from '@/src/schoolStore';
import {
  fetchSchoolProfile,
  fetchAllUserSchools,
  fetchPrimarySchool,
  fetchVerificationRequestsApi,
  fetchVerificationLogsApi,
  fetchSupportMessagesApi,
  markSupportMessageAsReadApi,
  registerSchoolApi,
  setPrimarySchoolApi,
  RegisterSchoolPayload,
  respondToVerificationRequestApi,
  UpdateSchoolPayload,
  updateSchoolProfileApi,
} from '@/src/utils/school-api';
import { useState, useCallback } from 'react';

export const useSchoolProfile = () => {
  const {
    profile,
    schools,
    selectedSchoolId,
    verificationRequests,
    verificationLogs,
    supportMessages,
    unreadSupportCount,
    setProfile,
    setSchools,
    setSelectedSchoolId,
    setVerificationRequests,
    setVerificationLogs,
    setSupportMessages,
    setUnreadSupportCount,
    setLoading,
    setError,
    getCurrentSchool,
    getPrimarySchool,
  } = useSchoolStore();

  const [isOperating, setIsOperating] = useState(false);

  /**
   * Fetch school profile (specific or primary)
   */
  const getProfile = useCallback(
    async (schoolId?: string) => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchSchoolProfile(schoolId);
        if (data) {
          setProfile(data);
        }
        return data;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to fetch profile';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setProfile, setLoading, setError]
  );

  /**
   * Fetch all user schools
   */
  const getAllSchools = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAllUserSchools();
      setSchools(data);
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch schools';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setSchools, setLoading, setError]);

  /**
   * Fetch primary school
   */
  const getPrimary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchPrimarySchool();
      if (data) {
        setProfile(data);
      }
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch primary school';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setProfile, setLoading, setError]);

  /**
   * Select a school
   */
  const selectSchool = useCallback(
    (schoolId: string) => {
      setSelectedSchoolId(schoolId);
    },
    [setSelectedSchoolId]
  );

  /**
   * Register new school
   */
  const registerSchool = useCallback(
    async (data: RegisterSchoolPayload) => {
      setIsOperating(true);
      setLoading(true);
      setError(null);

      try {
        const school = await registerSchoolApi(data);
        if (school) {
          // Refresh schools list
          await getAllSchools();
        }
        return school;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to register school';
        setError(errorMessage);
        throw error;
      } finally {
        setIsOperating(false);
        setLoading(false);
      }
    },
    [getAllSchools, setLoading, setError]
  );

  /**
   * Set school as primary
   */
  const setPrimary = useCallback(
    async (schoolId: string) => {
      setIsOperating(true);
      setError(null);

      try {
        const school = await setPrimarySchoolApi(schoolId);
        if (school) {
          // Refresh schools list
          await getAllSchools();
        }
        return school;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to set primary school';
        setError(errorMessage);
        throw error;
      } finally {
        setIsOperating(false);
      }
    },
    [getAllSchools, setError]
  );

  /**
   * Update school profile
   */
  const updateProfile = useCallback(
    async (schoolId: string, data: UpdateSchoolPayload) => {
      setIsOperating(true);
      setLoading(true);
      setError(null);

      try {
        const school = await updateSchoolProfileApi(schoolId, data);
        if (school) {
          // Refresh schools list
          await getAllSchools();
          
          // Update profile if it's the current school
          if (school.id === selectedSchoolId) {
            setProfile(school);
          }
        }
        return school;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to update profile';
        setError(errorMessage);
        throw error;
      } finally {
        setIsOperating(false);
        setLoading(false);
      }
    },
    [getAllSchools, selectedSchoolId, setProfile, setLoading, setError]
  );

  /**
   * Fetch verification requests
   */
  const getVerificationRequests = useCallback(
    async (schoolId?: string) => {
      setLoading(true);
      setError(null);

      const targetSchoolId = schoolId || selectedSchoolId || profile?.id;
      if (!targetSchoolId) {
        throw new Error('No school selected');
      }

      try {
        const requests = await fetchVerificationRequestsApi(targetSchoolId);
        setVerificationRequests(requests);
        return requests;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to fetch verification requests';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [selectedSchoolId, profile, setVerificationRequests, setLoading, setError]
  );

  /**
   * Fetch verification logs
   */
  const getVerificationLogs = useCallback(
    async (schoolId?: string, limit: number = 10) => {
      setError(null);

      const targetSchoolId = schoolId || selectedSchoolId || profile?.id;
      if (!targetSchoolId) {
        throw new Error('No school selected');
      }

      try {
        const logs = await fetchVerificationLogsApi(targetSchoolId, limit);
        setVerificationLogs(logs);
        return logs;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to fetch verification logs';
        setError(errorMessage);
        throw error;
      }
    },
    [selectedSchoolId, profile, setVerificationLogs, setError]
  );

  /**
   * Fetch support messages
   */
  const getSupportMessages = useCallback(async () => {
    setError(null);

    
    try {
      
      const school = getCurrentSchool()
      if(!school) return;

      const data = await fetchSupportMessagesApi(school?.id);
      setSupportMessages(data.messages);
      setUnreadSupportCount(data.unreadCount);
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch support messages';
      setError(errorMessage);
      throw error;
    }
  }, [setSupportMessages, setUnreadSupportCount, setError]);

  /**
   * Mark support message as read
   */
  const markMessageAsRead = useCallback(
    async (messageId: string) => {
      try {
        const success = await markSupportMessageAsReadApi(messageId);
        if (success) {
          setSupportMessages(
            supportMessages.map((msg) =>
              msg.id === messageId
                ? { ...msg, isRead: true, readAt: new Date().toISOString() }
                : msg
            )
          );
          setUnreadSupportCount(Math.max(0, unreadSupportCount - 1));
        }
        return success;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to mark message as read';
        setError(errorMessage);
        throw error;
      }
    },
    [supportMessages, unreadSupportCount, setSupportMessages, setUnreadSupportCount, setError]
  );

  /**
   * Respond to verification request
   */
  const respondToVerification = useCallback(
    async (verificationId: string, status: 'VERIFIED' | 'REJECTED', notes?: string) => {
      setIsOperating(true);
      setError(null);

      try {
        const verification = await respondToVerificationRequestApi(verificationId, status, notes);

        if (verification) {
          setVerificationRequests(
            verificationRequests.map((req) => (req.id === verificationId ? verification : req))
          );

          await getVerificationLogs();
        }

        return verification;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to respond to verification';
        setError(errorMessage);
        throw error;
      } finally {
        setIsOperating(false);
      }
    },
    [verificationRequests, setVerificationRequests, setError, getVerificationLogs]
  );

  /**
   * Fetch all school data
   */
  const fetchAllData = useCallback(async () => {
    setLoading(true);

    try {
      // Fetch all schools first
      const schoolsData = await getAllSchools();

      // Only fetch other data if we have schools
      if (schoolsData && schoolsData.length > 0) {
        const currentSchoolId = selectedSchoolId || schoolsData[0].id;
        
        await Promise.all([
          getVerificationRequests(currentSchoolId),
          getVerificationLogs(currentSchoolId),
          getSupportMessages(),
        ]);
      }
    } catch (error) {
      console.error('Error fetching all school data:', error);
    } finally {
      setLoading(false);
    }
  }, [getAllSchools, selectedSchoolId, getVerificationRequests, getVerificationLogs, getSupportMessages, setLoading]);

  return {
    // State
    profile,
    schools,
    selectedSchoolId,
    currentSchool: getCurrentSchool(),
    primarySchool: getPrimarySchool(),
    verificationRequests,
    verificationLogs,
    supportMessages,
    unreadSupportCount,
    isOperating,

    // Actions
    getProfile,
    getAllSchools,
    getPrimary,
    selectSchool,
    registerSchool,
    setPrimary,
    updateProfile,
    getVerificationRequests,
    getVerificationLogs,
    getSupportMessages,
    markMessageAsRead,
    respondToVerification,
    fetchAllData,
  };
};