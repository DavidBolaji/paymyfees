"use client";

import { CustomInput } from "@/components/ui/custom-input";
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

  // Helper to update form fields
  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
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
        toast.success("Successfully added to the waitlist!");
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
    <form onSubmit={handleSubmit} className="w-full space-y-4 relative z-50">
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

      <div className="pt-[2.375rem] w-full pb-6 relative z-0">
        <button
          type="submit"
          disabled={loading}
          className={`bg-[#002561] w-full font-bold py-[0.9375rem] rounded-lg text-white ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Submitting..." : "Join Waitlist"}
        </button>
      </div>
    </form>
  );
}
