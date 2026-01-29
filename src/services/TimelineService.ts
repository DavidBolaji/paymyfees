/**
 * Timeline Service
 * Business logic for timeline operations
 */

import { TimelineRepository, ITimelineRepository } from '@/src/repositories/TimelineRepository';
import { NotFoundError, UnauthorizedError } from '@/src/types/errors';
import { LoanStatus, PaymentStatus } from '@prisma/client';
import { ISchoolRepository, SchoolRepository } from '../repositories/SchoolRepository';

export interface TimelineProgressOverview {
  progress: string;
  totalPaid: string;
  outstanding: string;
  nextRepayment: string;
  nextRepaymentDate: string;
  percentageCompleted: number;
}

export interface RepaymentStage {
  label: string;
  value: string;
  isPaid: boolean;
}

export interface TimelineStep {
  id: string;
  title: string;
  subtitle?: string;
  status: 'completed' | 'upcoming';
}

export interface TimelineData {
  progressOverview: TimelineProgressOverview;
  repaymentStages: RepaymentStage[];
  detailedTimeline: TimelineStep[];
  disbursementReceiptUrl?: string;
}

/**
 * Timeline Service Interface
 */
export interface ITimelineService {
  getTimelineData(userId: string, loanId?: string): Promise<TimelineData>;
}

/**
 * Timeline Service Implementation
 */
export class TimelineService implements ITimelineService {
  private timelineRepository: ITimelineRepository;
  private schoolRepository: ISchoolRepository;

  constructor(timelineRepository?: ITimelineRepository, schoolRepository?: ISchoolRepository) {
    this.timelineRepository = timelineRepository || new TimelineRepository();
    this.schoolRepository = schoolRepository || new SchoolRepository()
  }

  /**
   * Get timeline data for a loan
   * If loanId is not provided, get the most recent active/disbursed loan
   */
  async getTimelineData(userId: string, loanId?: string): Promise<TimelineData> {
    console.log({ msg: 'Getting timeline data', loanId, userId });

    let loanData;

    if (loanId) {
      // Fetch specific loan
      loanData = await this.timelineRepository.getLoanWithInstallments(loanId);

      if (!loanData) {
        throw new NotFoundError('Loan not found');
      }

      // Verify loan belongs to user
      if (loanData.userId !== userId) {
        throw new UnauthorizedError('You do not have permission to access this loan');
      }
    } else {
      // Get user's most recent active loan
      loanData = await this.timelineRepository.getUserActiveLoan(userId);
    }

    // If no loan data, return empty state with 9 unchecked steps
    if (!loanData) {
      return {
        progressOverview: {
          progress: '0 / 0 months paid',
          totalPaid: '-',
          outstanding: '-',
          nextRepayment: '-',
          nextRepaymentDate: '-',
          percentageCompleted: 0,
        },
        repaymentStages: [
          { label: '1st Installment', value: '-', isPaid: false },
          { label: '2nd Installment', value: '-', isPaid: false },
          { label: '3rd Installment', value: '-', isPaid: false },
          { label: '4th Installment', value: '-', isPaid: false },
          { label: '5th Installment', value: '-', isPaid: false },
        ],
        detailedTimeline: [
          { id: '1', title: 'School Verified', status: 'upcoming' },
          { id: '2', title: 'Loan Approved', status: 'upcoming' },
          { id: '3', title: 'School Paid', status: 'upcoming' },
          { id: '4', title: '1st Repayment', status: 'upcoming' },
          { id: '5', title: '2nd Repayment', status: 'upcoming' },
          { id: '6', title: '3rd Repayment', status: 'upcoming' },
          { id: '7', title: '4th Repayment', status: 'upcoming' },
          { id: '8', title: '5th Repayment', status: 'upcoming' },
          { id: '9', title: '6th Repayment', status: 'upcoming' },
        ],
        disbursementReceiptUrl: undefined,
      };
    }

    // Calculate progress overview
    const progressOverview = this.calculateProgressOverview(loanData);

    // Build repayment stages
    const repaymentStages = this.buildRepaymentStages(loanData.installments);

    // Build detailed timeline
    const detailedTimeline = await this.buildDetailedTimeline(loanData);

    return {
      progressOverview,
      repaymentStages,
      detailedTimeline,
      //@ts-ignore
      disbursementReceiptUrl: loanData.disbursement?.transferReference,
    };
  }

