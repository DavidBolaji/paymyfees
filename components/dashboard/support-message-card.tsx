import React from 'react';
import { CheckCircle, Calendar } from 'lucide-react';
import { SupportMessage } from '@/src/schoolStore';


export default function SupportMessageCard({
  messages
}: {
  messages: SupportMessage[],
  unreadCount: number,
  onMarkAsRead: (messageId: string) => Promise<boolean>
}) {
  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex p-6 items-center gap-3 mb-4 border-b pb-3">
        <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Support Messages</h2>
      </div>

      {/* Message Content */}
      <div className="mb-6 px-6">
        <p className="text-center text-sm text-blue-900 leading-relaxed mb-3 min-h-16">
          {messages.length ? messages[0]?.message : "No support messages yet"}
        </p>

        {/* Date */}
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">
            {messages.length && messages[0]?.createdAt
              ? new Date(messages[0].createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })
              : '-'}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className='px-6 pb-6'>
        <button disabled={messages.length? false : true} className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-blue-800/60 text-white font-medium py-3.5 px-4 rounded-lg flex items-center justify-center gap-2.5 transition-colors">
          <CheckCircle className="w-5 h-5" strokeWidth={2} />
          <span>Re-upload Document</span>
        </button>
      </div>
    </div>
  );
}