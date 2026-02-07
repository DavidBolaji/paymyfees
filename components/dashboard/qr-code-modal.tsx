"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import Image from "next/image";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeUrl: string;
  secret: string;
}

export function QRCodeModal({ isOpen, onClose, qrCodeUrl, secret }: QRCodeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#00296B] rounded-full mb-3">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#191919] mb-2">
            Set Up Two-Factor Authentication
          </h2>
          <p className="text-sm text-gray-600">
            Scan this QR code with your authenticator app
          </p>
        </div>

        {/* QR Code */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6 flex justify-center">
          <Image
            src={qrCodeUrl}
            alt="2FA QR Code"
            width={192}
            height={192}
            className="w-48 h-48"
          />
        </div>

        {/* Secret Key */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Or enter this code manually:
          </p>
          <div className="bg-gray-100 rounded-lg p-3 flex items-center justify-between">
            <code className="text-sm font-mono text-[#00296B] break-all">
              {secret}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(secret);
              }}
              className="ml-2 text-[#00296B] hover:text-[#002561] transition-colors"
              title="Copy to clipboard"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            How to set up:
          </h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
            <li>Scan the QR code or enter the code manually</li>
            <li>Enter the 6-digit code from your app to verify</li>
            <li>Save your backup codes in a secure location</li>
          </ol>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full h-12 bg-[#00296B] text-white rounded-lg hover:bg-[#002561] transition-colors font-medium"
        >
          I've Saved My Secret Key
        </button>
      </div>
    </div>
  );
}