  /**
   * Calculate progress overview
   */
  private calculateProgressOverview(loanData: any): TimelineProgressOverview {
    const totalInstallments = loanData.installments.length;
    const paidInstallments = loanData.installments.filter(
      (i: any) => i.status === PaymentStatus.PAID
    ).length;

    const totalPaid = Number(loanData.amountRepaid);
    const outstanding = Number(loanData.outstandingBalance);
    
    // Find next unpaid installment
    const nextInstallment = loanData.installments.find(
      (i: any) => i.status === PaymentStatus.PENDING
    );

    const percentageCompleted = totalInstallments > 0 
      ? Math.round((paidInstallments / totalInstallments) * 100) 
      : 0;

    return {
      progress: `${paidInstallments} / ${totalInstallments} months paid`,
      totalPaid: `₦${totalPaid.toLocaleString()}`,
      outstanding: `₦${outstanding.toLocaleString()}`,
      nextRepayment: nextInstallment ? `₦${Number(nextInstallment.amount).toLocaleString()}` : 'N/A',
      nextRepaymentDate: nextInstallment 
        ? new Date(nextInstallment.dueDate).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })
        : 'N/A',
      percentageCompleted,
    };
  }

  /**
   * Build repayment stages (showing first 5 installments)
   */
  private buildRepaymentStages(installments: any[]): RepaymentStage[] {
    const stages: RepaymentStage[] = [];
    const displayCount = Math.min(5, installments.length);

    for (let i = 0; i < displayCount; i++) {
      const installment = installments[i];
      const isPaid = installment.status === PaymentStatus.PAID;
      const ordinal = this.getOrdinal(i + 1);

      stages.push({
        label: isPaid ? `${ordinal} Installment Paid` : `${ordinal} Installment`,
        value: isPaid ? `₦${Number(installment.amount).toLocaleString()}` : 'Unpaid',
        isPaid,
      });
    }

    return stages;
  }

  /**
   * Build detailed timeline
   */
  private async buildDetailedTimeline(loanData: any): Promise<TimelineStep[]> {
    const steps: TimelineStep[] = [];
    let stepId = 1;

    const school = await this.schoolRepository.getSchoolById(loanData.schoolId)

    // Step 1: School Verified
    const isSchoolVerified = school.isVerified;
    steps.push({
      id: String(stepId++),
      title: 'School Verified',
      status: isSchoolVerified ? 'completed' : 'upcoming',
    });

    // Step 2: Loan Approved
    const isLoanApproved = [
      LoanStatus.APPROVED,
      LoanStatus.DISBURSED,
      LoanStatus.ACTIVE,
      LoanStatus.COMPLETED
    ].includes(loanData.status);
    
    steps.push({
      id: String(stepId++),
      title: 'Loan Approved',
      status: isLoanApproved ? 'completed' : 'upcoming',
    });

    // Step 3: School Paid (Disbursed)
    const isSchoolPaid = [
      LoanStatus.DISBURSED,
      LoanStatus.ACTIVE,
      LoanStatus.COMPLETED
    ].includes(loanData.status);
    
    steps.push({
      id: String(stepId++),
      title: 'School Paid',
      status: isSchoolPaid ? 'completed' : 'upcoming',
    });

    // Add repayment steps dynamically based on installments
    const totalInstallments = loanData.installments.length;
    
    if (totalInstallments > 0) {
      loanData.installments.forEach((installment: any, index: number) => {
        const isPaid = installment.status === PaymentStatus.PAID;
        const isNextDue = !isPaid && index === loanData.installments.findIndex(
          (i: any) => i.status === PaymentStatus.PENDING
        );

        // Add "Upcoming Repayment due" step only for the next unpaid installment
        if (isNextDue) {
          steps.push({
            id: String(stepId++),
            title: 'Upcoming Repayment due',
            subtitle: new Date(installment.dueDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            }),
            status: 'upcoming',
          });
        }

        // Add the installment payment step
        steps.push({
          id: String(stepId++),
          title: `${index + 1}/${totalInstallments} Repayment made`,
          status: isPaid ? 'completed' : 'upcoming',
        });
      });
    }

    return steps;
  }

  /**
   * Get ordinal suffix for number (1st, 2nd, 3rd, etc.)
   */
  private getOrdinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    //@ts-ignore
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }
}