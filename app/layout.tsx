import { Manrope } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import "react-phone-input-2/lib/style.css";


const manrope = Manrope({ subsets: ["latin"], weight: ["400","500", "600", "700", "800"]  });

export const metadata = {
  title: "PayMyFees – School Fee Loans & Installment Payments",
  description:
    "PayMyFees helps parents pay school fees directly to partner schools using flexible installment plans or short-term loans. Fast disbursement to schools, transparent repayment options, and instant receipts for every transaction.",
  keywords: [
    "PayMyFees",
    "school fee loans",
    "school fee payment",
    "installment payments",
    "fee financing",
    "pay in installments",
    "direct school payment",
    "education loans",
    "parent payments",
  ],
  authors: [{ name: "PayMyFees Team" }],
  creator: "PayMyFees",
  publisher: "PayMyFees",
  metadataBase: new URL("https://www.paymyfees.co"),
  applicationName: "PayMyFees",
  openGraph: {
    title: "PayMyFees – Loans & Installments for School Fees",
    description:
      "Access short-term loans or split school fees into manageable installments. PayMyFees disburses payments directly to partner schools and issues instant receipts for peace of mind.",
    siteName: "PayMyFees",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "PayMyFees Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PayMyFees – Loans & Installment Payments",
    description:
      "Get short-term fee financing or pay school fees in installments. Fast, secure, and paid directly to partner schools with instant receipts.",
    images: ["/images/logo/logo.png"],
    site: "@paymyfees", // remove or update if you don't have a handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      maxSnippet: -1,
      maxImagePreview: "large",
      maxVideoPreview: -1,
    },
  },
  category: "Finance",
  // optional: helpful short meta for link previews in some contexts
  alternates: {
    canonical: "https://paymyfees-nine.vercel.app",
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${manrope.className} `}>
        <QueryProvider>
          {children}
            <Toaster position="bottom-left" reverseOrder={false} />
          </QueryProvider>
      </body>
    </html>
  );
}