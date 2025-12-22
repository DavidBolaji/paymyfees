'use client';

import { 
  MessageCircle, 
  Phone, 
  Mail, 
  FileText, 
  HelpCircle,
  Search
} from 'lucide-react';
import { QuickActionCard } from '@/components/dashboard/quick-action-card';
import { faqItems } from '@/data';

export default function HelpCenterPage() {

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Help Center</h1>
          <p className="text-gray-600">Get help and support for your PayMyFees account</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search for help..."
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <QuickActionCard
            icon={MessageCircle}
            title="Live Chat"
            description="Chat with our support team for instant help"
          />
          
          <QuickActionCard
            icon={Phone}
            title="Call Support"
            description="Speak directly with our support representatives"
          />
          
          <QuickActionCard
            icon={Mail}
            title="Email Support"
            description="Send us an email and we'll respond within 24 hours"
          />
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <HelpCircle className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                <h3 className="font-medium text-gray-900 mb-2">{item.question}</h3>
                <p className="text-gray-600 text-sm">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Documentation</h2>
            </div>
            <p className="text-gray-600 mb-4">Access our comprehensive guides and documentation.</p>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View Documentation →
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <MessageCircle className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Community</h2>
            </div>
            <p className="text-gray-600 mb-4">Join our community forum to connect with other users.</p>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Join Community →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}