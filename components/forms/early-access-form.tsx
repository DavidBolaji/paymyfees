"use client";

import { CustomInput } from "@/components/ui/custom-input";
import { useState } from "react";

export function EarlyAccessForm({white = false}: {white?: boolean}) {
    const [form, setForm] = useState({
        role: "",
        fullName: "",
        email: "",
        phone: "",
        institution: "",
        loanAmount: "",
    });

    // Helper to update form fields
    const updateField = (key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <form className="w-full space-y-4 relative z-50">
            {/* Role and Name */}
            <div className="flex md:flex-row flex-col gap-5">
                <CustomInput
                    label="Role"
                    type="select"
                    white={white}
                    value={form.role}
                    options={[
                        { value: "student", label: "Student" },
                        { value: "teacher", label: "Teacher" },
                        { value: "school", label: "School" },
                    ]}
                    onChange={(v) => updateField("role", v)}
                />

                <CustomInput
                    label="Full Name"
                    white={white}
                    placeholder="Input Full Name"
                    value={form.fullName}
                    onChange={(v) => updateField("fullName", v)}
                />
            </div>

            {/* Email and Phone */}
            <div className="flex md:flex-row flex-col gap-5">
                <CustomInput
                    label="Email"
                    white={white}
                    type="email"
                    placeholder="Input Email"
                    value={form.email}
                    onChange={(v) => updateField("email", v)}
                />

                <CustomInput
                    label="Phone Number"
                    white={white}
                    type="phone"
                    placeholder="Enter Phone Number"
                    value={form.phone}
                    onChange={(v) => updateField("phone", v)}
                />
            </div>

            {/* Institution and Loan */}
            <div className="flex md:flex-row flex-col gap-5">
                <CustomInput
                    label="Institution"
                    type="select"
                    white={white}
                    value={form.institution}
                    options={[
                        { value: "student", label: "Student" },
                        { value: "teacher", label: "Teacher" },
                        { value: "school", label: "School" },
                    ]}
                    onChange={(v) => updateField("institution", v)}
                />

                <CustomInput
                    label="Loan Amount"
                    type="number"
                    white={white}
                    placeholder="Enter Loan Amount"
                    value={form.loanAmount}
                    onChange={(v) => updateField("loanAmount", v)}
                    price
                />
            </div>

            <div className="pt-[2.375rem] w-full pb-6 relative z-0">
                <button
                    className="bg-[#002561] w-full font-bold py-[0.9375rem] rounded-lg text-white"
                >
                    Join Waitlist
                </button>
            </div>

            {/* Debug (optional): See values live */}
            {/* <pre>{JSON.stringify(form, null, 2)}</pre> */}
        </form>
    );
}
