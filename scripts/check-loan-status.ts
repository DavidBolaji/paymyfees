/**
 * Check Loan Status Script
 * Quick diagnostic to see what status your loans have
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkLoanStatus() {
  try {
    console.log('🔍 Checking all loans in database...\n');

    const loans = await prisma.loan.findMany({
      include: {
        installments: {
          select: {
            id: true,
            installmentNumber: true,
            status: true,
            dueDate: true,
            amount: true,
          },
          orderBy: { installmentNumber: 'asc' },
        },
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });

    if (loans.length === 0) {
      console.log('❌ No loans found in database');
      return;
    }

    console.log(`✅ Found ${loans.length} loan(s)\n`);

    for (const loan of loans) {
      console.log('━'.repeat(60));
      console.log(`📋 Loan: ${loan.loanNumber}`);
      console.log(`   User: ${loan.user.email} (${loan.user.role})`);
      console.log(`   Status: ${loan.status} ⭐`);
      console.log(`   Amount: ₦${loan.loanAmount.toLocaleString()}`);
      console.log(`   Repayment Months: ${loan.repaymentMonths}`);
      console.log(`   Monthly Payment: ₦${loan.monthlyPayment.toLocaleString()}`);
      console.log(`   Amount Repaid: ₦${loan.amountRepaid.toLocaleString()}`);
      console.log(`   Outstanding: ₦${loan.outstandingBalance.toLocaleString()}`);
      console.log(`   Installments: ${loan.installments.length}`);

      if (loan.installments.length > 0) {
        const paid = loan.installments.filter(i => i.status === 'PAID').length;
        const pending = loan.installments.filter(i => i.status === 'PENDING').length;
        const overdue = loan.installments.filter(i => i.status === 'OVERDUE').length;

        console.log(`\n   Installment Status:`);
        console.log(`   - Paid: ${paid}`);
        console.log(`   - Pending: ${pending}`);
        console.log(`   - Overdue: ${overdue}`);

        console.log(`\n   Next 3 installments:`);
        loan.installments.slice(0, 3).forEach(inst => {
          console.log(`     #${inst.installmentNumber}: ₦${inst.amount.toLocaleString()} - ${inst.status} - ${inst.dueDate.toLocaleDateString()}`);
        });
      }

      console.log('\n   🎯 Payment Plan Eligibility:');
      const eligibleStatuses = ['ACTIVE', 'DISBURSED', 'APPROVED', 'UNDER_REVIEW'];
      const isEligible = eligibleStatuses.includes(loan.status);
      
      if (isEligible) {
        console.log(`   ✅ This loan SHOULD show in payment plan`);
      } else {
        console.log(`   ❌ This loan will NOT show in payment plan`);
        console.log(`   Current status: ${loan.status}`);
        console.log(`   Eligible statuses: ${eligibleStatuses.join(', ')}`);
      }
      
      console.log('');
    }

    console.log('━'.repeat(60));
    console.log('\n✅ Diagnostic complete\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLoanStatus();
