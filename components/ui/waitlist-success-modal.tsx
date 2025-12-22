"use client";

import { Check } from "lucide-react";
import { Modal } from "./modal";

interface WaitlistSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WaitlistSuccessModal({ isOpen, onClose }: WaitlistSuccessModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <div className="text-center pt-2">
        {/* Blue circle with checkmark */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#00296B] rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-white" strokeWidth={3} />
          </div>
        </div>
        
        {/* Content with max width for better readability */}
        <div className="max-w-sm mx-auto">
          {/* Title with emoji */}
          <h2 className="text-[27px] font-black text-[#292D32] mb-4 leading-[1.2em]">
            You're on the Waitlist 🎉
          </h2>
          
          {/* Main message */}
          <p className="text-[15px] font-medium text-[#7C7C7C] mb-6 leading-[1.4em]">
            Thanks for joining PayMyFees. We'll notify you as we get closer to launch in Q2 2026.
          </p>
          
          {/* Disclaimer */}
          <p className="text-[14px] font-medium text-[#525252] leading-[1.4em]">
            This is a waitlist only — not a loan offer or approval.
          </p>
        </div>
      </div>
    </Modal>
  );
}