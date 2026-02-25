'use client';

import { useRouter } from 'next/navigation';
import {
  Edit3,
  Calendar,
  Send,
  Building,
  Wallet,
} from 'lucide-react';

const QUICK_ACTIONS = [
  {
    id: 'apply-loan',
    label: 'Apply for\nLoan',
    icon: Edit3,
    href: '/dashboard/apply-loan',
  },
  {
    id: 'view-payment-plan',
    label: 'View Payment\nPlan',
    icon: Calendar,
    href: '/dashboard/view-payment-plan',
  },
  {
    id: 'make-payment',
    label: 'Make Payment',
    icon: Send,
    href: '/dashboard/wallet',
  },
  {
    id: 'update-school',
    label: 'Update School\nDetails',
    icon: Building,
    href: '/dashboard/school-verification',
  },
  {
    id: 'fund-wallet',
    label: 'Fund Wallet',
    icon: Wallet,
    href: '/dashboard/wallet',
  },
];

export function QuickActionsCard() {
  const router = useRouter();

  return (
    <div
      className="bg-[#E6EAF0] border-[3px] border-[#00296B] rounded-[20px] mb-8 px-6 py-8 md:px-[127px] md:py-[49px]"
    >
      <div className="flex flex-col items-center gap-[23px]">
        <h3 className="text-center font-bold text-[#191919] text-lg md:text-[27px] mb-6">
          Let&apos;s get started today?
        </h3>
        <div className="flex items-start justify-center gap-6 sm:gap-8 md:gap-[50px] flex-wrap">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => router.push(action.href)}
              className="flex flex-col items-center gap-2.5 group"
            >
              <div className="w-[60px] h-[58px] md:w-[89px] md:h-[87px] rounded-[12px] bg-[#00296B] flex items-center justify-center p-[10px] group-hover:bg-[#003D82] transition-colors">
                <action.icon className="w-7 h-7 md:w-10 md:h-10 text-white" strokeWidth={1.5} />
              </div>
              <span className="text-xs md:text-lg font-semibold text-[#191919] text-center whitespace-pre-line leading-tight">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
