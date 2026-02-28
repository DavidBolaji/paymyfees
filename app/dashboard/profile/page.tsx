"use client";

import { useState, useEffect } from "react";
import { BackNavigation } from "@/components/dashboard/back-navigation";
import { CustomInput } from "@/components/ui/custom-input";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { api } from "@/src/lib/api";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import useAuthStore from "@/src/authStore";

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
  emailNotifications: boolean;
  inAppNotifications: boolean;
  walletFunding: boolean;
  loanApproval: boolean;
  repaymentReminders: boolean;
  verificationStatus: boolean;
  securityAlerts: boolean;
  promotions: boolean;
}

export default function ProfilePage() {
  const { updateUser } = useAuthStore();
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
    emailNotifications: true,
    inAppNotifications: true,
    walletFunding: true,
    loanApproval: true,
    repaymentReminders: true,
    verificationStatus: true,
    securityAlerts: true,
    promotions: true,
  });

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");

  // Loading states
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchNotificationSettings();
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

        // Update auth store with profile image if it exists
        if (profileData.profileImage) {
          updateUser({ profileImage: profileData.profileImage });
        }

        // Set 2FA status
        setTwoFactorEnabled(profileData.twoFactorEnabled || false);

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

  const fetchNotificationSettings = async () => {
    try {
      const response = await api.get("/api/user/settings/notifications");
      const data = await response.json();

      if (data.success) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error("Error fetching notification settings:", err);
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
        // Update local state with the returned data
        const nameParts = data.data.fullName.split(" ");
        setFirstName(nameParts[0] || "");
        setLastName(nameParts.slice(1).join(" ") || "");
        setContact(data.data.phone || "");
        setLocation(data.data.country || "");
        setLanguage(data.data.parentProfile?.language || "English");
        
        // Show success message
        alert("Profile updated successfully!");
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
        // Update local state with the returned data
        setCountry(data.data.parentProfile?.country || "");
        setRegion(data.data.parentProfile?.state || "");
        setAddress(data.data.parentProfile?.address || "");
        setCity(data.data.parentProfile?.city || "");
        setPostalCode(data.data.parentProfile?.postalCode || "");
        
        // Show success message
        alert("Address updated successfully!");
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

  const toggleNotification = async (key: keyof NotificationSettings) => {
    const newValue = !notifications[key];
    
    // Optimistic update
    setNotifications((prev) => ({
      ...prev,
      [key]: newValue,
    }));

    try {
      setIsUpdatingNotifications(true);
      
      const response = await api.put("/api/user/settings/notifications", {
        ...notifications,
        [key]: newValue,
      });

      const data = await response.json();

      if (!data.success) {
        // Revert on error
        setNotifications((prev) => ({
          ...prev,
          [key]: !newValue,
        }));
        setError(data.message || "Failed to update notification settings");
      }
    } catch (err) {
      console.error("Error updating notification settings:", err);
      // Revert on error
      setNotifications((prev) => ({
        ...prev,
        [key]: !newValue,
      }));
      setError("Failed to update notification settings");
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  const handle2FAToggle = async () => {
    if (twoFactorEnabled) {
      // Disable 2FA - need verification code
      const code = prompt("Enter your 2FA code to disable:");
      if (!code) return;

      try {
        setIs2FALoading(true);
        const response = await api.post("/api/user/settings/2fa", {
          action: "disable",
          code,
        });

        const data = await response.json();

        if (data.success) {
          setTwoFactorEnabled(false);
          setError(null);
          alert("2FA has been disabled successfully");
        } else {
          setError(data.message || "Failed to disable 2FA");
        }
      } catch (err) {
        console.error("Error disabling 2FA:", err);
        setError("Failed to disable 2FA");
      } finally {
        setIs2FALoading(false);
      }
    } else {
      // Enable 2FA - show setup modal
      try {
        setIs2FALoading(true);
        const response = await api.post("/api/user/settings/2fa", {
          action: "setup",
        });

        const data = await response.json();

        if (data.success) {
          setQrCode(data.data.qrCode);
          setTwoFactorSecret(data.data.secret);
          setShow2FASetup(true);
          setError(null);
        } else {
          setError(data.message || "Failed to setup 2FA");
        }
      } catch (err) {
        console.error("Error setting up 2FA:", err);
        setError("Failed to setup 2FA");
      } finally {
        setIs2FALoading(false);
      }
    }
  };

  const handleEnable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    try {
      setIs2FALoading(true);
      const response = await api.post("/api/user/settings/2fa", {
        action: "enable",
        code: verificationCode,
      });

      const data = await response.json();

      if (data.success) {
        setTwoFactorEnabled(true);
        setShow2FASetup(false);
        setQrCode(null);
        setTwoFactorSecret(null);
        setVerificationCode("");
        setError(null);
        alert("2FA has been enabled successfully");
      } else {
        setError(data.message || "Invalid verification code");
      }
    } catch (err) {
      console.error("Error enabling 2FA:", err);
      setError("Failed to enable 2FA");
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleAvatarUpload = async (imageUrl: string) => {
    try {
      setError(null);

      const response = await api.put("/api/user/profile", {
        profileImage: imageUrl,
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.data);
        // Update auth store with new profile image
        updateUser({ profileImage: imageUrl });
      } else {
        setError(data.message || "Failed to update profile image");
      }
    } catch (err) {
      console.error("Error updating profile image:", err);
      setError("Failed to update profile image");
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <BackNavigation href="/dashboard" label="Back to Dashboard" />

        <div className="mb-6">
          <div className="h-7 w-24 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-72 bg-gray-200 rounded" />
        </div>

        {/* Profile Header Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200" />
            <div>
              <div className="h-5 w-40 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-56 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Personal Info Skeleton */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="h-5 w-44 bg-gray-200 rounded mb-6" />
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i}>
                    <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
                    <div className="h-12 w-full bg-gray-200 rounded-lg" />
                  </div>
                ))}
                <div className="h-12 w-full bg-gray-200 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Address Info Skeleton */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="h-5 w-44 bg-gray-200 rounded mb-6" />
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
                    <div className="h-12 w-full bg-gray-200 rounded-lg" />
                  </div>
                ))}
                <div className="h-12 w-full bg-gray-200 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Notification Settings Skeleton */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="h-5 w-40 bg-gray-200 rounded mb-6" />
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 w-44 bg-gray-200 rounded" />
                    <div className="h-7 w-14 bg-gray-200 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Security Settings Skeleton */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="h-5 w-36 bg-gray-200 rounded mb-6" />
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="h-4 w-48 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-56 bg-gray-200 rounded" />
                  </div>
                  <div className="h-7 w-14 bg-gray-200 rounded-lg" />
                </div>
                <div className="h-14 w-full bg-gray-200 rounded-lg" />
                <div className="h-12 w-full bg-gray-200 rounded-lg" />
                <div className="h-12 w-full bg-gray-200 rounded-lg" />
              </div>
            </div>
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
    <div className="pt-6 md:pt-0">
      <BackNavigation href="/dashboard" label="Back to Dashboard" />

      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-[#191919] mb-2">Profile</h1>
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
      <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 mb-6">
        <div className="flex items-center gap-4">
          <AvatarUpload
            currentImage={profile.profileImage}
            userName={profile.fullName}
            onUploadComplete={handleAvatarUpload}
          />
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
                    checked={notifications.emailNotifications}
                    onChange={() => toggleNotification("emailNotifications")}
                    disabled={isUpdatingNotifications}
                  />
                  <NotificationToggle
                    label="In-app notifications:"
                    checked={notifications.inAppNotifications}
                    onChange={() => toggleNotification("inAppNotifications")}
                    disabled={isUpdatingNotifications}
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
                    disabled={isUpdatingNotifications}
                  />
                  <NotificationToggle
                    label="Loan Approval Updates"
                    checked={notifications.loanApproval}
                    onChange={() => toggleNotification("loanApproval")}
                    disabled={isUpdatingNotifications}
                  />
                  <NotificationToggle
                    label="Repayment Reminders"
                    checked={notifications.repaymentReminders}
                    onChange={() => toggleNotification("repaymentReminders")}
                    disabled={isUpdatingNotifications}
                  />
                  <NotificationToggle
                    label="Verification Status Updates"
                    checked={notifications.verificationStatus}
                    onChange={() => toggleNotification("verificationStatus")}
                    disabled={isUpdatingNotifications}
                  />
                  <NotificationToggle
                    label="Security Alerts"
                    checked={notifications.securityAlerts}
                    onChange={() => toggleNotification("securityAlerts")}
                    disabled={isUpdatingNotifications}
                  />
                  <NotificationToggle
                    label="Promotions & Tips"
                    checked={notifications.promotions}
                    onChange={() => toggleNotification("promotions")}
                    disabled={isUpdatingNotifications}
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
                    {twoFactorEnabled 
                      ? "2FA is currently enabled" 
                      : "Add an extra layer of security to your account"}
                  </p>
                </div>
                <NotificationToggle
                  label=""
                  checked={twoFactorEnabled}
                  onChange={handle2FAToggle}
                  disabled={is2FALoading}
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

      {/* 2FA Setup Modal */}
      {show2FASetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-[#292929] mb-4">
              Enable Two-Factor Authentication
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                {qrCode && (
                  <div className="flex justify-center mb-4">
                    <Image src={qrCode} alt="2FA QR Code" className="w-48 h-48" width={192} height={192} />
                  </div>
                )}
              </div>

              {twoFactorSecret && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">
                    Or enter this code manually:
                  </p>
                  <p className="text-sm font-mono font-semibold text-[#00296B] break-all">
                    {twoFactorSecret}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter verification code from your app:
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-xl tracking-widest"
                  placeholder="000000"
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShow2FASetup(false);
                    setQrCode(null);
                    setTwoFactorSecret(null);
                    setVerificationCode("");
                    setError(null);
                  }}
                  className="flex-1 h-12 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  disabled={is2FALoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnable2FA}
                  disabled={is2FALoading || verificationCode.length !== 6}
                  className="flex-1 h-12 bg-[#00296B] text-white rounded-lg hover:bg-[#002561] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {is2FALoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Notification Toggle Component
function NotificationToggle({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <button
        onClick={onChange}
        disabled={disabled}
        className={`w-14 h-7 rounded-lg relative transition-colors ${
          checked ? "bg-[#00296B]" : "bg-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span
          className={`absolute top-1 w-5 h-5 bg-white rounded-md transition-transform shadow-sm ${
            checked ? "translate-x-0.5" : "-translate-x-6"
          }`}
        ></span>
      </button>
    </div>
  );
}
