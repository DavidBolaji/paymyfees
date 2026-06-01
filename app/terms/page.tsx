import { HomeHeader } from "@/components/home/home-header";
import { HomeFooterSection } from "@/components/home/home-footer-section";
import { HomeGradientWrapper } from "@/components/home/home-gradient-wrapper";
import { MaxScreenContainer } from "@/components/layout/max-screen-container";

const sections = [
  {
    number: "1",
    title: "Introduction",
    body: `These Terms and Conditions ("Terms") govern the use of the services provided by PayMyFees Limited ("PayMyFees", "we", "us", or "our"). By accessing or using our platform and services, you agree to be bound by these Terms.`,
  },
  {
    number: "2",
    title: "About PayMyFees",
    body: `PayMyFees Limited provides education financing solutions, including but not limited to school fees loans, teacher financing, school working capital support, and payment facilitation services.`,
  },
  {
    number: "3",
    title: "Eligibility",
    body: null,
    list: [
      "Be at least eighteen (18) years of age;",
      "Provide accurate, complete, and up-to-date information;",
      "Possess valid identification (including BVN, NIN, or any other acceptable form of identification); and",
      "Have the legal capacity to enter into a binding contract under applicable laws.",
    ],
    prefix: "To access and use our services, you must:",
  },
  {
    number: "4",
    title: "Account Registration and KYC Compliance",
    body: `Users are required to complete Know Your Customer (KYC) verification processes. PayMyFees reserves the right to verify all information provided and to suspend, restrict, or terminate any account where false, misleading, or incomplete information is detected.`,
  },
  {
    number: "5",
    title: "Nature of Services",
    body: `PayMyFees facilitates the payment of approved school fees directly to educational institutions on behalf of users. Loan repayments shall be made in accordance with the agreed repayment schedule.`,
  },
  {
    number: "6",
    title: "Loan Terms",
    subsections: [
      {
        label: "6.1 Loan Approval",
        text: "All loans are subject to approval and acceptance of specific offer terms communicated at the point of approval.",
      },
      {
        label: "6.2 Interest",
        text: "Interest shall be charged at a rate of 2.5% per month or as otherwise disclosed at the time of loan approval. All applicable charges shall be transparently communicated, and no hidden fees shall apply.",
      },
      {
        label: "6.3 Repayment",
        text: "Repayments shall be made in monthly instalments, typically due on or before the last working day of each month, unless otherwise agreed.",
      },
      {
        label: "6.4 Default",
        text: "Failure to meet repayment obligations may result in account restriction or suspension; reporting to relevant credit bureaus; engagement of debt recovery processes; and/or initiation of legal proceedings.",
      },
    ],
  },
  {
    number: "7",
    title: "Payments",
    body: `All payments must be made exclusively to designated PayMyFees accounts. PayMyFees shall not be liable for any loss arising from payments made to incorrect or unauthorized accounts.`,
  },
  {
    number: "8",
    title: "User Obligations",
    body: "Users agree to:",
    list: [
      "Provide truthful and accurate information at all times;",
      "Refrain from impersonating any individual or entity;",
      "Avoid engaging in any unlawful or fraudulent activity; and",
      "Not interfere with or disrupt the integrity or performance of the platform.",
    ],
  },
  {
    number: "9",
    title: "Fraud and Misuse",
    body: `Any fraudulent activity, attempted fraud, or misuse of the platform shall result in immediate suspension or termination of access and may be reported to relevant law enforcement authorities.`,
  },
  {
    number: "10",
    title: "Data Protection and Privacy",
    subsections: [
      {
        label: "10.1 Regulatory Compliance",
        text: "PayMyFees Limited processes personal data in accordance with the Nigeria Data Protection Act, 2023 and applicable regulations.",
      },
      {
        label: "10.2 Consent and Lawful Processing",
        text: "By using our services, you consent to the collection, use, storage, and processing of your personal data for the purposes set out herein. Processing is carried out on lawful bases including contractual necessity, legal obligation, and legitimate interest.",
      },
      {
        label: "10.3 Scope and Purpose",
        text: "PayMyFees may collect and process personal, financial, biometric, and transactional data for identity verification, credit assessment, loan administration, payment processing, fraud prevention, risk management, and regulatory compliance.",
      },
      {
        label: "10.4 Data Sharing and Disclosure",
        text: "You expressly authorize PayMyFees to disclose and exchange your data with credit bureaus, financial institutions, identity verification platforms, regulators, law enforcement agencies, and third-party service providers for credit reporting, debt recovery, compliance, and service delivery purposes.",
      },
      {
        label: "10.5 Cross-Border Transfers",
        text: "You consent to the transfer of your data outside Nigeria where necessary, subject to appropriate safeguards in line with applicable law.",
      },
      {
        label: "10.6 Data Subject Rights",
        text: "You may exercise your rights of access, rectification, restriction, or withdrawal of consent, subject to legal and contractual limitations, including obligations relating to credit reporting and regulatory compliance.",
      },
      {
        label: "10.7 Data Security and Retention",
        text: "PayMyFees implements appropriate security measures and retains personal data for as long as necessary to fulfill contractual, legal, and regulatory obligations.",
      },
      {
        label: "10.8 Enforcement and Complaints",
        text: "PayMyFees may retain, process, and disclose personal data as required for enforcement of its rights. Complaints may be directed to PayMyFees or the Nigeria Data Protection Commission.",
      },
    ],
  },
  {
    number: "11",
    title: "Limitation of Liability",
    body: "To the fullest extent permitted by law, PayMyFees shall not be liable for any direct, indirect, incidental, or consequential losses arising from:",
    list: [
      "User error or negligence;",
      "Delays or failures caused by third-party service providers; or",
      "Interruptions in service availability.",
    ],
  },
  {
    number: "12",
    title: "Service Availability",
    body: `PayMyFees reserves the right to modify, suspend, or discontinue any aspect of its services at any time without prior notice.`,
  },
  {
    number: "13",
    title: "Termination",
    body: `PayMyFees may suspend or terminate a user's account at its sole discretion in cases of breach of these Terms, default in repayment, or suspicious or unlawful activity.`,
  },
  {
    number: "14",
    title: "Governing Law",
    body: `These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.`,
  },
  {
    number: "15",
    title: "Contact Information",
    body: `For inquiries or support, please contact us at support@paymyfees.co or call +234 803 585 1047.`,
  },
];

