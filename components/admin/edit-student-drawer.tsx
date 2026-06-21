'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { CustomInput } from '@/components/ui/custom-input';
import { SuccessModal } from '@/components/ui/success-modal';
import { api } from '@/src/lib/api';

interface EditStudentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  onSaved?: () => void;
}

export function EditStudentDrawer({ isOpen, onClose, student, onSaved }: EditStudentDrawerProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    country: '',
    city: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Pre-fill form with student data
      setFormData({
        fullName: student?.fullName || '',
        email: student?.email || '',
        phone: student?.phone || '',
        gender: student?.gender || '',
        dob: student?.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
        country: student?.country || '',
        city: student?.city || '',
        address: student?.address || '',
      });
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, student]);

  if (!student) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.patch(`/api/admin/students/${student.userId}`, formData);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        onSaved?.();
      }, 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Profile Updated"
        message="Student profile has been updated successfully."
      />
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="z-[100] fixed inset-0 bg-[#292929CC]"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="top-0 right-0 z-[101] fixed bg-white shadow-2xl w-full max-w-[540px] h-full flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="font-semibold text-[#191919] text-lg">Edit Student Profile</h2>
                <button onClick={onClose} className="flex justify-center items-center hover:bg-gray-50 border-[#002561] border-2 rounded-lg w-10 h-10 transition-colors">
                  <X className="w-5 h-5 text-[#002561]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Personal Information */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Personal Information</p>
                  <div className="space-y-3">
                    <CustomInput
                      label="Full Name"
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                    />
                    <CustomInput
                      label="Email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email"
                    />
                    <CustomInput
                      label="Phone"
                      type="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                    />
                    <CustomInput
                      label="Gender"
                      type="select"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      options={[
                        { value: '', label: 'Select gender' },
                        { value: 'MALE', label: 'Male' },
                        { value: 'FEMALE', label: 'Female' },
                        { value: 'OTHER', label: 'Other' },
                      ]}
                    />
                    <CustomInput
                      label="Date of Birth"
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Location Information */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Location</p>
                  <div className="space-y-3">
                    <CustomInput
                      label="Country"
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Enter country"
                    />
                    <CustomInput
                      label="City"
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter city"
                    />
                    <CustomInput
                      label="Address"
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter address"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-3 py-2.5 border-2 border-[#002561] text-[#002561] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 px-3 py-2.5 bg-[#002561] text-white rounded-lg text-sm font-medium hover:bg-[#001a4a] transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
