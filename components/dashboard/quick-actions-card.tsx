'use client';

import { useRouter } from 'next/navigation';

import { EditSquareIcon } from '@/assets/icons/EditSquareIcon';
import { ClipboardCheckIcon } from '@/assets/icons/ClipboardCheckIcon';
import { SentIcon } from '@/assets/icons/SentIcon';
import { BuildingIcon } from '@/assets/icons/BuildingIcon';
import { CardIcon } from '@/assets/icons/CardIcon';

const QUICK_ACTIONS = [
  {
    id: 'apply-loan',
    label: 'Loan Application',
    icon: EditSquareIcon,
    href: '/dashboard/apply-loan',
  },
  {
    id: 'view-payment-plan',
    label: 'Payment Plan',
    icon: ClipboardCheckIcon,
    href: '/dashboard/view-payment-plan',
  },
  {
    id: 'make-payment',
    label: 'Make Payment',
    icon: SentIcon,
    href: '/dashboard/wallet',
  },
  {
    id: 'update-school',
    label: 'School Details',
    icon: BuildingIcon,
    href: '/dashboard/school-verification',
  },
  {
    id: 'fund-wallet',
    label: 'Fund Wallet',
    icon: CardIcon,
    href: '/dashboard/wallet',
  },
];

export function QuickActionsCard() {
  const router = useRouter();

  return (
    <div
      className="bg-[#E6EAF0] border-[3px] border-[#00296B] rounded-[20px] mb-8 px-3 sm:px-4 md:px-[7.4375rem] py-6 sm:py-7 md:py-[49px] md:max-h-[300px]"
    >
      <div className="flex flex-col items-center justify-between">
        <h2 className="text-center font-bold text-[#191919] text-base sm:text-lg md:text-[27px] mb-4 sm:mb-6 md:mb-8">
          Let&apos;s get started today?
        </h2>
        <div className="grid grid-cols-5 gap-x-4 gap-y-2.5 sm:gap-x-4 sm:gap-y-3 md:gap-x-20 md:gap-y-6 w-full">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => router.push(action.href)}
              className="flex flex-col items-center gap-2 sm:gap-2.5 md:gap-2.5 group"
            >
              <div className="w-[47px] sm:w-12 md:w-[89px] h-[45px] sm:h-12 md:h-[87px] rounded-[8px] sm:rounded-[10px] md:rounded-[12px] bg-[#00296B] flex items-center justify-center p-[10px] sm:p-2.5 md:p-[10px] group-hover:bg-[#003D82] transition-colors">
                <action.icon className="w-[25px] sm:w-6 md:w-10 h-[25px] sm:h-6 md:h-10 text-white" />
              </div>
              <span className="text-[9px] sm:text-xs md:text-lg text-[#191919] text-center text-nowrap leading-[120%] font-semibold">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


const QUICK_ACTIONS2 = [
  {
    id: 'apply-loan',
    label: 'Loan Application',
    icon: EditSquareIcon,
    href: '/teacher-dashboard/apply-loan',
  },
  {
    id: 'view-payment-plan',
    label: 'Payment Plan',
    icon: ClipboardCheckIcon,
    href: '/teacher-dashboard/timeline',
  },
  {
    id: 'make-payment',
    label: 'Make Payment',
    icon: SentIcon,
    href: '/teacher-dashboard/wallet',
  },
  {
    id: 'fund-wallet',
    label: 'Fund Wallet',
    icon: CardIcon,
    href: '/teacher-dashboard/wallet',
  },
];

export function QuickActionsCard2() {
  const router = useRouter();

  return (
    <div
      className="bg-[#E6EAF0] border-[3px] border-[#00296B] rounded-[20px] mb-8 px-3 sm:px-4 md:px-[7.4375rem] py-6 sm:py-7 md:py-[49px] md:max-h-[300px]"
    >
      <div className="flex flex-col items-center justify-between">
        <h2 className="text-center font-bold text-[#191919] text-base sm:text-lg md:text-[27px] mb-4 sm:mb-6 md:mb-8">
          Let&apos;s get started today?
        </h2>
        <div className="grid grid-cols-4 gap-x-4 gap-y-2.5 sm:gap-x-4 sm:gap-y-3 md:gap-x-20 md:gap-y-6 w-full">
          {QUICK_ACTIONS2.map((action) => (
            <button
              key={action.id}
              onClick={() => router.push(action.href)}
              className="flex flex-col items-center gap-2 sm:gap-2.5 md:gap-2.5 group"
            >
              <div className="w-[47px] sm:w-12 md:w-[89px] h-[45px] sm:h-12 md:h-[87px] rounded-[8px] sm:rounded-[10px] md:rounded-[12px] bg-[#00296B] flex items-center justify-center p-[10px] sm:p-2.5 md:p-[10px] group-hover:bg-[#003D82] transition-colors">
                <action.icon className="w-[25px] sm:w-6 md:w-10 h-[25px] sm:h-6 md:h-10 text-white" />
              </div>
              <span className="text-[9px] sm:text-xs md:text-lg text-[#191919] text-center text-nowrap leading-[120%] font-semibold">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}