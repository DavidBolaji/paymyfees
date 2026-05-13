"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CustomInput } from "@/components/ui/custom-input";
import Link from "next/link";

// ─── Constants ────────────────────────────────────────────────────────────────

const PASSWORD_CRITERIA = {
  SPECIAL_CHAR: /[!@#$%^&*(),.?":{}|<>]/,
  MIN_LENGTH: 8,
  ONE_UPPERCASE: /[A-Z]/,
};

const ROLES = [
  { value: "PARENT", label: "Parent" },
  { value: "SCHOOL", label: "School" },
  { value: "STUDENT", label: "Student" },
  { value: "TEACHER", label: "Teacher" },
];

const STEPS = [
  "Personal Info",
  "Address",
  "Security",
] as const;

const TERMS_TEXT = `TERMS AND CONDITIONS

1. Introduction
These Terms and Conditions ("Terms") govern the use of the services provided by PayMyFees Limited ("PayMyFees", "we", "us", or "our"). By accessing or using our platform and services, you agree to be bound by these Terms.

2. About PayMyFees
PayMyFees Limited provides education financing solutions, including but not limited to school fees loans, teacher financing, school working capital support, and payment facilitation services.

3. Eligibility
To access and use our services, you must:
- Be at least eighteen (18) years of age;
- Provide accurate, complete, and up-to-date information;
- Possess valid identification (including BVN, NIN, or any other acceptable form of identification); and
- Have the legal capacity to enter into a binding contract under applicable laws.

4. Account Registration and KYC Compliance
Users are required to complete Know Your Customer (KYC) verification processes. PayMyFees reserves the right to verify all information provided and to suspend, restrict, or terminate any account where false, misleading, or incomplete information is detected.

5. Nature of Services
PayMyFees facilitates the payment of approved school fees directly to educational institutions on behalf of users. Loan repayments shall be made in accordance with the agreed repayment schedule.

6. Loan Terms
6.1 Loan Approval: All loans are subject to approval and acceptance of specific offer terms communicated at the point of approval.
6.2 Interest: Interest shall be charged at a rate of 2.5% per month or as otherwise disclosed at the time of loan approval. All applicable charges shall be transparently communicated, and no hidden fees shall apply.
6.3 Repayment: Repayments shall be made in monthly instalments, typically due on or before the last working day of each month, unless otherwise agreed.
6.4 Default: Failure to meet repayment obligations may result in account restriction or suspension; reporting to relevant credit bureaus; engagement of debt recovery processes; and/or initiation of legal proceedings.

7. Payments
All payments must be made exclusively to designated PayMyFees accounts. PayMyFees shall not be liable for any loss arising from payments made to incorrect or unauthorized accounts.

8. User Obligations
Users agree to provide truthful and accurate information at all times; refrain from impersonating any individual or entity; avoid engaging in any unlawful or fraudulent activity; and not interfere with or disrupt the integrity or performance of the platform.

9. Fraud and Misuse
Any fraudulent activity, attempted fraud, or misuse of the platform shall result in immediate suspension or termination of access and may be reported to relevant law enforcement authorities.

10. Data Protection and Privacy

10.1 Regulatory Compliance
PayMyFees Limited ("PayMyFees") processes personal data in accordance with the Nigeria Data Protection Act, 2023 and applicable regulations.

10.2 Consent and Lawful Processing
By using our services, you consent to the collection, use, storage, and processing of your personal data for the purposes set out herein. Processing is carried out on lawful bases including contractual necessity, legal obligation, and legitimate interest.

10.3 Scope and Purpose
PayMyFees may collect and process personal, financial, biometric, and transactional data for identity verification, credit assessment, loan administration, payment processing, fraud prevention, risk management, and regulatory compliance.

10.4 Data Sharing and Disclosure
You expressly authorize PayMyFees to disclose and exchange your data with credit bureaus, financial institutions, identity verification platforms, regulators, law enforcement agencies, and third-party service providers for credit reporting, debt recovery, compliance, and service delivery purposes.

10.5 Cross-Border Transfers
You consent to the transfer of your data outside Nigeria where necessary, subject to appropriate safeguards in line with applicable law.

10.6 Data Subject Rights
You may exercise your rights of access, rectification, restriction, or withdrawal of consent, subject to legal and contractual limitations, including obligations relating to credit reporting and regulatory compliance.

10.7 Data Security and Retention
PayMyFees implements appropriate security measures and retains personal data for as long as necessary to fulfill contractual, legal, and regulatory obligations.

10.8 Enforcement and Complaints
PayMyFees may retain, process, and disclose personal data as required for enforcement of its rights. Complaints may be directed to PayMyFees or the Nigeria Data Protection Commission.

11. Limitation of Liability
To the fullest extent permitted by law, PayMyFees shall not be liable for any direct, indirect, incidental, or consequential losses arising from user error or negligence; delays or failures caused by third-party service providers; or interruptions in service availability.

12. Service Availability
PayMyFees reserves the right to modify, suspend, or discontinue any aspect of its services at any time without prior notice.

13. Termination
PayMyFees may suspend or terminate a user's account at its sole discretion in cases of breach of these Terms, default in repayment, or suspicious or unlawful activity.

14. Governing Law
These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.

15. Contact Information
For inquiries or support, please contact:
Email: support@paymyfees.co`;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegisterFormData {
  // Step 1
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phone: string;
  dob: string;
  role: string;
  // Step 2
  address: string;
  city: string;
  schoolName: string;
  // Step 3
  password: string;
  agreeToTerms: boolean;
  verificationMode: "otp" | "link";
}

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function FieldError({ show, message }: { show: boolean; message?: string }) {
  return (
    <AnimatePresence>
      {show && message && (
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="text-red-500 text-xs mt-1"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center mb-6 gap-1 flex-wrap">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-1">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              i < current
                ? "bg-green-500 text-white"
                : i === current
                ? "bg-[#002561] text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {i < current ? "✓" : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-5 h-px ${i < current ? "bg-green-500" : "bg-gray-300"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: "", lastName: "", middleName: "", email: "", phone: "",
    dob: "", role: "", address: "", city: "", schoolName: "",
    password: "", agreeToTerms: false, verificationMode: "otp",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof RegisterFormData, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    hasSpecialChar: false, hasMinLength: false, isUpperCase: false,
  });

  // Terms scroll state
  const termsRef = useRef<HTMLDivElement>(null);
  const [termsScrolled, setTermsScrolled] = useState(false);

  // ── Password criteria ────────────────────────────────────────────────────────
  useEffect(() => {
    setPasswordCriteria({
      hasSpecialChar: PASSWORD_CRITERIA.SPECIAL_CHAR.test(formData.password),
      hasMinLength: formData.password.length >= PASSWORD_CRITERIA.MIN_LENGTH,
      isUpperCase: PASSWORD_CRITERIA.ONE_UPPERCASE.test(formData.password),
    });
  }, [formData.password]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const set = (field: keyof RegisterFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) validateField(field, value);
  };

  const touch = (field: keyof RegisterFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (field: keyof RegisterFormData, value: string | boolean | undefined) => {
    setErrors((prev) => {
      const next = { ...prev };
      const str = String(value ?? "").trim();

      switch (field) {
        case "firstName":
          !str ? (next.firstName = "First name is required") : delete next.firstName; break;
        case "lastName":
          !str ? (next.lastName = "Last name is required") : delete next.lastName; break;
        case "email":
          if (!str) next.email = "Email is required";
          else if (!/\S+@\S+\.\S+/.test(str)) next.email = "Invalid email address";
          else delete next.email;
          break;
        case "phone": {
          const ph = String(value ?? "").replace(/\s/g, "");
          if (!ph) next.phone = "Phone number is required";
          else if (!/^(\+?234|0)[789]\d{9}$/.test(ph))
            next.phone = "Enter a valid Nigerian phone number (e.g. 08012345678)";
          else delete next.phone;
          break;
        }
        case "dob":
          !value ? (next.dob = "Date of birth is required") : delete next.dob; break;
        case "role":
          !value ? (next.role = "Please select your account type") : delete next.role; break;
        case "address":
          !str ? (next.address = "Address is required") : delete next.address; break;
        case "city":
          !str ? (next.city = "City is required") : delete next.city; break;
        case "schoolName":
          formData.role === "SCHOOL" && !str
            ? (next.schoolName = "School name is required")
            : delete next.schoolName;
          break;
        case "password": {
          const p = String(value ?? "");
          if (!p) next.password = "Password is required";
          else if (p.length < 8 || !PASSWORD_CRITERIA.ONE_UPPERCASE.test(p) || !PASSWORD_CRITERIA.SPECIAL_CHAR.test(p))
            next.password = "Password doesn't meet requirements";
          else delete next.password;
          break;
        }
        case "agreeToTerms":
          !value ? (next.agreeToTerms = "You must agree to the terms") : delete next.agreeToTerms; break;
      }
      return next;
    });
  };

  const touchAll = (fields: (keyof RegisterFormData)[]) => {
    const nextTouched = { ...touched };
    fields.forEach((f) => {
      nextTouched[f] = true;
      validateField(f, formData[f]);
    });
    setTouched(nextTouched);
  };

  const isStepValid = (fields: (keyof RegisterFormData)[]) =>
    fields.every((f) => {
      const v = formData[f];
      if (f === "agreeToTerms") return !!v;
      if (f === "schoolName" && formData.role !== "SCHOOL") return true;
      if (f === "password") {
        const p = String(v ?? "");
        return p.length >= 8 && PASSWORD_CRITERIA.ONE_UPPERCASE.test(p) && PASSWORD_CRITERIA.SPECIAL_CHAR.test(p);
      }
      return !!String(v ?? "").trim();
    }) && fields.every((f) => !errors[f]);

  // ── Terms scroll detection ────────────────────────────────────────────────
  const handleTermsScroll = () => {
    const el = termsRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 10;
    if (atBottom) setTermsScrolled(true);
  };

  // ── Step navigation ───────────────────────────────────────────────────────
  const STEP_FIELDS: (keyof RegisterFormData)[][] = [
    ["firstName", "lastName", "email", "phone", "dob", "role"],
    ["address", "city", ...(formData.role === "SCHOOL" ? (["schoolName"] as (keyof RegisterFormData)[]) : [])],
    ["password", "agreeToTerms"],
  ];

  const goNext = () => {
    const fields = STEP_FIELDS[step]!;
    touchAll(fields);
    if (isStepValid(fields)) {
      setStep((s) => s + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    touchAll(STEP_FIELDS[2]!);
    if (!isStepValid(STEP_FIELDS[2]!)) return;
    try {
      setLoading(true);
      await onSubmit({ ...formData, email: formData.email.trim().toLowerCase() });
    } catch (err) {
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <StepIndicator current={step} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence mode="wait">

          {/* ── Step 1: Personal Info ─────────────────────────────────────── */}
          {step === 0 && (
            <motion.div key="s1"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <p className="text-xs text-gray-500 -mt-2 mb-3">Step 1 of 3 — Personal Information</p>

              <div>
                <CustomInput label="First Name" type="text" value={formData.firstName}
                  placeholder="e.g. John" onChange={(v) => set("firstName", v)}
                  onBlur={() => touch("firstName")} error={touched.firstName && !!errors.firstName} />
                <FieldError show={!!touched.firstName} message={errors.firstName} />
              </div>

              <div>
                <CustomInput label="Last Name" type="text" value={formData.lastName}
                  placeholder="e.g. Doe" onChange={(v) => set("lastName", v)}
                  onBlur={() => touch("lastName")} error={touched.lastName && !!errors.lastName} />
                <FieldError show={!!touched.lastName} message={errors.lastName} />
              </div>

              <div>
                <CustomInput label="Middle Name (optional)" type="text" value={formData.middleName}
                  placeholder="e.g. Michael" onChange={(v) => set("middleName", v)} />
              </div>

              <div>
                <CustomInput label="Email Address" type="email" value={formData.email}
                  placeholder="e.g. john.doe@example.com" onChange={(v) => set("email", v)}
                  onBlur={() => touch("email")} error={touched.email && !!errors.email} />
                <FieldError show={!!touched.email} message={errors.email} />
              </div>

              <div>
                <CustomInput label="Phone Number" type="text" value={formData.phone}
                  placeholder="e.g. 08012345678" onChange={(v) => set("phone", v)}
                  onBlur={() => touch("phone")} error={touched.phone && !!errors.phone} />
                <FieldError show={!!touched.phone} message={errors.phone} />
              </div>

              <div>
                <CustomInput label="Date of Birth" type="date" value={formData.dob}
                  onChange={(v) => set("dob", v)} onBlur={() => touch("dob")}
                  error={touched.dob && !!errors.dob} />
                <FieldError show={!!touched.dob} message={errors.dob} />
              </div>

              <div>
                <CustomInput label="Account Type" type="select" value={formData.role}
                  placeholder="Select account type" options={ROLES}
                  onChange={(v) => set("role", v)} onBlur={() => touch("role")}
                  error={touched.role && !!errors.role} />
                <FieldError show={!!touched.role} message={errors.role} />
              </div>

              <button type="button" onClick={goNext}
                className="bg-[#002561] w-full font-bold py-[0.9375rem] rounded-lg text-white">
                Continue
              </button>
              <div className="text-center">
                <p className="text-sm text-gray-600">Already have an account?{" "}
                  <Link href="/auth/login" className="text-blue-600 hover:underline">Sign in</Link>
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Address ───────────────────────────────────────────── */}
          {step === 1 && (
            <motion.div key="s2"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <p className="text-xs text-gray-500 -mt-2 mb-3">Step 2 of 3 — Address</p>

              <div>
                <CustomInput label="Residential Address" type="text" value={formData.address}
                  placeholder="e.g. 20 Marina Street" onChange={(v) => set("address", v)}
                  onBlur={() => touch("address")} error={touched.address && !!errors.address} />
                <FieldError show={!!touched.address} message={errors.address} />
              </div>

              <div>
                <CustomInput label="City" type="text" value={formData.city}
                  placeholder="e.g. Lagos" onChange={(v) => set("city", v)}
                  onBlur={() => touch("city")} error={touched.city && !!errors.city} />
                <FieldError show={!!touched.city} message={errors.city} />
              </div>

              <div>
                <CustomInput label="Country" type="text" value="Nigeria"
                  placeholder="Nigeria" onChange={() => {}} disabled />
              </div>

              <AnimatePresence>
                {formData.role === "SCHOOL" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                  >
                    <CustomInput label="School Name" type="text" value={formData.schoolName}
                      placeholder="Enter school name" onChange={(v) => set("schoolName", v)}
                      onBlur={() => touch("schoolName")} error={touched.schoolName && !!errors.schoolName} />
                    <FieldError show={!!touched.schoolName} message={errors.schoolName} />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(0)}
                  className="flex-1 border border-[#002561] text-[#002561] font-bold py-[0.9375rem] rounded-lg">
                  Back
                </button>
                <button type="button" onClick={goNext}
                  className="flex-1 bg-[#002561] font-bold py-[0.9375rem] rounded-lg text-white">
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Password + Terms ──────────────────────────────────── */}
          {step === 2 && (
            <motion.div key="s5"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <p className="text-xs text-gray-500 -mt-2 mb-3">Step 3 of 3 — Security & Terms</p>

              {/* Password */}
              <div>
                <CustomInput label="Password" type="password" value={formData.password}
                  placeholder="Create a strong password"
                  onChange={(v) => set("password", v)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => { setPasswordFocused(false); touch("password"); }}
                  error={touched.password && !!errors.password && !passwordFocused} />

                {(passwordFocused || formData.password) && (
                  <div className="mt-2 space-y-1">
                    {[
                      { met: passwordCriteria.isUpperCase, label: "At least one upper-case letter" },
                      { met: passwordCriteria.hasMinLength, label: "More than 8 characters" },
                      { met: passwordCriteria.hasSpecialChar, label: "At least one symbol (!@#...)" },
                    ].map(({ met, label }) => (
                      <motion.div key={label} animate={{ color: met ? "#10b981" : "#ef4444" }}
                        className="flex items-center text-xs gap-2">
                        <span>{met ? "✓" : "○"}</span>
                        {label}
                      </motion.div>
                    ))}
                  </div>
                )}
                <FieldError show={!!(touched.password && errors.password && !passwordFocused)} message={errors.password} />
              </div>

              {/* Terms — scrollable, must reach end to enable checkbox */}
              <div>
                <p className="font-semibold text-[#292929] text-sm mb-2">
                  Terms & Conditions
                  {!termsScrolled && (
                    <span className="text-xs font-normal text-amber-600 ml-2">
                      (scroll to the bottom to accept)
                    </span>
                  )}
                </p>
                <div
                  ref={termsRef}
                  onScroll={handleTermsScroll}
                  className="h-48 overflow-y-auto rounded-lg border border-[#d1d1d1] bg-[#fafafa] p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap"
                >
                  {TERMS_TEXT}
                </div>

                {/* Scroll-to-end indicator */}
                <AnimatePresence>
                  {!termsScrolled && (
                    <motion.p
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-xs text-amber-600 mt-1 flex items-center gap-1"
                    >
                      ↓ Scroll down to read all terms before accepting
                    </motion.p>
                  )}
                  {termsScrolled && (
                    <motion.p
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-xs text-green-600 mt-1"
                    >
                      ✓ You have read the terms
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Agree checkbox — disabled until scrolled */}
                <div className={`flex items-start mt-3 ${!termsScrolled ? "opacity-50" : ""}`}>
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.agreeToTerms}
                    disabled={!termsScrolled}
                    onChange={() => {
                      if (!termsScrolled) return;
                      const newValue = !formData.agreeToTerms;
                      set("agreeToTerms", newValue);
                      setTouched((prev) => ({ ...prev, agreeToTerms: true }));
                      setErrors((prev) => {
                        const next = { ...prev };
                        if (newValue) delete next.agreeToTerms;
                        else next.agreeToTerms = "You must agree to the terms";
                        return next;
                      });
                    }}
                    className="mt-1 mr-2 h-5 w-5 rounded-lg border-2 border-[#00296B] bg-white text-[#00296B] focus:ring-0 focus:ring-offset-0 disabled:cursor-not-allowed"
                  />
                  <label htmlFor="terms" className={`text-sm ${!termsScrolled ? "text-gray-400" : "text-[#7C7C7C]"}`}>
                    I have read and agree to the PayMyFees{" "}
                    <span className="text-[#00296B]">Terms & Conditions</span> and{" "}
                    <span className="text-[#00296B]">Privacy Policy</span>.
                  </label>
                </div>
                <FieldError show={!!touched.agreeToTerms} message={errors.agreeToTerms} />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 border border-[#002561] text-[#002561] font-bold py-[0.9375rem] rounded-lg">
                  Back
                </button>
                <button type="submit" disabled={loading || !formData.agreeToTerms || !termsScrolled}
                  className={`flex-1 bg-[#002561] font-bold py-[0.9375rem] rounded-lg text-white ${
                    loading || !formData.agreeToTerms || !termsScrolled
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </form>
    </div>
  );
}
