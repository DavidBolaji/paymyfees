import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import "react-phone-input-2/lib/style.css";


const manrope = Manrope({ subsets: ["latin"], weight: ["400","500", "600", "700", "800"]  });

export const metadata:Metadata = {
  title: "PaymyFees",
  description:
    "Fee payment application",
  openGraph: {
    title: "PaymyFees",
    description:
      "Fee payment application",
    url: "https://paymyfees-nine.vercel.app/",
    siteName: "Pay My Fees",
    images: [
      {
        url: "/images/logo/logo.png", // must be in /public
        width: 1200,
        height: 630,
        alt: "Pay My Fees Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PaymyFees",
    description:
      "Fee payment application",
    images: ["/images/logo/logo.png"],
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