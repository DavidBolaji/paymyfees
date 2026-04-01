'use client';

import { LoadingHourGlassIcon } from '@/assets/icons/LoadingHourGlassIcon';

import { CloseCircleIcon } from '@/assets/icons/CloseCircleIcon';
import { SentIcon } from '@/assets/icons/SentIcon';
import useLoan from '@/hooks/useLoan';
import { LoanStatus } from '@prisma/client';
import { CheckSquareIcon } from '@/assets/icons/CheckSquareIcon';
import { useRouter } from 'next/navigation';



export function ApplicationStatus() {
  // This would normally come from API/state management
   const { currentLoan } = useLoan()
   console.log(currentLoan?.status)
   const router = useRouter();

   const handleRepayment = () => {
    // Navigate to repayment page or open repayment modal
    router.push('/dashboard/wallet');
   };


  if (!currentLoan) {
    return (
      <div className="flex flex-col justify-center items-center py-12 sm:py-16 md:py-20 text-center px-4">
        <div className="flex justify-center items-center bg-blue-50 mb-4 sm:mb-6 md:mb-8 rounded-full w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
          <LoadingHourGlassIcon size={40}/>
        </div>
        
        <h3 className="mb-2 sm:mb-3 md:mb-4 font-semibold text-[#292D32] text-lg sm:text-xl md:text-2xl lg:text-[27px]">
          No loan history yet.
        </h3>
        
        <p className="max-w-md text-[#7C7C7C] text-sm sm:text-base md:text-[15px] leading-relaxed">
          There is no loan history available, to be able to see a loan history, you need to apply for a loan.
        </p>
      </div>
    );
  }

  if (
      currentLoan.status === LoanStatus.DISBURSED || 
      currentLoan.status === LoanStatus.ACTIVE) {
    return (
      <div className="flex flex-col justify-center items-center py-12 sm:py-16 md:py-20 text-center px-4">
        <div className="flex justify-center items-center bg-blue-50 mb-3 sm:mb-4 md:mb-5 rounded-full w-14 h-14 sm:w-16 sm:h-16 md:w-[4.5rem] md:h-[4.5rem]">
          <SentIcon size={32}/>
        </div>
        
        <h3 className="mb-1 sm:mb-2 md:mb-3 font-semibold text-[#191919] text-lg sm:text-xl md:text-2xl lg:text-[1.6875rem]">
          Application has been approved
        </h3>
        
        <p className="mb-4 sm:mb-5 md:mb-6 max-w-md text-[#5F5F5F] text-sm sm:text-base md:text-[1.075rem] leading-relaxed">
          The loan you requested for your tuition has been paid to your school, for repayment click on the tab below.
        </p>

        <button onClick={handleRepayment} className="flex justify-center items-center gap-2 bg-[#00296B] hover:bg-[#002561] px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg min-w-[180px] sm:min-w-[200px] font-medium text-white transition-colors text-sm sm:text-base">
          <CheckSquareIcon />
          Make Repayment
        </button>
      </div>
    );
  }

  if (currentLoan.status === LoanStatus.REJECTED) {
    return (
      <div className="flex flex-col justify-center items-center py-12 sm:py-16 md:py-20 text-center px-4">
        <div className="flex justify-center items-center bg-[#FEE6E6] mb-3 sm:mb-4 md:mb-5 rounded-full w-14 h-14 sm:w-16 sm:h-16 md:w-[4.5rem] md:h-[4.5rem]">
          <CloseCircleIcon size={32} color="#DC0505"  />
        </div>
        
        <h3 className="mb-1 sm:mb-2 md:mb-3 font-semibold text-[#191919] text-lg sm:text-xl md:text-2xl lg:text-[1.6875rem]">
         Application has been denied!
        </h3>
        
        <p className="max-w-md text-[#5F5F5F] text-sm sm:text-base md:text-[1.075rem] leading-relaxed">
         Your application has been denied due to certain reasons, you can re-apply for another loan on the apply for loan tab.
        </p>

      </div>
    );
  }

  // Pending state
  return (
    <div className="flex flex-col justify-center items-center py-12 sm:py-16 md:py-20 text-center px-4">
      <div className="flex justify-center items-center bg-blue-50 mb-3 sm:mb-4 md:mb-5 rounded-full w-14 h-14 sm:w-16 sm:h-16 md:w-[4.5rem] md:h-[4.5rem]">
        <LoadingHourGlassIcon size={32} color="#00296B" />
      </div>
      
      <h3 className="mb-1 sm:mb-2 md:mb-3 font-semibold text-[#191919] text-lg sm:text-xl md:text-2xl lg:text-[1.6875rem]">
        Application is pending
      </h3>
      
      <p className="max-w-md text-[#5F5F5F] text-sm sm:text-base md:text-[1.075rem] leading-relaxed">
        Your application is still pending. Kindly hold on for your application status to change.
      </p>
    </div>
  );
}