
"use client";

import { ChevronDown, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Option {
  value: string;
  label: string;
}

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

interface CustomInputProps {
  label: string;
  type?: "text" | "email" | "number" | "select" | "phone";
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  options?: Option[];
  price?: boolean;
  white?: boolean;
}

// Comprehensive country list with SVG flags and dial codes
const countries: Country[] = [
  { code: "NG", name: "Nigeria", dialCode: "+234", flag: "https://flagcdn.com/w40/ng.png" },
  { code: "US", name: "United States", dialCode: "+1", flag: "https://flagcdn.com/w40/us.png" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "https://flagcdn.com/w40/gb.png" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "https://flagcdn.com/w40/ca.png" },
  { code: "GH", name: "Ghana", dialCode: "+233", flag: "https://flagcdn.com/w40/gh.png" },
  { code: "KE", name: "Kenya", dialCode: "+254", flag: "https://flagcdn.com/w40/ke.png" },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: "https://flagcdn.com/w40/za.png" },
  { code: "IN", name: "India", dialCode: "+91", flag: "https://flagcdn.com/w40/in.png" },
  { code: "PK", name: "Pakistan", dialCode: "+92", flag: "https://flagcdn.com/w40/pk.png" },
  { code: "BD", name: "Bangladesh", dialCode: "+880", flag: "https://flagcdn.com/w40/bd.png" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "https://flagcdn.com/w40/au.png" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "https://flagcdn.com/w40/de.png" },
  { code: "FR", name: "France", dialCode: "+33", flag: "https://flagcdn.com/w40/fr.png" },
  { code: "IT", name: "Italy", dialCode: "+39", flag: "https://flagcdn.com/w40/it.png" },
  { code: "ES", name: "Spain", dialCode: "+34", flag: "https://flagcdn.com/w40/es.png" },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "https://flagcdn.com/w40/br.png" },
  { code: "MX", name: "Mexico", dialCode: "+52", flag: "https://flagcdn.com/w40/mx.png" },
  { code: "AR", name: "Argentina", dialCode: "+54", flag: "https://flagcdn.com/w40/ar.png" },
  { code: "CN", name: "China", dialCode: "+86", flag: "https://flagcdn.com/w40/cn.png" },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "https://flagcdn.com/w40/jp.png" },
  { code: "KR", name: "South Korea", dialCode: "+82", flag: "https://flagcdn.com/w40/kr.png" },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "https://flagcdn.com/w40/sg.png" },
  { code: "MY", name: "Malaysia", dialCode: "+60", flag: "https://flagcdn.com/w40/my.png" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "https://flagcdn.com/w40/ae.png" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "https://flagcdn.com/w40/sa.png" },
  { code: "EG", name: "Egypt", dialCode: "+20", flag: "https://flagcdn.com/w40/eg.png" },
  { code: "RU", name: "Russia", dialCode: "+7", flag: "https://flagcdn.com/w40/ru.png" },
  { code: "TR", name: "Turkey", dialCode: "+90", flag: "https://flagcdn.com/w40/tr.png" },
  { code: "NL", name: "Netherlands", dialCode: "+31", flag: "https://flagcdn.com/w40/nl.png" },
  { code: "SE", name: "Sweden", dialCode: "+46", flag: "https://flagcdn.com/w40/se.png" },
  { code: "NO", name: "Norway", dialCode: "+47", flag: "https://flagcdn.com/w40/no.png" },
  { code: "DK", name: "Denmark", dialCode: "+45", flag: "https://flagcdn.com/w40/dk.png" },
  { code: "FI", name: "Finland", dialCode: "+358", flag: "https://flagcdn.com/w40/fi.png" },
  { code: "PL", name: "Poland", dialCode: "+48", flag: "https://flagcdn.com/w40/pl.png" },
  { code: "CH", name: "Switzerland", dialCode: "+41", flag: "https://flagcdn.com/w40/ch.png" },
  { code: "AT", name: "Austria", dialCode: "+43", flag: "https://flagcdn.com/w40/at.png" },
  { code: "BE", name: "Belgium", dialCode: "+32", flag: "https://flagcdn.com/w40/be.png" },
  { code: "PT", name: "Portugal", dialCode: "+351", flag: "https://flagcdn.com/w40/pt.png" },
  { code: "GR", name: "Greece", dialCode: "+30", flag: "https://flagcdn.com/w40/gr.png" },
  { code: "IL", name: "Israel", dialCode: "+972", flag: "https://flagcdn.com/w40/il.png" },
  { code: "NZ", name: "New Zealand", dialCode: "+64", flag: "https://flagcdn.com/w40/nz.png" },
  { code: "TH", name: "Thailand", dialCode: "+66", flag: "https://flagcdn.com/w40/th.png" },
  { code: "ID", name: "Indonesia", dialCode: "+62", flag: "https://flagcdn.com/w40/id.png" },
  { code: "PH", name: "Philippines", dialCode: "+63", flag: "https://flagcdn.com/w40/ph.png" },
  { code: "VN", name: "Vietnam", dialCode: "+84", flag: "https://flagcdn.com/w40/vn.png" },
];

