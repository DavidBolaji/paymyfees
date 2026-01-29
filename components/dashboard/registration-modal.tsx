'use client';

import { SchoolVerificationForm } from "./school-verification-form";



export default function RegistrationModal({
    isOpen,
    onClose,

}: {isOpen: boolean; onClose: () => void}) {

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleOverlayClick}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl border border-[#F2F2F2] overflow-auto"
                style={{
                    width: '644px',
                    maxWidth: '90vw',
                    padding: '23px 15px',
                    height: '80vh'
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-center mb-5">
                    <h3 className="text-2xl font-bold text-[#191919]">
                        Create School
                    </h3>
                </div>

                {/* Content */}
                <div className="space-y-5">
                    <SchoolVerificationForm />
                </div>
            </div>
        </div>
    );
}