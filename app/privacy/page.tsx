import { HomeHeader } from "@/components/home/home-header";
import { HomeFooterSection } from "@/components/home/home-footer-section";
import { HomeGradientWrapper } from "@/components/home/home-gradient-wrapper";
import { MaxScreenContainer } from "@/components/layout/max-screen-container";

const sections = [
  {
    number: "1",
    title: "Introduction",
    body: `PayMyFees Limited ("PayMyFees", "we", "us", or "our") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, share, and safeguard your data when you use our platform and services. By registering or using our services, you consent to the practices described in this Policy.`,
  },
  {
    number: "2",
    title: "Regulatory Compliance",
    body: `PayMyFees processes personal data in accordance with the Nigeria Data Protection Act, 2023 (NDPA) and all applicable data protection regulations. We are committed to upholding the highest standards of data privacy and security.`,
  },
  {
    number: "3",
    title: "Information We Collect",
    body: "We may collect and process the following categories of personal data:",
    list: [
      "Personal identification data: name, date of birth, email address, phone number, residential address;",
      "Identity verification data: BVN (Bank Verification Number), NIN (National Identification Number), government-issued ID documents;",
      "Financial data: bank account details, transaction history, loan repayment records, credit history;",
      "Biometric data: where applicable and required for verification purposes;",
      "Device and usage data: IP address, browser type, pages visited, time and date of access; and",
      "Communications: messages or enquiries submitted through our platform or support channels.",
    ],
  },
  {
    number: "4",
    title: "How We Use Your Data",
    body: "We collect and process your personal data for the following purposes:",
    list: [
      "Identity verification and KYC (Know Your Customer) compliance;",
      "Credit assessment and loan application processing;",
      "Loan administration and repayment management;",
      "Payment processing and disbursement directly to schools;",
      "Fraud prevention and risk management;",
      "Regulatory reporting and legal compliance;",
      "Customer support and dispute resolution; and",
      "Platform improvement and service personalisation.",
    ],
  },
  {
    number: "5",
    title: "Lawful Basis for Processing",
    body: "We process your personal data on the following lawful bases:",
    list: [
      "Contractual necessity — to fulfil our obligations under the agreement with you;",
      "Legal obligation — to comply with applicable laws and regulatory requirements;",
      "Legitimate interest — to prevent fraud, manage risk, and improve our services; and",
      "Consent — where you have explicitly provided consent for specific processing activities.",
    ],
  },
  {
    number: "6",
    title: "Data Sharing and Disclosure",
    body: `You expressly authorise PayMyFees to share and exchange your personal data with the following categories of recipients where necessary:`,
    list: [
      "Credit bureaus and credit reference agencies for credit scoring and reporting;",
      "Financial institutions and lenders involved in loan facilitation;",
      "Identity verification and KYC platform providers;",
      "Regulatory authorities, including the Central Bank of Nigeria (CBN) and the Nigeria Data Protection Commission (NDPC);",
      "Law enforcement agencies where required by law or court order;",
      "Educational institutions to facilitate payment of school fees; and",
      "Third-party service providers who assist us in operating our platform, subject to appropriate data processing agreements.",
    ],
  },
  {
    number: "7",
    title: "Cross-Border Data Transfers",
    body: `Where necessary for service delivery, your personal data may be transferred to and processed in countries outside Nigeria. We ensure that any such transfers are subject to appropriate safeguards in line with the Nigeria Data Protection Act, 2023, including contractual protections with recipient organisations.`,
  },
  {
    number: "8",
    title: "Your Data Subject Rights",
    body: "Subject to applicable law, you have the right to:",
    list: [
      "Access — request a copy of the personal data we hold about you;",
      "Rectification — request correction of inaccurate or incomplete data;",
      "Restriction — request that we limit the processing of your data in certain circumstances;",
      "Withdrawal of consent — withdraw your consent to processing where processing is based on consent; and",
      "Lodge a complaint — with PayMyFees or the Nigeria Data Protection Commission (NDPC).",
    ],
    footer: "Please note that certain rights may be subject to legal, contractual, or regulatory limitations, particularly in respect of credit reporting and regulatory compliance obligations.",
  },
  {
    number: "9",
    title: "Data Security",
    body: `PayMyFees implements appropriate technical and organisational security measures to protect your personal data against unauthorised access, disclosure, alteration, or destruction. These measures include encryption, access controls, and regular security assessments. While we take all reasonable steps to protect your data, no method of transmission over the internet is completely secure.`,
  },
  {
    number: "10",
    title: "Data Retention",
    body: `We retain your personal data for as long as is necessary to fulfil the purposes for which it was collected, including to satisfy legal, regulatory, accounting, and reporting obligations. Factors considered in determining retention periods include the nature of the data, the purpose for which it was collected, and applicable legal requirements.`,
  },
  {
    number: "11",
    title: "Cookies and Tracking Technologies",
    body: `Our platform may use cookies and similar tracking technologies to enhance your experience, analyse usage patterns, and improve our services. You may control cookie preferences through your browser settings, although disabling cookies may affect certain features of the platform.`,
  },
  {
    number: "12",
    title: "Children's Privacy",
    body: `Our services are not directed to individuals under the age of 18. We do not knowingly collect personal data from minors. If you believe we have inadvertently collected data from a minor, please contact us immediately at support@paymyfees.co.`,
  },
  {
    number: "13",
    title: "Updates to This Policy",
    body: `PayMyFees reserves the right to update this Privacy Policy at any time. We will notify you of material changes by posting the updated Policy on our platform. Your continued use of our services after such updates constitutes your acceptance of the revised Policy.`,
  },
  {
    number: "14",
    title: "Contact and Complaints",
    body: `For questions, data access requests, or complaints regarding this Privacy Policy or our data processing practices, please contact us:`,
    contactInfo: {
      email: "support@paymyfees.co",
      phone: "+234 803 585 1047",
    },
    footer: "You also have the right to lodge a complaint with the Nigeria Data Protection Commission (NDPC) if you believe your data rights have been violated.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <HomeHeader />


      {/* Hero */}
      <HomeGradientWrapper>
        <MaxScreenContainer className="max-w-[1512px] bg-[#F4F4F4]">
          <div
            className="px-6 pb-[4.5rem] pt-[140px] text-center md:pb-[5.5rem] md:pt-[150px]"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            <p className="mb-3 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-[#B8C8E0]">
              Legal
            </p>
            <h1 className="mx-auto max-w-[560px] text-[2rem] font-extrabold leading-[1.1] tracking-[0] text-white md:text-[2.75rem]">
              Privacy Policy
            </h1>
            <p className="mx-auto mt-4 max-w-[520px] text-[0.9375rem] font-medium leading-[1.6] text-white/60 md:text-[1.0625rem]">
              Last updated: May 2025. Your privacy matters to us. Here is how we handle your data.
            </p>
          </div>
        </MaxScreenContainer>
      </HomeGradientWrapper>

      {/* Content */}
      <section
        className="bg-[#F4F4F4] px-6 py-[4.375rem] md:px-10 xl:px-[11.25rem]"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        <MaxScreenContainer className="max-w-[1512px] bg-[#F4F4F4]">
          <div className="mx-auto max-w-[860px]">

            {/* Intro note */}
            <div className="mb-10 rounded-[1rem] border border-[#002561]/20 bg-white px-6 py-5">
              <p className="text-[0.9375rem] font-medium leading-[1.7] text-[#525252]">
                At <span className="font-bold text-[#191919]">PayMyFees Limited</span>, we take your
                privacy seriously. This Policy sets out our commitment to protecting your personal data
                in compliance with the{" "}
                <span className="font-semibold text-[#191919]">Nigeria Data Protection Act, 2023</span>.
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

                  {/* Contact info block */}
                  {"contactInfo" in section && section.contactInfo && (
                    <div className="mt-3 flex flex-col gap-1.5 rounded-[0.75rem] bg-[#F4F4F4] px-4 py-3">
                      <a
                        href="mailto:support@paymyfees.co"
                        className="text-[0.9375rem] font-semibold text-[#002561] hover:underline"
                      >
                        Email: {section.contactInfo.email}
                      </a>
                      <a
                        href="tel:+2348035851047"
                        className="text-[0.9375rem] font-semibold text-[#002561] hover:underline"
                      >
                        Phone: {section.contactInfo.phone}
                      </a>
                    </div>
                  )}

                  {/* Footer note */}
                  {"footer" in section && section.footer && (
                    <p className="mt-3 text-[0.875rem] font-medium leading-[1.7] italic text-[#7C7C7C]">
                      {section.footer}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom note */}
            <div className="mt-10 rounded-[1rem] border border-[#D9D9D9] bg-white px-6 py-5 text-center">
              <p className="text-[0.875rem] font-medium leading-[1.7] text-[#7C7C7C]">
                Questions about your privacy?{" "}
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
        </MaxScreenContainer>
      </section>

      <HomeFooterSection />

    </>
  );
}