export function CustomInput({
  label,
  type = "text",
  value = "",
  placeholder,
  onChange,
  options = [],
  price = false,
  white,
}: CustomInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Update dropdown position when it opens or on scroll
  const updateDropdownPosition = () => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update position on scroll and resize
  useEffect(() => {
    if (!isDropdownOpen) return;

    updateDropdownPosition();
    
    const handleScroll = () => updateDropdownPosition();
    const handleResize = () => updateDropdownPosition();

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isDropdownOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDropdownOpen]);

  // Filter countries based on search query
  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dialCode.includes(searchQuery) ||
      country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchQuery("");
    
    // Update the full phone value
    const fullNumber = `${country.dialCode}${phoneNumber}`;
    onChange?.(fullNumber);
  };

  const handlePhoneNumberChange = (num: string) => {
    // Remove non-numeric characters
    const cleanNum = num.replace(/\D/g, "");
    setPhoneNumber(cleanNum);
    
    // Combine with dial code
    const fullNumber = `${selectedCountry.dialCode}${cleanNum}`;
    onChange?.(fullNumber);
  };

  const handlePriceChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    onChange?.(formatted);
  };

  return (
    <div className="flex flex-col w-full space-y-1">
      <label
        className={cn("font-semibold relative z-0", {
          "text-white": white,
          "text-[#292929]": !white,
        })}
      >
        {label}
      </label>

      {/* SELECT */}
      {type === "select" && (
        <div className="relative z-0">
          <select
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className="
              w-full h-12 px-3 pr-10 
              rounded-lg border border-[#d1d1d1] bg-[#f5f5f5]
              focus:outline-none appearance-none
              text-[#292929]
            "
          >
            <option value="" className="text-gray-400">
              Select {label}
            </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
            <ChevronDown />
          </span>
        </div>
      )}

      {/* CUSTOM PHONE INPUT */}
      {type === "phone" && (
        <div className="relative z-10" ref={dropdownRef}>
          <div className="flex items-center w-full h-12 rounded-lg border border-[#d1d1d1] bg-[#f5f5f5] overflow-hidden">
            {/* Country Selector Button */}
            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(!isDropdownOpen);
                if (!isDropdownOpen) {
                  updateDropdownPosition();
                }
              }}
              className="flex items-center gap-2 px-3 h-full bg-[#f5f5f5] hover:bg-[#ebebeb] transition-colors border-r border-[#d1d1d1]"
            >
              <Image 
                src={selectedCountry.flag} 
                alt={selectedCountry.name}
                className="w-6 h-4 object-cover rounded"
              />
              <span className="text-sm text-[#292929] font-medium">
                {selectedCountry.dialCode}
              </span>
              <ChevronDown
                className={cn("w-4 h-4 text-gray-500 transition-transform", {
                  "rotate-180": isDropdownOpen,
                })}
              />
            </button>

            {/* Phone Number Input */}
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => handlePhoneNumberChange(e.target.value)}
              placeholder={placeholder || "Phone number"}
              className="flex-1 h-full px-3 bg-[#f5f5f5] text-[#292929] placeholder:text-gray-400 focus:outline-none"
            />
          </div>

          {/* Dropdown Menu with HIGHEST z-index */}
          {isDropdownOpen && (
            <>
              {/* Invisible overlay to catch outside clicks */}
              <div 
                className="fixed inset-0 z-[9998]" 
                onClick={() => {
                  setIsDropdownOpen(false);
                  setSearchQuery("");
                }}
              />
              {/* Actual dropdown */}
              <div 
                className="fixed bg-white border border-[#d1d1d1] rounded-lg shadow-2xl overflow-hidden z-[9999]"
                style={{
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  width: `${dropdownPosition.width}px`,
                  maxHeight: '320px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Search Bar */}
                <div className="sticky top-0 bg-white border-b border-[#d1d1d1] p-2 z-10">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search country..."
                      className="w-full pl-10 pr-3 py-2 rounded-md border border-[#d1d1d1] bg-[#f5f5f5] text-sm focus:outline-none focus:border-gray-400"
                    />
                  </div>
                </div>

                {/* Country List */}
                <div className="overflow-y-auto max-h-64">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleCountrySelect(country)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f5f5f5] transition-colors text-left",
                          {
                            "bg-[#f5f5f5]": selectedCountry.code === country.code,
                          }
                        )}
                      >
                        <Image
                          src={country.flag} 
                          alt={country.name}
                          className="w-6 h-4 object-cover rounded"
                        />
                        <span className="flex-1 text-sm text-[#292929]">
                          {country.name}
                        </span>
                        <span className="text-sm text-gray-500 font-medium">
                          {country.dialCode}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                      No countries found
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TEXT / EMAIL / NUMBER */}
      {(type === "text" || type === "email" || type === "number") && (
        <input
          type="text"
          value={value}
          onChange={(e) => {
            if (price) return handlePriceChange(e.target.value);
            onChange?.(e.target.value);
          }}
          placeholder={placeholder}
          className="
            w-full h-12 px-3 rounded-lg 
            border border-[#d1d1d1] bg-[#f5f5f5]
            focus:outline-none text-[#292929] relative z-0 placeholder:text-gray-400
            [appearance:textfield]
            [&::-webkit-outer-spin-button]:appearance-none
            [&::-webkit-inner-spin-button]:appearance-none
          "
        />
      )}
    </div>
  );
}