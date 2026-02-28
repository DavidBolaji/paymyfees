'use client';

import { CheckBoldIcon } from '@/assets/icons/CheckBoldIcon';

interface ContactSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
}


export default function ContactSuccessModal({
    isOpen,
    onClose,
}: ContactSuccessModalProps) {



    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };


    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
            onClick={handleOverlayClick}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl border border-[#F2F2F2]"
                style={{
                    width: '390px',
                    maxWidth: '90vw',
                    padding: '23px 15px',
                    minHeight: '256px'
                }}
            >
                {/* Header */}
                <div className="flex-col items-center justify-center flex h-64">
                    <div className='w-20 h-20 mb-6 rounded-full flex items-center justify-center bg-[#00296B]'>
                        <CheckBoldIcon color='white' />
                    </div>
                    <h3 className="text-2xl font-bold text-[#191919]">
                        Details Saved Successfully
                    </h3>
                </div>

                {/* Content */}
                <div className="space-y-5">


                </div>
            </div>
        </div>
    );
}