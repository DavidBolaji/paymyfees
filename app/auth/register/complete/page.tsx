"use client";

import { useState, useEffect } from "react";
import useAuthStore from "@/src/authStore";
import Image from "next/image";
import Logo from "@/assets/images/logo/logo.png";
import { EditSquareIcon } from "@/assets/icons/EditSquareIcon";
import { CheckSquareIcon } from "@/assets/icons/CheckSquareIcon";
import { MinusSquareIcon } from "@/assets/icons/MinusSquareIcon";
import { useRouter } from "next/navigation";

export default function VerifyLinkPage() {
  const {user} = useAuthStore();

  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");

  const router = useRouter();

  const changeEmail = () => {
    router.push("/auth/register");
  };

  useEffect(() => {
    const userEmail = user?.email;

    if (!userEmail) {
      setMessage("User email not found. Please try logging in again.");
      return;
    }

    setEmail(userEmail);
  }, [user]);

  const handleResendVerification = async () => {
    if (!email) {
      setMessage("User email not found. Please try logging in again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          mode: "link",
        }),
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

  return (
    <div className="flex flex-col items-center pb-20">
      {/* Logo */}
      <div className="my-24">
        <Image src={Logo} alt="PayMyFees Logo" width={140} height={38} />
      </div>

      {/* Verification Content */}
      <div className="w-full max-w-md p-8 border border-[#00296B] bg-white rounded-lg">
        <h2 className="text-2xl font-semibold mb-2 text-[#00296B] text-center">
          Verify Email
        </h2>

        <div className="flex items-center justify-center">
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-[#E6EAF0] mt-5 mb-4">
            <EditSquareIcon />
          </div>
        </div>

        <p className="text-[#525252] text-center font-medium mb-4 text-sm">
          We have sent a link to{" "}
          <span className="text-[#00296B] font-semibold">{email}</span>
          <br />
          Continue account creation using the link via email. Link will expire in
          20 minutes.
        </p>

        {/* Status Message */}
        {message && (
          <p className="text-center text-sm mb-6 text-red-600">{message}</p>
        )}

        {/* Button container */}
        <div className="space-y-4">
          {/* Resend Button */}
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={loading}
            className={`bg-[#002561] w-full flex justify-center items-center gap-2 font-bold py-[0.9375rem] rounded-lg text-white ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <CheckSquareIcon />
            {loading ? "Submitting..." : "Resend Email"}
          </button>

          {/* Change Email Button */}
          <button
            type="button"
            onClick={changeEmail}
            disabled={loading}
            className={`bg-white border flex items-center justify-center gap-2 text-[#00296B] border-[#002561] w-full font-bold py-[0.9375rem] rounded-lg ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <MinusSquareIcon />
            Change Email
          </button>
        </div>
      </div>
    </div>
  );
}
