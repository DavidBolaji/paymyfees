export interface FAQ {
  question: string;
  answer: string;
}

export interface HelpCategory {
  id: string;
  title: string;
  description: string;
  faqs: FAQ[];
}

export const helpCategories: HelpCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn the basics of PayMyFees",
    faqs: [
      {
        question: "How do I create an account?",
        answer:
          "Sign up using your email and phone number. You'll receive a verification code to secure your account. Complete your profile with personal details, add your school information, and set up your wallet to get started.",
      },
      {
        question: "What documents do I need to apply?",
        answer:
          "You'll need a valid ID (BVN/NIN for local students or passport for international students), proof of enrollment from your school, and employment verification if applicable. All documents can be uploaded directly through the platform.",
      },
      {
        question: "How long does verification take?",
        answer:
          "School verification typically takes 1-3 business days. Once your school confirms your enrollment and invoice details, you'll receive a notification and can proceed with your loan application.",
      },
      {
        question: "Can I apply for multiple loans?",
        answer:
          "You can apply for a new loan once your previous loan is fully repaid or if you have less than 2 active loans. Each application is reviewed individually based on your repayment history and eligibility.",
      },
    ],
  },
  {
    id: "wallet-payments",
    title: "Wallet & Payments",
    description: "Manage your wallet and transactions",
    faqs: [
      {
        question: "How do I fund my wallet?",
        answer:
          "Navigate to the Wallet page and click 'Fund Wallet'. Enter the amount you want to add and complete the payment through Paystack using your debit card, bank transfer, or USSD. Funds are credited instantly upon successful payment.",
      },
      {
        question: "What payment methods are accepted?",
        answer:
          "We accept all major Nigerian debit cards (Visa, Mastercard, Verve), bank transfers, and USSD payments through our payment partner Paystack. International cards may be subject to additional verification.",
      },
      {
        question: "How do I make a repayment?",
        answer:
          "Ensure your wallet has sufficient balance, then go to your Payment Plan page. Click 'Make Payment' on any due installment. The amount will be deducted from your wallet balance automatically.",
      },
      {
        question: "Can I set up automatic payments?",
        answer:
          "Yes! Enable auto-debit in your wallet settings. Your installments will be automatically deducted from your wallet balance on their due dates, ensuring you never miss a payment.",
      },
      {
        question: "What happens if my payment fails?",
        answer:
          "If a payment fails due to insufficient wallet balance, you'll receive a notification. You have a 3-day grace period to fund your wallet and retry the payment before late fees apply.",
      },
    ],
  },
  {
    id: "loans-repayments",
    title: "Loans & Repayments",
    description: "Understanding loan terms and repayment",
    faqs: [
      {
        question: "What are the loan terms?",
        answer:
          "Loans range from ₦50,000 to ₦5,000,000 with repayment periods of 1-12 months. Interest rates vary based on loan amount and duration, typically between 5-15% per annum. You can view exact terms during the application process.",
      },
      {
        question: "How is interest calculated?",
        answer:
          "Interest is calculated on a reducing balance basis and distributed across your monthly installments. The total amount payable (principal + interest) is divided equally across your chosen repayment period.",
      },
      {
        question: "Can I pay off my loan early?",
        answer:
          "Yes! You can make early repayments at any time without penalties. Early repayment may reduce the total interest paid. Simply make additional payments through your payment plan page.",
      },
      {
        question: "What happens if I miss a payment?",
        answer:
          "Missing a payment triggers a late fee after the 3-day grace period. Continued missed payments may affect your credit score on the platform and limit future loan eligibility. Contact support immediately if you're facing difficulties.",
      },
      {
        question: "When will my school receive the funds?",
        answer:
          "Once your loan is approved, funds are disbursed directly to your school within 2-5 business days. You'll receive notifications at each stage, and your school will confirm receipt of payment.",
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    description: "Common issues and solutions",
    faqs: [
      {
        question: "My school verification is taking too long",
        answer:
          "If verification exceeds 5 business days, use the 'Contact Support' button on your School Verification page. Provide your application details and we'll follow up with your school directly.",
      },
      {
        question: "I can't log in to my account",
        answer:
          "Try resetting your password using the 'Forgot Password' link on the login page. If you're still unable to access your account, contact support with your registered email address.",
      },
      {
        question: "My payment was deducted but not reflected",
        answer:
          "Payment processing can take up to 10 minutes. If your wallet balance hasn't updated after 30 minutes, check your transaction history and contact support with your transaction reference number.",
      },
      {
        question: "I uploaded the wrong document",
        answer:
          "You can replace documents before your application is submitted for review. Go to your application, click on the document section, and upload the correct file. Once submitted, contact support for document updates.",
      },
      {
        question: "How do I update my school information?",
        answer:
          "Navigate to School Verification page and click 'Edit School Details'. Update the information and resubmit for verification. Note that changes may require re-verification by your school.",
      },
    ],
  },
  {
    id: "account-security",
    title: "Account & Security",
    description: "Keep your account safe and secure",
    faqs: [
      {
        question: "Is my data safe?",
        answer:
          "Yes. We use bank-level encryption (256-bit SSL) to protect your data. All sensitive information is encrypted at rest and in transit. We never share your personal information with third parties without your consent.",
      },
      {
        question: "How do I change my password?",
        answer:
          "Go to Profile Settings, click 'Security', then 'Change Password'. Enter your current password and your new password. You'll be logged out and need to sign in again with your new password.",
      },
      {
        question: "What if I suspect unauthorized access?",
        answer:
          "Immediately change your password and contact support. We'll review your account activity and take necessary security measures. Enable two-factor authentication for added security.",
      },
      {
        question: "Can I delete my account?",
        answer:
          "You can request account deletion by contacting support. Note that accounts with active loans cannot be deleted until all obligations are fulfilled. Your data will be permanently removed within 30 days.",
      },
    ],
  },
  {
    id: "resources-guides",
    title: "Resources & Guides",
    description: "Additional help and documentation",
    faqs: [
      {
        question: "Where can I find the user guide?",
        answer:
          "Comprehensive user guides are available in the Resources section of your dashboard. You'll find step-by-step tutorials, video walkthroughs, and downloadable PDFs for offline reference.",
      },
      {
        question: "How do I contact support?",
        answer:
          "Click the 'Help' icon in your dashboard or visit the Help Center. You can submit a support ticket, start a live chat during business hours (9 AM - 6 PM WAT), or email support@paymyfees.com.",
      },
      {
        question: "Are there any fees I should know about?",
        answer:
          "Loan processing is free. We charge a small transaction fee (1.5%) on wallet funding to cover payment gateway costs. Late payment fees apply after the grace period. All fees are clearly disclosed before confirmation.",
      },
      {
        question: "What makes PayMyFees different from banks?",
        answer:
          "We specialize in education financing with faster approval (24-48 hours vs weeks), flexible terms tailored to academic calendars, direct school disbursement, and no collateral requirements for eligible applicants.",
      },
    ],
  },
];

export const generalFAQs: FAQ[] = [
  {
    question: "Is PayMyFees a loan platform?",
    answer:
      "PayMyFees provides structured education finance solutions designed around education cycles. Our focus is responsibility, transparency, and dignity.",
  },
  {
    question: "Who can apply?",
    answer:
      "Parents and guardians of students in accredited educational institutions can apply. Both local (Nigerian) and international students are eligible with appropriate documentation.",
  },
  {
    question: "What about interest and repayment?",
    answer:
      "Interest rates range from 5-15% per annum based on loan amount and duration. Repayments are structured in monthly installments over 1-12 months with no early repayment penalties.",
  },
  {
    question: "When does disbursement start?",
    answer:
      "Disbursement begins 2-5 business days after loan approval. Funds are sent directly to your school's verified account, and you'll receive confirmation notifications.",
  },
  {
    question: "Is PayMyFees available nationwide?",
    answer:
      "Yes, PayMyFees is available to all Nigerian residents and supports students in accredited institutions nationwide and abroad.",
  },
  {
    question: "How do you assess applications?",
    answer:
      "We review employment status, income verification, credit history, school verification, and loan amount relative to income. Our goal is fair, transparent assessment.",
  },
  {
    question: "How can schools partner with PayMyFees?",
    answer:
      "Schools can register through our platform, complete verification, and start receiving disbursements. Contact our partnerships team at schools@paymyfees.com for onboarding support.",
  },
  {
    question: "How can I support PayMyFees if I don't need funding?",
    answer:
      "Share PayMyFees with parents and schools in your network. You can also provide feedback to help us improve our services and reach more families.",
  },
];