export default function TermsPage() {
  return (
    <MaxScreenContainer className="max-w-[1512px] bg-[#F4F4F4]">
      <HomeHeader />

      {/* Hero */}
      <HomeGradientWrapper>
        <div
          className="px-6 pb-[4.5rem] pt-[140px] text-center md:pb-[5.5rem] md:pt-[150px]"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          <p className="mb-3 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-[#B8C8E0]">
            Legal
          </p>
          <h1 className="mx-auto max-w-[560px] text-[2rem] font-extrabold leading-[1.1] tracking-[0] text-white md:text-[2.75rem]">
            Terms of Service
          </h1>
          <p className="mx-auto mt-4 max-w-[520px] text-[0.9375rem] font-medium leading-[1.6] text-white/60 md:text-[1.0625rem]">
            Last updated: May 2025. Please read these terms carefully before using our platform.
          </p>
        </div>
      </HomeGradientWrapper>

      {/* Content */}
      <section
        className="bg-[#F4F4F4] px-6 py-[4.375rem] md:px-10 xl:px-[11.25rem]"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        <div className="mx-auto max-w-[860px]">

          {/* Intro note */}
          <div className="mb-10 rounded-[1rem] border border-[#002561]/20 bg-white px-6 py-5">
            <p className="text-[0.9375rem] font-medium leading-[1.7] text-[#525252]">
              These Terms and Conditions are a binding legal agreement between you and{" "}
              <span className="font-bold text-[#191919]">PayMyFees Limited</span>. By registering
              an account or using our services, you confirm that you have read, understood, and
              agreed to these Terms in full.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {sections.map((section) => (
              <div
                key={section.number}
                className="rounded-[1rem] border border-[#D9D9D9] bg-white px-6 py-6"
              >
                {/* Section heading */}
                <div className="mb-3 flex items-start gap-3">
                  <span className="flex h-[2rem] w-[2rem] shrink-0 items-center justify-center rounded-[0.5rem] bg-[#002561] text-[0.75rem] font-bold text-white">
                    {section.number}
                  </span>
                  <h2 className="text-[1rem] font-extrabold leading-[1.3] text-[#191919] md:text-[1.125rem]">
                    {section.title}
                  </h2>
                </div>

                {/* Body text */}
                {section.body && (
                  <p className="text-[0.9375rem] font-medium leading-[1.7] text-[#525252]">
                    {section.body}
                  </p>
                )}

                {/* Prefix text */}
                {"prefix" in section && section.prefix && (
                  <p className="mb-2 text-[0.9375rem] font-medium leading-[1.7] text-[#525252]">
                    {section.prefix}
                  </p>
                )}

                {/* Bullet list */}
                {section.list && (
                  <ul className="mt-2 flex flex-col gap-2 pl-1">
                    {section.list.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-[0.9375rem] font-medium leading-[1.7] text-[#525252]">
                        <span className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#002561]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Subsections */}
                {section.subsections && (
                  <div className="mt-3 flex flex-col gap-4">
                    {section.subsections.map((sub) => (
                      <div key={sub.label}>
                        <p className="mb-1 text-[0.875rem] font-bold text-[#191919]">{sub.label}</p>
                        <p className="text-[0.9375rem] font-medium leading-[1.7] text-[#525252]">{sub.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom note */}
          <div className="mt-10 rounded-[1rem] border border-[#D9D9D9] bg-white px-6 py-5 text-center">
            <p className="text-[0.875rem] font-medium leading-[1.7] text-[#7C7C7C]">
              Questions about these Terms?{" "}
              <a href="mailto:support@paymyfees.co" className="font-semibold text-[#002561] hover:underline">
                support@paymyfees.co
              </a>{" "}
              or call{" "}
              <a href="tel:+2348035851047" className="font-semibold text-[#002561] hover:underline">
                +234 803 585 1047
              </a>
            </p>
          </div>
        </div>
      </section>

      <HomeFooterSection />
    </MaxScreenContainer>
  );
}
