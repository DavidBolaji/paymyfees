# School Dashboard — Implementation Documentation

## Overview

This document describes the school-specific features added to the PayMyFees platform: a dedicated registration role, a separate `/school-dashboard` with school-tailored pages, and a funding application form.

---

## 1. Registration Form Updates

### Files Modified
- `components/forms/register-form.tsx`
- `components/ui/custom-input.tsx`
- `app/auth/register/page.tsx`

### Changes
- Added a **Role** select field with four options: `Parent`, `School`, `Student`, and `Teacher` (disabled).
- When `School` is selected, a **School Name** text input animates into view using `framer-motion` (`AnimatePresence` + `motion.div` with `height: 0 → auto`).
- `isFormValid()` requires `schoolName` when `role === "SCHOOL"`.
- The register page API call now forwards `role` and `schoolName` to the server.
- Added `disabled?: boolean` to the `Option` interface in `custom-input.tsx`; `<option>` renders with `disabled` attribute and grey styling when set.

### Routing after registration
- Schools are redirected to `/school-dashboard` post-login.
- Parents / Students continue to `/dashboard`.

---

## 2. School Sidebar

### File Created
- `components/dashboard/school-sidebar.tsx`

### Navigation Structure
| Group | Label | Route |
|---|---|---|
| Overview | Dashboard | `/school-dashboard` |
| FUNDING | Apply for Funding | `/school-dashboard/apply-funding` |
| FUNDING | Wallet | `/school-dashboard/wallet` |
| ANALYTICS & INSIGHTS | Analytics | `/school-dashboard/analytics` |
| SUPPORT | Help Center | `/school-dashboard/help` |
| SUPPORT | Account Settings | `/school-dashboard/profile` |

Same visual design as the main `sidebar.tsx` — gradient active states, curved sidebar indicators, theme switcher, and logout button.

---

## 3. School Dashboard Layout

### File Created
- `app/school-dashboard/layout.tsx`

Wraps all school dashboard pages with `SchoolSidebar`, `Header`, and the `Authenticated` provider — identical in structure to `app/dashboard/layout.tsx`.

---

## 4. School Dashboard Pages

All pages live under `app/school-dashboard/`.

### Overview Page (`page.tsx`)
- Welcome message: **"Welcome, {schoolName}"** — reads from `user?.schoolProfile?.schoolName`, falls back to `user?.fullName`.
- Displays the same stat cards, funding/disbursement history table, progress tracker, recent transactions, and chart card as the main dashboard.
- Navigation links within the page point to `/school-dashboard/*` routes.

### Sub-Pages
| File | Description |
|---|---|
| `loans/page.tsx` | Funding applications list with `/school-dashboard` back nav |
| `transactions/page.tsx` | Transactions list with `/school-dashboard` back nav |
| `timeline/page.tsx` | Full funding timeline using `fetchTimelineData` |
| `analytics/page.tsx` | Analytics charts (imports `TimelineChart`, `AnalyticsPageSkeleton` from `@/app/dashboard/analytics/`); CTA links to `/school-dashboard/apply-funding` |
| `help/page.tsx` | Help center with quick links to school dashboard routes |
| `profile/page.tsx` | Wraps `<ProfilePage basePath="/school-dashboard" />` |
| `wallet/page.tsx` | Wraps `<WalletPage basePath="/school-dashboard" />` |
| `view-payment-plan/page.tsx` | Payment plan viewer with `/school-dashboard` back nav |
| `apply-funding/page.tsx` | School funding application form (see Section 5) |

---

## 5. Apply for Funding Form

### File Created
- `app/school-dashboard/apply-funding/page.tsx`

### Layout
4-quadrant grid (2-column on `lg` screens, single column on mobile):

```
┌─────────────────────────┬─────────────────────────┐
│  Financial Information  │  School Identity Info   │
├─────────────────────────┼─────────────────────────┤
│  School Operations      │  Upload Documents       │
└─────────────────────────┴─────────────────────────┘
```

### Fields

**Financial Information (top-left)**
| Field | Type | Notes |
|---|---|---|
| Total Termly Revenue (₦) | number input | Required |
| Number of Teachers | number input | Required |
| Existing Debts or Liabilities (₦) | number input | Optional; defaults to 0 |
| Other Income Sources | select | Grants, Rental, Catering, After-School, None |

**School Identity Information (top-right)**
| Field | Type | Notes |
|---|---|---|
| School Name | text input | Auto-populated from `user.schoolProfile.schoolName`; read-only when populated |
| School Email | email input | Pre-filled from `user.schoolProfile.schoolEmail` |
| School Registration Number | text input | Required |
| School Address | text input | Pre-filled from `user.schoolProfile.schoolAddress` |

