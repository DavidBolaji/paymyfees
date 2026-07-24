/**
 * School Selector — searchable combobox
 * Shows ALL registered schools (user's + verified public schools)
 * User can type to filter; selecting sets the schoolId + schoolName.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Search, ChevronDown, X, Loader2 } from 'lucide-react';
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
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all schools on mount
  useEffect(() => {
    loadSchools();
  }, []);

  // Combine when either list changes
  useEffect(() => {
    const userSchoolsMarked = userSchools.map(s => ({ ...s, isUserSchool: true as const }));
    const userIds = new Set(userSchools.map(s => s.id));
    const unique = verifiedSchools.filter(s => !userIds.has(s.id));
    setAllSchools([...userSchoolsMarked, ...unique]);
  }, [userSchools, verifiedSchools]);

  // Sync query display when value changes externally
  useEffect(() => {
    if (value) {
      const found = allSchools.find(s => s.id === value);
      if (found) setQuery(found.schoolName);
    } else {
      setQuery('');
    }
  }, [value, allSchools]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        // Restore the selected school name in the input if user typed but didn't pick
        const found = allSchools.find(s => s.id === value);
        setQuery(found ? found.schoolName : '');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [allSchools, value]);

  const loadSchools = async () => {
    setIsLoading(true);
    try {
      const [, verified] = await Promise.all([
        getAllSchools().catch(() => []),
        fetchAllSchools().catch(() => []),
      ]);
      setVerifiedSchools(verified || []);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = allSchools.filter(s =>
    s.schoolName.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (school: School) => {
    onChange(school.id, school.schoolName);
    setQuery(school.schoolName);
    setOpen(false);
  };

  const handleClear = () => {
    onChange('', '');
    setQuery('');
    setOpen(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const selectedSchool = allSchools.find(s => s.id === value);

  return (
    <div className="space-y-2" ref={containerRef}>
      <label className="block font-medium text-gray-700 text-sm">School Name</label>

      <div className="relative">
        {/* Search input */}
        <div className={cn(
          "flex items-center border rounded-lg bg-[#f5f5f5] h-12 px-3 gap-2 transition-colors",
          open ? "border-[#00296B] ring-1 ring-[#00296B]/20" : error ? "border-red-500" : "border-[#d1d1d1]"
        )}>
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            placeholder={isLoading ? 'Loading schools…' : 'Search for a school…'}
            disabled={isLoading}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            className="flex-1 bg-transparent focus:outline-none text-sm text-[#292929] placeholder:text-gray-400"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin flex-shrink-0" />}
          {!isLoading && value && (
            <button type="button" onClick={handleClear} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          )}
          {!isLoading && !value && (
            <ChevronDown className={cn("w-4 h-4 text-gray-400 flex-shrink-0 transition-transform", open && "rotate-180")} />
          )}
        </div>

        {/* Dropdown */}
        {open && !isLoading && (
          <div className="absolute z-50 top-[calc(100%+4px)] left-0 right-0 bg-white border border-[#e5e5e5] rounded-xl shadow-lg max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                {query ? `No schools found for "${query}"` : 'No schools available'}
                {onRegisterClick && (
                  <button
                    type="button"
                    onClick={() => { onRegisterClick(); setOpen(false); }}
                    className="flex items-center gap-1 mx-auto mt-3 text-[#00296B] text-xs font-medium hover:underline"
                  >
                    <Plus className="w-3 h-3" /> Register a new school
                  </button>
                )}
              </div>
            ) : (
              <>
                {filtered.map(school => {
                  const isSelected = school.id === value;
                  return (
                    <button
                      key={school.id}
                      type="button"
                      onClick={() => handleSelect(school)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-blue-50 transition-colors border-b border-[#f5f5f5] last:border-0",
                        isSelected && "bg-[#EEF3FF]"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={cn("font-medium truncate", isSelected ? "text-[#00296B]" : "text-[#292D32]")}>
                          {school.schoolName}
                        </p>
                        {school.isUserSchool && (
                          <p className="text-[10px] text-[#00296B] mt-0.5 font-medium">My School</p>
                        )}
                      </div>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-[#00296B] flex-shrink-0" />}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>

      {/* Selected school display */}
      {selectedSchool && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          Selected: <span className="font-medium">{selectedSchool.schoolName}</span>
          {selectedSchool.isUserSchool && ' (My School)'}
        </p>
      )}

      {onRegisterClick && (
        <button
          type="button"
          onClick={onRegisterClick}
          className="inline-flex items-center gap-1 text-[#00296B] text-xs hover:text-[#002561] transition-colors"
        >
          <Plus className="w-3 h-3" />
          Register a new school
        </button>
      )}

      {error && <p className="text-red-600 text-xs">{error}</p>}
    </div>
  );
}
