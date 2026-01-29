/**
 * Create Installments Script
 * 
 * This script creates installments for an active loan.
 * It's used to fix the issue where the dashboard stats aren't showing
 * the correct number of installments.
 */

import { PrismaClient, LoanStatus, PaymentStatus } from '@prisma/client';
const prisma = new PrismaClient();

async function createInstallments() {
  try {
    // Find the active loan
    const activeLoan = await prisma.loan.findFirst({
      where: {
        status: LoanStatus.ACTIVE
      }
    });

    if (!activeLoan) {
      console.log('No active loans found.');
      return;
    }

    console.log(`Found active loan: ${activeLoan.loanNumber}`);

    // Check if installments already exist
    const existingInstallments = await prisma.installment.findMany({
      where: {
        loanId: activeLoan.id
      }
    });

    if (existingInstallments.length > 0) {
      console.log(`Loan already has ${existingInstallments.length} installments.`);
      return;
    }

    // Create installments
    const totalInstallments = activeLoan.repaymentMonths;
    const installmentAmount = activeLoan.monthlyPayment;
    const disbursementDate = activeLoan.disbursementDate || new Date();

    console.log(`Creating ${totalInstallments} installments of ₦${installmentAmount} each.`);

    // Create installments
    for (let i = 0; i < totalInstallments; i++) {
      const dueDate = new Date(disbursementDate);
      dueDate.setMonth(dueDate.getMonth() + i + 1); // First payment due 1 month after disbursement

      await prisma.installment.create({
        data: {
          loanId: activeLoan.id,
          installmentNumber: i + 1,
          amount: installmentAmount,
          dueDate,
          status: PaymentStatus.PENDING,
          daysOverdue: 0,
          lateFee: 0
        }
      });
    }

    console.log(`Created ${totalInstallments} installments successfully.`);

  } catch (error) {
    console.error('Error creating installments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
createInstallments()
  .then(() => console.log('Script completed'))
  .catch(error => console.error('Script failed:', error));