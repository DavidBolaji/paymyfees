/**
 * Debug script to check payment plan data
 * Run with: node scripts/run-debug-payment-plan.js
 */

import { Installment } from '@prisma/client';
import { prisma } from '../src/database/prisma';

async function debugPaymentPlan() {
  try {
    console.log('🔍 Checking payment plan data...\n');

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    console.log(`Found ${users.length} users\n`);

    for (const user of users) {
      console.log(`\n👤 User: ${user.email} (${user.role})`);
      console.log(`   ID: ${user.id}`);

      // Get all loans for this user
      const loans = await prisma.loan.findMany({
        where: { userId: user.id },
        include: {
          installments: {
            orderBy: { installmentNumber: 'asc' },
          },
          school: {
            select: {
              schoolName: true,
            },
          },
        },
      });

      if (loans.length === 0) {
        console.log('   ❌ No loans found');
        continue;
      }

      console.log(`   📋 Found ${loans.length} loan(s):\n`);

      for (const loan of loans) {
        console.log(`   Loan ID: ${loan.id}`);
        console.log(`   Loan Number: ${loan.loanNumber}`);
        console.log(`   Status: ${loan.status}`);
        console.log(`   Amount: ₦${loan.loanAmount.toLocaleString()}`);
        console.log(`   School: ${loan.school?.schoolName || loan.schoolName}`);
        console.log(`   Repayment Months: ${loan.repaymentMonths}`);
        console.log(`   Amount Repaid: ₦${loan.amountRepaid.toLocaleString()}`);
        console.log(`   Outstanding: ₦${loan.outstandingBalance.toLocaleString()}`);
        console.log(`   Installments: ${loan.installments.length}`);

        if (loan.installments.length > 0) {
          const paidCount = loan.installments.filter((i: any) => i.status === 'PAID').length;
          const pendingCount = loan.installments.filter((i: any) => i.status === 'PENDING').length;
          const overdueCount = loan.installments.filter((i: any) => i.status === 'OVERDUE').length;

          console.log(`     - Paid: ${paidCount}`);
          console.log(`     - Pending: ${pendingCount}`);
          console.log(`     - Overdue: ${overdueCount}`);

          // Show first few installments
          console.log(`\n   First 3 installments:`);
          loan.installments.slice(0, 3).forEach((inst: Installment) => {
            console.log(`     #${inst.installmentNumber}: ₦${inst.amount.toLocaleString()} - ${inst.status} - Due: ${inst.dueDate.toLocaleDateString()}`);
          });
        }

        console.log('');
      }

      // Check which statuses would match the active payment plan filter
      const activeStatuses = ['ACTIVE', 'DISBURSED', 'APPROVED'];
      const activeLoans = loans.filter((l: any) => activeStatuses.includes(l.status));

      if (activeLoans.length > 0) {
        console.log(`   ✅ ${activeLoans.length} loan(s) would show in payment plan`);
      } else {
        console.log(`   ⚠️  No loans with status: ${activeStatuses.join(', ')}`);
        console.log(`   Current statuses: ${loans.map((l: any) => l.status).join(', ')}`);
      }
    }

    console.log('\n✅ Debug complete');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugPaymentPlan();
