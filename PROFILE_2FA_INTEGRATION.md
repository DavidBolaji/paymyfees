# Profile Page 2FA & Notification Settings Integration

## Overview
Updated the dashboard profile page to properly integrate with 2FA and notification settings APIs.

## Changes Made

### 1. State Management

**Added 2FA States:**
```typescript
const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
const [is2FALoading, setIs2FALoading] = useState(false);
const [show2FASetup, setShow2FASetup] = useState(false);
const [qrCode, setQrCode] = useState<string | null>(null);
const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
const [verificationCode, setVerificationCode] = useState("");
```

**Updated Notification Settings Interface:**
```typescript
interface NotificationSettings {
  emailNotifications: boolean;      // Changed from 'email'
  inAppNotifications: boolean;      // Changed from 'inApp'
  walletFunding: boolean;
  loanApproval: boolean;
  repaymentReminders: boolean;
  verificationStatus: boolean;
  securityAlerts: boolean;
  promotions: boolean;
}
```

### 2. API Integration

**Fetch Notification Settings on Load:**
```typescript
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
```

**Update Notification Settings with Optimistic UI:**
```typescript
const toggleNotification = async (key: keyof NotificationSettings) => {
  const newValue = !notifications[key];
  
  // Optimistic update
  setNotifications((prev) => ({ ...prev, [key]: newValue }));

  try {
    const response = await api.put("/api/user/settings/notifications", {
      ...notifications,
      [key]: newValue,
    });

    if (!data.success) {
      // Revert on error
      setNotifications((prev) => ({ ...prev, [key]: !newValue }));
    }
  } catch (err) {
    // Revert on error
    setNotifications((prev) => ({ ...prev, [key]: !newValue }));
  }
};
```

### 3. 2FA Functionality

**Toggle 2FA (Enable/Disable):**
```typescript
const handle2FAToggle = async () => {
  if (twoFactorEnabled) {
    // Disable 2FA - requires verification code
    const code = prompt("Enter your 2FA code to disable:");
    if (!code) return;

    const response = await api.post("/api/user/settings/2fa", {
      action: "disable",
      code,
    });
  } else {
    // Enable 2FA - show setup modal
    const response = await api.post("/api/user/settings/2fa", {
      action: "setup",
    });

    if (data.success) {
      setQrCode(data.data.qrCode);
      setTwoFactorSecret(data.data.secret);
      setShow2FASetup(true);
    }
  }
};
```

**Complete 2FA Setup:**
```typescript
const handleEnable2FA = async () => {
  const response = await api.post("/api/user/settings/2fa", {
    action: "enable",
    code: verificationCode,
  });

  if (data.success) {
    setTwoFactorEnabled(true);
    setShow2FASetup(false);
    // Clear modal state
  }
};
```

### 4. UI Components

**2FA Toggle in Security Settings:**
```tsx
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
```

**2FA Setup Modal:**
- QR code display for scanning
- Manual secret code display
- 6-digit verification code input
- Enable/Cancel buttons
- Loading states
- Error handling

**Updated Notification Toggles:**
- Now connected to API
- Optimistic UI updates
- Disabled state during updates
- Error handling with revert

### 5. Data Flow

**On Page Load:**
1. `fetchProfile()` - Gets user profile including `twoFactorEnabled`
2. `fetchNotificationSettings()` - Gets notification preferences
3. UI updates with current settings

**Notification Toggle:**
1. User clicks toggle
2. UI updates immediately (optimistic)
3. API call to update setting
4. On error, revert UI change
5. Show error message if needed

**Enable 2FA:**
1. User toggles 2FA switch
2. API call to setup 2FA
3. Receive QR code and secret
4. Show setup modal
5. User scans QR code
6. User enters verification code
7. API call to enable 2FA
8. Update UI state
9. Close modal

**Disable 2FA:**
1. User toggles 2FA switch
2. Prompt for verification code
3. API call to disable 2FA
4. Update UI state

## User Experience

### Notification Settings
- ✅ Toggles reflect current database state
- ✅ Immediate visual feedback (optimistic updates)
- ✅ Automatic revert on API errors
- ✅ Disabled state during updates
- ✅ Error messages displayed

### 2FA Settings
- ✅ Toggle shows current 2FA status
- ✅ Setup flow with QR code
- ✅ Manual secret code option
- ✅ 6-digit code verification
- ✅ Loading states
- ✅ Verification required to disable
- ✅ Clear error messages

## Testing Checklist

### Notification Settings
- [ ] Toggles load with correct initial state
- [ ] Toggling updates database
- [ ] Optimistic UI works correctly
- [ ] Errors revert UI changes
- [ ] All 8 notification types work
- [ ] Disabled state prevents multiple clicks

### 2FA Settings
- [ ] Toggle shows correct initial state (enabled/disabled)
- [ ] Setup flow displays QR code
- [ ] Manual secret code is visible
- [ ] Can scan QR code with authenticator app
- [ ] Verification code enables 2FA
- [ ] Invalid codes show error
- [ ] Can disable 2FA with valid code
- [ ] Cannot disable without verification
- [ ] Modal closes properly
- [ ] State persists after page reload

## API Endpoints Used

1. **GET /api/user/profile**
   - Fetches user profile including `twoFactorEnabled`

2. **GET /api/user/settings/notifications**
   - Fetches notification preferences

3. **PUT /api/user/settings/notifications**
   - Updates notification preferences

4. **POST /api/user/settings/2fa**
   - Actions: `setup`, `enable`, `disable`
   - Setup: Returns QR code and secret
   - Enable: Requires verification code
   - Disable: Requires verification code

## Error Handling

- Network errors show user-friendly messages
- Invalid verification codes are caught
- Optimistic updates revert on failure
- Loading states prevent duplicate requests
- Modal can be cancelled at any time

## Security Considerations

- 2FA disable requires verification code
- Temporary secrets cleared after setup
- Verification codes are 6 digits
- API calls are authenticated
- Sensitive data not exposed in UI

## Future Enhancements

- [ ] Add backup codes generation
- [ ] SMS/Email backup verification
- [ ] 2FA recovery options
- [ ] Notification preferences per channel
- [ ] Batch notification updates
- [ ] Toast notifications for success/error
- [ ] Better error messages
- [ ] Loading skeleton for settings
