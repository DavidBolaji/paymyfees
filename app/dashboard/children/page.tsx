'use client';

import { useEffect, useState } from 'react';
import { Pencil, Plus, X, Loader2, User } from 'lucide-react';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { FormInput, FormSelect } from '@/components/ui/form-input';
import { api } from '@/src/lib/api';
import { NIGERIAN_CLASS_LEVELS } from '@/data/constants';
import { normalizeText } from '@/lib/utils';

interface StudentProfile {
  id: string;
  studentName: string;
  dateOfBirth: string | null;
  relationship: string;
  classLevel: string;
  createdAt: string;
}

const RELATIONSHIP_OPTIONS = [
  { value: '', label: 'Select relationship' },
  { value: 'Father', label: 'Father' },
  { value: 'Mother', label: 'Mother' },
  { value: 'Guardian', label: 'Guardian' },
  { value: 'Uncle', label: 'Uncle' },
  { value: 'Aunt', label: 'Aunt' },
  { value: 'Sibling', label: 'Sibling' },
  { value: 'Other', label: 'Other' },
];

interface EditForm {
  studentName: string;
  dateOfBirth: string;
  relationship: string;
  classLevel: string;
}

export default function ChildrenPage() {
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ studentName: '', dateOfBirth: '', relationship: '', classLevel: '' });
  const [editErrors, setEditErrors] = useState<Partial<EditForm>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/student-profiles');
      const data = await res.json();
      if (data.success) {
        setProfiles(data.data);
      } else {
        setError(data.message ?? 'Failed to load children');
      }
    } catch {
      setError('Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (profile: StudentProfile) => {
    setEditingId(profile.id);
    setEditForm({
      studentName: profile.studentName,
      dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.substring(0, 10) : '',
      relationship: profile.relationship,
      classLevel: profile.classLevel,
    });
    setEditErrors({});
    setSaveError(null);
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditErrors({});
    setSaveError(null);
  };

  const validateEdit = (): boolean => {
    const errs: Partial<EditForm> = {};
    if (!editForm.studentName.trim() || editForm.studentName.trim().length < 2) {
      errs.studentName = 'Name must be at least 2 characters';
    }
    if (!editForm.relationship) {
      errs.relationship = 'Relationship is required';
    }
    if (!editForm.classLevel) {
      errs.classLevel = 'Class / Level is required';
    }
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validateEdit() || !editingId) return;
    setSaving(true);
    setSaveError(null);
    try {
      const payload: { studentName: string; relationship: string; classLevel: string; dateOfBirth?: string } = {
        studentName: normalizeText(editForm.studentName),
        relationship: editForm.relationship,
        classLevel: editForm.classLevel,
      };
      if (editForm.dateOfBirth) payload.dateOfBirth = editForm.dateOfBirth;

      const res = await api.put(`/api/student-profiles/${editingId}`, payload);
      const data = await res.json();
      if (data.success) {
        setProfiles(prev => prev.map(p => p.id === editingId ? { ...p, ...data.data } : p));
        closeEdit();
      } else {
        setSaveError(data.message ?? 'Failed to save changes');
      }
    } catch {
      setSaveError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-6 md:pt-0">
      <BackNavigation href="/dashboard" label="Back to Dashboard" />

      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-[#191919] mb-1">My Children</h1>
        <p className="text-sm text-gray-500">View and manage your registered children&apos;s information.</p>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-[#00296B] animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={fetchProfiles} className="mt-2 text-[#00296B] text-sm font-medium hover:underline">
            Try again
          </button>
        </div>
      )}

      {!loading && !error && profiles.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <div className="mx-auto mb-4 bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-[#292D32] mb-1">No children added yet</h3>
          <p className="text-sm text-gray-500 mb-4">Add a child when applying for a loan and their information will appear here.</p>
          <a
            href="/dashboard/loans/new"
            className="inline-flex items-center gap-2 bg-[#00296B] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#002561] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Apply for a Loan
          </a>
        </div>
      )}

      {!loading && !error && profiles.length > 0 && (
        <div className="space-y-3">
          {profiles.map(profile => (
            <div key={profile.id} className="bg-white rounded-2xl border border-gray-200 p-5">
              {editingId === profile.id ? (
                /* Edit form */
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-[#292D32]">Edit Child Details</h3>
                    <button onClick={closeEdit} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {saveError && (
                    <p className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-600 text-sm mb-4">{saveError}</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      label="Full Name"
                      value={editForm.studentName}
                      onChange={e => setEditForm(prev => ({ ...prev, studentName: e.target.value }))}
                      error={editErrors.studentName}
                      onBlur={e => setEditForm(prev => ({ ...prev, studentName: normalizeText(e.target.value) }))}
                    />
                    <FormInput
                      label="Date of Birth"
                      type="date"
                      value={editForm.dateOfBirth}
                      onChange={e => setEditForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    />
                    <FormSelect
                      label="Relationship"
                      options={RELATIONSHIP_OPTIONS}
                      value={editForm.relationship}
                      onChange={e => setEditForm(prev => ({ ...prev, relationship: e.target.value }))}
                      error={editErrors.relationship}
                    />
                    <FormSelect
                      label="Class / Level"
                      options={NIGERIAN_CLASS_LEVELS}
                      value={editForm.classLevel}
                      onChange={e => setEditForm(prev => ({ ...prev, classLevel: e.target.value }))}
                      error={editErrors.classLevel}
                    />
                  </div>

                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={closeEdit}
                      className="flex-1 border border-gray-300 rounded-lg h-11 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 flex justify-center items-center gap-2 bg-[#00296B] hover:bg-[#002561] disabled:opacity-60 rounded-lg h-11 text-sm font-medium text-white transition-colors"
                    >
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Display card */
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <User className="w-5 h-5 text-[#00296B]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#292D32] text-base">{profile.studentName}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                        <span className="text-sm text-gray-500">
                          <span className="text-[#7C7C7C]">Class: </span>{profile.classLevel}
                        </span>
                        <span className="text-sm text-gray-500">
                          <span className="text-[#7C7C7C]">Relationship: </span>{profile.relationship}
                        </span>
                        {profile.dateOfBirth && (
                          <span className="text-sm text-gray-500">
                            <span className="text-[#7C7C7C]">DOB: </span>
                            {new Date(profile.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => openEdit(profile)}
                    className="flex-shrink-0 flex items-center gap-1.5 border border-[#00296B] text-[#00296B] hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
