"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const faqs = [
  {
    question: "Who can apply?",
    answer:
      "Any parent, guardian, or student currently enrolled in an accredited institution can apply. Teachers and school staff are also eligible for salary-backed products.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Absolutely. We use bank-grade encryption and comply with the Nigeria Data Protection Regulation (NDPR) to ensure your personal and financial information is always secure.",
  },
  {
    question: "How can schools partner with PayMyFees?",
    answer:
      "Schools can sign up as institutional partners through our partner portal. Once verified, your students and staff gain access to our full suite of financing products.",
  },
  {
    question: "What makes PayMyFees different from banks?",
    answer:
      "Unlike banks, we are purpose-built for education finance — offering faster approvals, competitive rates, and repayment schedules aligned with school terms, not arbitrary bank deadlines.",
  },
  {
    question: "How can I support PayMyFees if I don't need funding?",
    answer:
      "You can help by referring friends, sharing our platform with your school administration, or joining our partner investment programme.",
  },
  {
    question: "How do you assess applications?",
    answer:
      "We use a proprietary model that considers employment status, income, school enrollment records, and repayment history — making it fairer and more accessible than traditional credit checks.",
  },
  {
    question: "Is PayMyFees available nationwide?",
    answer:
      "Yes. PayMyFees is available across all 36 states and the FCT. We work with both public and private institutions wherever they are located.",
  },
  {
    question: "What about interest and repayment?",
    answer:
      "Interest rates are competitive and fully disclosed before you accept any offer. Repayments are structured in monthly installments over your chosen tenure, with no hidden fees.",
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`flex flex-col rounded-[1rem] border bg-white px-5 py-[1.125rem] transition-colors duration-200 ${
        open ? "border-[#001D4C]" : "border-[#D9D9D9]"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={open}
      >
        <span
          className="text-[0.9375rem] font-bold leading-[1.3] tracking-[0] text-[#191919] md:text-[1.0625rem]"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          {question}
        </span>
        <span
          className={`flex h-[2rem] w-[2rem] shrink-0 items-center justify-center rounded-[0.4375rem] border transition-all duration-200 ${
            open
              ? "border-[#001D4C] bg-[#001D4C] text-white"
              : "border-[#D0D0D0] bg-transparent text-[#191919]"
          }`}
        >
          <Plus
            size={13}
            strokeWidth={2.5}
            className={`transition-transform duration-300 ${open ? "rotate-45" : "rotate-0"}`}
          />
        </span>
      </button>

      {/* Smooth height animation via CSS grid trick */}
      <div className={`faq-body ${open ? "open" : ""}`}>
        <div>
          <p
            className="pb-1 pt-3 text-[0.9375rem] font-medium leading-[1.55] tracking-[0] text-[#525252]"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

const leftCol = faqs.filter((_, i) => i % 2 === 0);
const rightCol = faqs.filter((_, i) => i % 2 !== 0);

export function HomeFaqSection() {
  return (
    <section id="faqs" className="bg-white px-6 pb-[4.375rem] pt-[4.375rem] md:px-10 xl:px-[11.25rem]">
      <div className="mx-auto max-w-[1512px]">
        {/* Header */}
        <div className="mb-[2.25rem] text-center [font-family:Manrope]">
          <h2 className="text-[1.5rem] font-extrabold leading-[105%] tracking-[0] text-[#191919] md:text-[2.125rem]">
            Frequently Asked Questions (FAQs)
          </h2>
          <p className="mt-[0.625rem] text-[0.9375rem] font-medium leading-[120%] tracking-[0] text-[#7C7C7C] md:text-[1.0625rem]">
            Clear answers to common questions about tuition financing, on how PayMyFees works
          </p>
        </div>

        {/* Two-column accordion grid */}
        <div className="grid gap-[0.875rem] md:grid-cols-2 md:items-start">
          <div className="flex flex-col gap-[0.875rem]">
            {leftCol.map((faq) => (
              <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
          <div className="flex flex-col gap-[0.875rem]">
            {rightCol.map((faq) => (
              <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
