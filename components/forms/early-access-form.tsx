"use client";

import { CustomInput } from "@/components/ui/custom-input";
import { WaitlistSuccessModal } from "@/components/ui/waitlist-success-modal";
import { useState } from "react";
import toast from "react-hot-toast";

export function EarlyAccessForm({ white = false }: { white?: boolean }) {
  const [form, setForm] = useState({
    role: "",
    fullName: "",
    email: "",
    phone: "",
    institution: "",
    loanAmount: "",
  });

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Helper to update form fields
  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Validation helper
  const isFormValid = () => {
    return (
      form.role.trim() !== "" &&
      form.fullName.trim() !== "" &&
      form.email.trim() !== "" &&
      form.phone.trim() !== "" &&
      form.institution.trim() !== "" &&
      form.loanAmount.trim() !== ""
    );
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!isFormValid()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        setShowSuccessModal(true);
        setForm({
          role: "",
          fullName: "",
          email: "",
          phone: "",
          institution: "",
          loanAmount: "",
        });
      } else {
        toast.error("Failed to submit. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="z-50 relative space-y-4 w-full">
      {/* Role and Name */}
      <div className="flex md:flex-row flex-col gap-5">
        <CustomInput
          label="Role"
          type="select"
          white={white}
          value={form.role}
          options={[
            { value: "parent", label: "Parent" },
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
          placeholder="Enter Institution"
          white={white}
          value={form.institution}
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

      <div className="z-0 relative pt-[2.375rem] pb-6 w-full">
        <button
          type="submit"
          disabled={loading || !isFormValid()}
          className={`bg-[#002561] w-full font-bold py-[0.9375rem] rounded-lg text-white ${
            loading || !isFormValid() ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Submitting..." : "Join Waitlist"}
        </button>
      </div>

      {/* Waitlist Success Modal */}
      <WaitlistSuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
      />
    </form>
  );
}
