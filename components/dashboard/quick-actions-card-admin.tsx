'use client';

import { useRouter } from 'next/navigation';
import { UserCircleIcon } from '@/assets/icons/UserCircleIcon';
import { SentIcon } from '@/assets/icons/SentIcon';
import { BuildingIcon } from '@/assets/icons/BuildingIcon';

const QUICK_ACTIONS = [
  {
    id: 'student-profile',
    label: 'Student Profile',
    icon: UserCircleIcon,
    href: '/admin/students/student-profile',
  },
  {
    id: 'payment-reminder',
    label: 'Send Payment Reminder',
    icon: SentIcon,
    href: '/admin/students/delayed-payments',
  },
  {
    id: 'school-verification',
    label: 'School Verification',
    icon: BuildingIcon,
    href: '/admin/schools/verification',
  },
];

export function QuickActionsCardAdmin() {
  const router = useRouter();

  return (
    <div className="bg-[#E6EAF0] border-[3px] border-[#00296B] rounded-[20px] mb-8 px-3 sm:px-4 md:px-[7.4375rem] py-6 sm:py-7 md:py-[49px] md:max-h-[300px]">
      <div className="flex flex-col items-center justify-between">
        <h2 className="text-center font-bold text-[#191919] text-base sm:text-lg md:text-[27px] mb-4 sm:mb-6 md:mb-8">
          What would you like to do?
        </h2>
        <div className="grid grid-cols-3 gap-x-4 gap-y-2.5 sm:gap-x-8 sm:gap-y-3 md:gap-x-20 md:gap-y-6 w-full">
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
