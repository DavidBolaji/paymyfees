"use client"

import { CheckBoldIcon } from "@/assets/icons/CheckBoldIcon";
import { LogoutIcon } from "@/assets/icons/LogoutIcon";
import { useRouter } from "next/navigation";

const SuccessPage = () => {
    const router = useRouter()
    return (
        <div className="text-center">
            <div className="w-20 h-20 bg-[#00296B] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckBoldIcon color="white" />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-[#00296B]">
                Password Reset Succesful
            </h2>
            <p className="text-gray-600 mb-8">
               Congratulations! Your password has been changed successfully.
            </p>
            <button
                onClick={() => router.push('/auth/login')}
                className="inline-flex items-center gap-2 text-[#00296B] font-semibold"
            >
                <LogoutIcon /> Back to Log in
            </button>
        </div>
    );
}

export default SuccessPage;