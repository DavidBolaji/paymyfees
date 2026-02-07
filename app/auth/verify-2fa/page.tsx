"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/src/lib/api";
import useAuthStore from "@/src/authStore";

export default function Verify2FAPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Get temp token and email from sessionStorage
    const storedToken = sessionStorage.getItem('2fa_temp_token');
    const storedEmail = sessionStorage.getItem('2fa_email');

    if (!storedToken || !storedEmail) {
      toast.error("Invalid verification session");
      router.push("/auth/login");
      return;
    }

    setTempToken(storedToken);
    setEmail(storedEmail);
  }, [router]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (index === 5 && value && newCode.every((digit) => digit)) {
      handleVerify(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pastedData)) {
      return;
    }

    const newCode = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
    setCode(newCode);

    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join("");

    if (codeToVerify.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    if (!tempToken) {
      setError("Session expired. Please login again.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await api.post("/api/auth/verify-2fa", {
        tempToken,
        code: codeToVerify,
      }, { skipAuth: true });

      const data = await response.json();

      if (data.success) {
        // Clear session storage
        sessionStorage.removeItem('2fa_temp_token');
        sessionStorage.removeItem('2fa_email');

        // Use Zustand to store user data
        login(data.data.user, data.data.token, data.data.refreshToken);

        toast.success("Login successful!");

        // Redirect based on user role
        if (data.data.user.role === 'ADMIN') {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(data.message || "Invalid code. Please try again.");
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error("2FA verification error:", err);
      setError("An error occurred. Please try again.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBackToLogin = () => {
    // Clear session storage
    sessionStorage.removeItem('2fa_temp_token');
    sessionStorage.removeItem('2fa_email');
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br  p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00296B] rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#191919] mb-2">
              Two-Factor Authentication
            </h1>
            <p className="text-gray-600 text-sm">
              Enter the 6-digit code from your authenticator app
            </p>
            {email && (
              <p className="text-gray-500 text-xs mt-2">
                Logging in as: {email}
              </p>
            )}
          </div>

          {/* Code Input */}
          <div className="mb-6">
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isVerifying}
                  className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00296B] transition-all ${error
                      ? "border-red-500"
                      : digit
                        ? "border-[#00296B]"
                        : "border-gray-300"
                    } ${isVerifying ? "opacity-50 cursor-not-allowed" : ""}`}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {error && (
              <p className="text-red-600 text-sm text-center mt-3">{error}</p>
            )}
          </div>

          {/* Verify Button */}
          <button
            onClick={() => handleVerify()}
            disabled={isVerifying || code.some((digit) => !digit)}
            className="w-full h-12 bg-[#00296B] text-white rounded-lg hover:bg-[#002561] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Code"
            )}
          </button>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm mb-2">
              Don&apos;t have access to your authenticator?
            </p>
            <button
              onClick={handleBackToLogin}
              className="text-[#00296B] text-sm font-medium hover:underline"
            >
              Back to Login
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center text-blue-800 text-sm opacity-90">
            <p>🔒 Your account is protected with two-factor authentication</p>
          </div>
        </div>


      </div>
    </div>
  );
}
