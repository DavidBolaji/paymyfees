"use client";

import { useState, useEffect } from "react";
import useAuthStore from "@/src/authStore";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Logo from "@/assets/images/logo/logo.png";

import { LinkSwapIcon } from "@/assets/icons/LinkSwapIcon";
import { SentIcon } from "@/assets/icons/SentIcon";
import { CheckBoldIcon } from "@/assets/icons/CheckBoldIcon";
import Link from "next/link";
import { LogoutIcon } from "@/assets/icons/LogoutIcon";

enum VerificationStatus {
  LOADING = "loading",
  SUCCESS = "success",
  EXPIRED = "expired",
  ERROR = "error",
}

export default function VerifyLinkPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { user } = useAuthStore();

  const [status, setStatus] = useState<VerificationStatus>(
    VerificationStatus.LOADING
  );
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!token) {
      setStatus(VerificationStatus.ERROR);
      setMessage("Invalid verification link. No token provided.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            mode: "link",
          }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus(VerificationStatus.SUCCESS);
          return;
        }

        if (data.error === "expired") {
          setStatus(VerificationStatus.EXPIRED);
        } else {
          setStatus(VerificationStatus.ERROR);
          setMessage(
            data.message || "Failed to verify email. Please try again."
          );
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus(VerificationStatus.ERROR);
        setMessage("An error occurred during verification. Please try again.");
      }
    };

    verifyEmail();
  }, [token]);
 

  const handleResendVerification = async () => {
    setLoading(true);
    setMessage("");

    try {

      const email = user?.email;
      if (!email) {
        setMessage("User email not found. Please log in again.");
        return;
      }

      if (!email) {
        setMessage("User email not found. Please log in again.");
        return;
      }

      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mode: "link" }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Verification link has been resent to your email.");
      } else {
        setMessage(
          data.message || "Failed to resend verification. Please try again."
        );
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case VerificationStatus.LOADING:
        return (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold mb-2">
              Verifying your email
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your email address...
            </p>
          </div>
        );

      case VerificationStatus.SUCCESS:
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-[#00296B] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckBoldIcon color="white" />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-[#00296B]">
              Verification Successful
            </h2>
            <p className="text-gray-600 mb-8">
              Congratulations! Your email has been verified successfully.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-[#00296B] font-semibold"
            >
              <LogoutIcon /> Back to Log in
            </Link>
          </div>
        );

      case VerificationStatus.EXPIRED:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2 text-[#00296B]">
              Link Expired
            </h2>

            <div className="flex items-center justify-center">
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-[#E6EAF0] mt-5 mb-4">
                <LinkSwapIcon />
              </div>
            </div>

            <p className="text-[#525252] font-medium mb-8 text-sm">
              The verification link has expired. Please request a new one.
            </p>

            <button
              type="button"
              onClick={handleResendVerification}
              disabled={loading}
              className={`bg-[#002561] w-full flex justify-center items-center gap-2 font-bold py-3 rounded-lg text-white ${loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              <SentIcon /> {loading ? "Sending..." : "Resend Email"}
            </button>

            {message && (
              <p className="mt-4 text-red-500 text-sm">{message}</p>
            )}
          </div>
        );

      case VerificationStatus.ERROR:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2 text-[#00296B]">
              Link Expired
            </h2>

            <div className="flex items-center justify-center">
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-[#E6EAF0] mt-5 mb-4">
                <LinkSwapIcon />
              </div>
            </div>

            <p className="text-[#525252] font-medium mb-8 text-sm">
              The verification link has expired. Please request a new one.
            </p>

            <button
              type="button"
              onClick={handleResendVerification}
              disabled={loading}
              className={`bg-[#002561] w-full flex justify-center items-center gap-2 font-bold py-3 rounded-lg text-white ${loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              <SentIcon /> {loading ? "Sending..." : "Resend Email"}
            </button>

            {message && (
              <p className="mt-4 text-red-500 text-sm">{message}</p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Logo */}
      <div className="my-24">
        <Image src={Logo} alt="PayMyFees Logo" width={140} height={38} />
      </div>

      {/* Verification Content */}
      <div className="w-full max-w-md p-8 border border-[#00296B] bg-white rounded-lg">
        {renderContent()}
      </div>
    </div>
  );
}
