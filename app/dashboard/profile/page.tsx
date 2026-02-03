"use client";

import { useState, useEffect } from "react";
import { BackNavigation } from "@/components/dashboard/back-navigation";
import { CustomInput } from "@/components/ui/custom-input";
import { api } from "@/src/lib/api";
import { Camera, Loader2 } from "lucide-react";
import Image from "next/image";

interface UserProfile {
  id: string;
  email: string;
  phone: string | null;
  fullName: string;
  profileImage: string | null;
  role: string;
  country: string;
  residencyStatus: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  parentProfile?: {
    dateOfBirth: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string;
    language: string | null;
  };
}

interface NotificationSettings {
  email: boolean;
  inApp: boolean;
  walletFunding: boolean;
  loanApproval: boolean;
  repaymentReminders: boolean;
  verificationStatus: boolean;
  securityAlerts: boolean;
  promotions: boolean;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contact, setContact] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("");

  // Address form states
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    inApp: true,
    walletFunding: true,
    loanApproval: true,
    repaymentReminders: true,
    verificationStatus: true,
    securityAlerts: false,
    promotions: true,
  });

  // Loading states
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get("/api/user/profile");
      const data = await response.json();

      if (data.success) {
        const profileData = data.data;
        setProfile(profileData);

        // Split full name
        const nameParts = profileData.fullName.split(" ");
        setFirstName(nameParts[0] || "");
        setLastName(nameParts.slice(1).join(" ") || "");

        setContact(profileData.phone || "");
        setLocation(profileData.country || "");
        setEmail(profileData.email || "");
        setLanguage(profileData.parentProfile?.language || "English");

        // Address info
        setCountry(profileData.parentProfile?.country || "");
        setRegion(profileData.parentProfile?.state || "");
        setAddress(profileData.parentProfile?.address || "");
        setCity(profileData.parentProfile?.city || "");
        setPostalCode(profileData.parentProfile?.postalCode || "");
      } else {
        setError(data.message || "Failed to load profile");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsUpdatingProfile(true);
      setError(null);

      const response = await api.put("/api/user/profile", {
        fullName: `${firstName} ${lastName}`.trim(),
        phone: contact,
        country: location,
        parentProfile: {
          language,
        },
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.data);
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdateAddress = async () => {
    try {
      setIsUpdatingAddress(true);
      setError(null);

      const response = await api.put("/api/user/profile", {
        parentProfile: {
          country,
          state: region,
          address,
          city,
          postalCode,
        },
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.data);
      } else {
        setError(data.message || "Failed to update address");
      }
    } catch (err) {
      console.error("Error updating address:", err);
      setError("Failed to update address");
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  const toggleNotification = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <BackNavigation href="/dashboard" label="Back to Dashboard" />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 w-12 h-12 animate-spin text-[#00296B]" />
            <p className="text-gray-600 text-lg">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="p-6">
        <BackNavigation href="/dashboard" label="Back to Dashboard" />
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center max-w-md">
            <div className="mx-auto mb-4 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Profile
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchProfile}
              className="px-4 py-2 bg-[#00296B] text-white rounded-lg hover:bg-[#002561] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <BackNavigation href="/dashboard" label="Back to Dashboard" />

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#191919] mb-2">Profile</h1>
        <p className="text-sm text-gray-600">
          Manage your personal information and account settings
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00296B] to-[#003D82] flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {profile.profileImage ? (
                <Image
                  src={profile.profileImage}
                  alt={profile.fullName}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                profile.fullName.charAt(0).toUpperCase()
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-[#00296B] rounded-full flex items-center justify-center text-white hover:bg-[#002561] transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {profile.fullName}
            </h2>
            <p className="text-gray-600 text-sm">
              {city && `${city} | `}
              {country || profile.country} | {contact || "No phone"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid - 12 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Personal Information (6 cols) */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-[#292929] mb-6">
              Personal Information
            </h3>

            <div className="space-y-4">
              <CustomInput
                label="First Name"
                type="text"
                value={firstName}
                onChange={setFirstName}
                placeholder="Aanu"
              />

              <CustomInput
                label="Last Name"
                type="text"
                value={lastName}
                onChange={setLastName}
                placeholder="Fawole"
              />

              <CustomInput
                label="Contact"
                type="phone"
                value={contact}
                onChange={setContact}
                placeholder="90 3899 1239"
              />

              <CustomInput
                label="Location"
                type="select"
                value={location}
                onChange={setLocation}
                options={[
                  { value: "Nigeria", label: "Nigeria" },
                  { value: "Ghana", label: "Ghana" },
                  { value: "Kenya", label: "Kenya" },
                  { value: "South Africa", label: "South Africa" },
                  { value: "United States", label: "United States" },
                  { value: "United Kingdom", label: "United Kingdom" },
                  { value: "Canada", label: "Canada" },
                ]}
              />

              <CustomInput
                label="Email Address"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="Aanuoluwapo@gmail.com"
              />

              <CustomInput
                label="Languages"
                type="select"
                value={language}
                onChange={setLanguage}
                options={[
                  { value: "English", label: "English" },
                  { value: "Yoruba", label: "Yoruba" },
                  { value: "Igbo", label: "Igbo" },
                  { value: "Hausa", label: "Hausa" },
                  { value: "French", label: "French" },
                  { value: "Spanish", label: "Spanish" },
                ]}
              />

              <button
                onClick={handleUpdateProfile}
                disabled={isUpdatingProfile}
                className="w-full h-12 bg-[#00296B] text-white rounded-lg hover:bg-[#002561] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUpdatingProfile && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Update Profile
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Address Information (6 cols) */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-[#292929] mb-6">
              Address Information
            </h3>

            <div className="space-y-4">
              <CustomInput
                label="Country"
                type="text"
                value={country}
                onChange={setCountry}
                placeholder="Nigeria"
              />

              <CustomInput
                label="Region"
                type="text"
                value={region}
                onChange={setRegion}
                placeholder="Lagos"
              />

              <CustomInput
                label="Address"
                type="text"
                value={address}
                onChange={setAddress}
                placeholder="17 tayo oyefeko street"
              />

              <CustomInput
                label="City"
                type="text"
                value={city}
                onChange={setCity}
                placeholder="Surulere"
              />

              <CustomInput
                label="Postal Code"
                type="text"
                value={postalCode}
                onChange={setPostalCode}
                placeholder="100011"
              />

              <button
                onClick={handleUpdateAddress}
                disabled={isUpdatingAddress}
                className="w-full h-12 bg-white text-[#00296B] border-2 border-[#00296B] rounded-lg hover:bg-[#00296B] hover:text-white transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUpdatingAddress && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Update Address
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Left - Notification Settings (6 cols) */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-[#292929] mb-6">
              Notification Setting
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-[#292929] mb-3">
                  Notify Me via:
                  <span className="text-red-500">*</span>
                </p>
                <div className="space-y-3">
                  <NotificationToggle
                    label="Email:"
                    checked={notifications.email}
                    onChange={() => toggleNotification("email")}
                  />
                  <NotificationToggle
                    label="In-app notifications:"
                    checked={notifications.inApp}
                    onChange={() => toggleNotification("inApp")}
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-[#292929] mb-3">
                  Notification Preferences:
                  <span className="text-red-500">*</span>
                </p>
                <div className="space-y-3">
                  <NotificationToggle
                    label="Wallet Funding Confirmations"
                    checked={notifications.walletFunding}
                    onChange={() => toggleNotification("walletFunding")}
                  />
                  <NotificationToggle
                    label="Loan Approval Updates"
                    checked={notifications.loanApproval}
                    onChange={() => toggleNotification("loanApproval")}
                  />
                  <NotificationToggle
                    label="Repayment Reminders"
                    checked={notifications.repaymentReminders}
                    onChange={() => toggleNotification("repaymentReminders")}
                  />
                  <NotificationToggle
                    label="Verification Status Updates"
                    checked={notifications.verificationStatus}
                    onChange={() => toggleNotification("verificationStatus")}
                  />
                  <NotificationToggle
                    label="Security Alerts"
                    checked={notifications.securityAlerts}
                    onChange={() => toggleNotification("securityAlerts")}
                  />
                  <NotificationToggle
                    label="Promotions & Tips"
                    checked={notifications.promotions}
                    onChange={() => toggleNotification("promotions")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Right - Security Settings (6 cols) */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-[#292929] mb-6">
              Security Settings
            </h3>

            <div className="space-y-4">
              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-[#292929]">
                    Two-Factor Authentication
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <NotificationToggle
                  label=""
                  checked={false}
                  onChange={() => { }}
                />
              </div>

              {/* Login PIN */}
              <button className="w-full flex items-center justify-between p-4 bg-[#f5f5f5] rounded-lg hover:bg-[#ebebeb] transition-colors">
                <div className="text-left">
                  <p className="text-sm font-medium text-[#292929]">
                    Login PIN
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Set Up PIN</p>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* Change Password */}
              <button className="w-full h-12 bg-white text-[#00296B] border-2 border-[#00296B] rounded-lg hover:bg-[#00296B] hover:text-white transition-colors font-medium">
                Change Password
              </button>

              {/* Deactivate Store */}
              <button className="w-full h-12 bg-white text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors font-medium">
                Deactivate Store
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Notification Toggle Component
function NotificationToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <button
        onClick={onChange}
        className={`w-14 h-7 rounded-lg relative transition-colors ${checked ? "bg-[#00296B]" : "bg-gray-300"
          }`}
      >
        <span
          className={`absolute top-1 w-5 h-5 bg-white rounded-md transition-transform shadow-sm ${checked ? "translate-x-0.5" : "-translate-x-6"
            }`}
        ></span>
      </button>
    </div>
  );
}