**School Operations (bottom-left)**
| Field | Type | Notes |
|---|---|---|
| Total Number of Students | number input | Required |
| Amount Requested (₦) | number input | Required |
| Academic Levels Offered | select | Early Years, Primary, Junior Secondary, Senior Secondary, Primary & Secondary, All Levels |
| Number of Non-Teaching Staff | select | 1–5, 6–10, 11–20, 21–50, 50+ |

**Upload Documents (bottom-right)**
- Uses `FileUpload` component (`components/ui/file-upload.tsx`) via `ref`.
- Accepted types: `.pdf`, `.png`, `.jpg`, `.jpeg`.
- Max 5 files, 10 MB each.
- Folder: `school-funding-documents` (Cloudinary).
- `autoUpload={false}` — files are uploaded on form submit via `ref.current.uploadAllFiles()`.

### Validation
Client-side validation runs on submit. Required fields show inline error messages via `FormInput`/`FormSelect` `error` prop. At least one file must be added.

### Submit Flow
1. Validate all fields.
2. Call `fileUploadRef.current.uploadAllFiles()` to push files to Cloudinary.
3. POST to `/api/loans` with merged form data + Cloudinary results.
4. On success → redirect to `/school-dashboard?funding_applied=true`.
5. On error → display error banner above the form.

---

## 6. `basePath` Prop Pattern (Code Reuse)

To avoid duplicating large page components, three shared pages accept a `basePath` prop:

| File | Default | School usage |
|---|---|---|
| `app/dashboard/profile/page.tsx` | `/dashboard` | `<ProfilePage basePath="/school-dashboard" />` |
| `app/dashboard/wallet/page.tsx` | `/dashboard` | `<WalletPage basePath="/school-dashboard" />` |
| `app/dashboard/view-payment-plan/page.tsx` | `/dashboard` | `<ViewPaymentPlanPage basePath="/school-dashboard" />` |

All internal `<BackNavigation>` hrefs and `window.history.replaceState` paths use the `basePath` variable instead of hardcoded strings.

---

## 7. Summary of All Changed / Created Files

### Modified
| File | Change |
|---|---|
| `components/forms/register-form.tsx` | Role select + school name field + validation |
| `components/ui/custom-input.tsx` | `disabled?: boolean` on `Option` interface |
| `app/auth/register/page.tsx` | Forwards `role` and `schoolName` to API |
| `app/dashboard/profile/page.tsx` | Added `basePath` prop |
| `app/dashboard/wallet/page.tsx` | Added `basePath` prop |
| `app/dashboard/view-payment-plan/page.tsx` | Added `basePath` prop |

### Created
| File | Purpose |
|---|---|
| `components/dashboard/school-sidebar.tsx` | School-specific sidebar |
| `app/school-dashboard/layout.tsx` | School dashboard root layout |
| `app/school-dashboard/page.tsx` | Overview page (welcome {schoolName}) |
| `app/school-dashboard/loans/page.tsx` | Funding applications list |
| `app/school-dashboard/transactions/page.tsx` | Transactions list |
| `app/school-dashboard/timeline/page.tsx` | Funding timeline |
| `app/school-dashboard/analytics/page.tsx` | Analytics charts |
| `app/school-dashboard/help/page.tsx` | Help center |
| `app/school-dashboard/profile/page.tsx` | Profile (reuses with basePath) |
| `app/school-dashboard/wallet/page.tsx` | Wallet (reuses with basePath) |
| `app/school-dashboard/apply-funding/page.tsx` | Funding application form |

---

## 8. Prisma Schema Notes

The `SchoolProfile` model already contains the core fields needed:

```prisma
model SchoolProfile {
  id               String  @id @default(uuid())
  schoolName       String
  schoolEmail      String?
  schoolAddress    String?
  academicLevel    String?
  totalStudents    Int?
  userId           String  @unique
  user             User    @relation(...)
}
```

Fields captured by the funding form that do **not** have dedicated schema columns (e.g. `totalTermlyRevenue`, `existingDebts`, `schoolRegistrationNumber`, `numberOfTeachers`, `numberOfNonTeachingStaff`) are submitted through the loan application payload and stored on the `Loan` model or as metadata. If persistence of these directly on the school profile is needed, add the corresponding columns via a Prisma migration.

---

## 9. Prisma Schema Additions (Recommended)

If you want to persist the extra school data directly:

```prisma
model SchoolProfile {
  // existing fields ...
  schoolRegistrationNumber  String?
  totalTermlyRevenue        Float?
  numberOfTeachers          Int?
  existingDebts             Float?
  otherIncomeSources        String?
  numberOfNonTeachingStaff  String?
}
```

Run `npx prisma migrate dev --name add-school-funding-fields` after updating the schema.
