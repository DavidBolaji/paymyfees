"use client";

import { useState } from "react";
import {
  Search,
  BookOpen,
  Wallet,
  DollarSign,
  Wrench,
  Shield,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { HelpCategoryCard } from "@/components/dashboard/help-category-card";
import { FAQItem } from "@/components/dashboard/faq-item";
import { helpCategories, generalFAQs } from "@/data/help-content";

export default function SchoolHelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categoryIcons = {
    "getting-started": BookOpen,
    "wallet-payments": Wallet,
    "loans-repayments": DollarSign,
    troubleshooting: Wrench,
    "account-security": Shield,
    "resources-guides": FileText,
  };

  const selectedCategoryData = helpCategories.find(
    (cat) => cat.id === selectedCategory
  );

  const filteredFAQs = searchQuery
    ? generalFAQs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : generalFAQs;

  return (
    <div className="pt-6 md:pt-0">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Let&apos;s Get You Sorted
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Quick answers, step-by-step guides, and fast support to make using
          PayMyFees simple and stress-free. Find exactly what you need when you
          need it.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-10 max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search help topics or guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-20 sm:pr-24 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169E1] focus:border-transparent text-gray-900 text-sm sm:text-base"
          />
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#4169E1] text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Search
          </button>
        </div>
      </div>

      {/* Category View */}
      {selectedCategory ? (
        <div className="mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Help Center
          </button>

          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {selectedCategoryData?.title}
            </h2>
            <p className="text-gray-600 mb-6">
              {selectedCategoryData?.description === "Learn the basics of PayMyFees"
                ? "Set up your school account, get verified, and start applying for funding in minutes."
                : selectedCategoryData?.description}
            </p>

            {selectedCategory === "getting-started" && (
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#4169E1] text-white rounded-full flex items-center justify-center font-semibold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Create Your School Account</h3>
                    <p className="text-sm text-gray-600">
                      Sign up with your school email and set up your school profile.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center font-semibold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Complete Your School Profile</h3>
                    <p className="text-sm text-gray-600">
                      Add school details, upload required documents, and get verified.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center font-semibold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Apply for Funding</h3>
                    <p className="text-sm text-gray-600">
                      Submit a funding application with your school&apos;s financial information.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Receive & Manage Funds</h3>
                    <p className="text-sm text-gray-600">
                      Receive disbursements directly to your school wallet and manage repayments.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedCategory === "getting-started" && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Links:</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/school-dashboard/apply-funding" className="text-[#4169E1] hover:underline">
                      • Apply for Funding
                    </a>
                  </li>
                  <li>
                    <a href="/school-dashboard/wallet" className="text-[#4169E1] hover:underline">
                      • Fund Your Wallet
                    </a>
                  </li>
                  <li>
                    <a href="/school-dashboard" className="text-[#4169E1] hover:underline">
                      • View Dashboard Overview
                    </a>
                  </li>
                  <li>
                    <a href="/school-dashboard/help" className="text-[#4169E1] hover:underline">
                      • Contact Support
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {selectedCategoryData?.faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                defaultOpen={index === 0}
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {helpCategories.map((category) => {
              const Icon = categoryIcons[category.id as keyof typeof categoryIcons];
              return (
                <HelpCategoryCard
                  key={category.id}
                  icon={Icon}
                  title={category.title}
                  description={category.description}
                  onClick={() => setSelectedCategory(category.id)}
                />
              );
            })}
          </div>

          {/* General FAQs */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Frequently Asked Questions (FAQs)
            </h2>
            <div className="space-y-3">
              {filteredFAQs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  defaultOpen={index === 0}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
