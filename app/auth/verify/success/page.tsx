"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Logo from "@/assets/images/logo/logo.png";
import SuccessIcon from "@/assets/images/chain-lock-clip.png";

export default function VerificationSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState<number>(5);

  // Auto-redirect to dashboard after countdown
  useEffect(() => {
    if (countdown <= 0) {
      router.push("/dashboard");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, router]);

  const handleContinue = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col items-center">
      {/* Logo */}
      <div className="my-24">
        <Image
          src={Logo}
          alt="PayMyFees Logo"
          width={140}
          height={38}
        />
      </div>

      {/* Success Content */}
      <div className="w-full max-w-md p-8 border border-[#00296B] bg-white rounded-lg">
        <div className="text-center">
          <div className="mb-6">
            <Image
              src={SuccessIcon}
              alt="Success"
              width={120}
              height={120}
              className="mx-auto"
            />
          </div>
          <h2 className="text-2xl font-semibold mb-2 text-[#00296B]">Account Verified Successfully!</h2>
          <p className="text-gray-600 mb-8">
            Your email has been verified successfully. You can now access all features of PayMyFees.
          </p>
          <button
            onClick={handleContinue}
            className="bg-[#00296B] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Continue to Dashboard ({countdown}s)
          </button>
        </div>
      </div>
    </div>
  );
}