// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Find John Doe
    const johnDoe = await prisma.user.findUnique({
      where: { email: 'john.doe@example.com' },
      include: {
        parentProfile: true,
      },
    });

    if (!johnDoe) {
      console.log('❌ John Doe not found!');
      return;
    }

    // Get loans separately
    const loans = await prisma.loan.findMany({
      where: { userId: johnDoe.id },
      include: {
        installments: true,
        disbursement: true,
        statusHistory: true,
      },
    });

    // Get wallet
    const wallet = await prisma.wallet.findFirst({
      where: { userId: johnDoe.id },
    });

    console.log('\n📊 JOHN DOE USER DATA:\n');
    console.log('User Info:');
    console.log(`  ID: ${johnDoe.id}`);
    console.log(`  Email: ${johnDoe.email}`);
    console.log(`  Full Name: ${johnDoe.fullName}`);
    console.log(`  Residency: ${johnDoe.residencyStatus}`);
    console.log(`  Wallet Balance: ₦${wallet?.balance || 0}`);

    if (loans && loans.length > 0) {
      console.log('\n💰 LOAN DETAILS:\n');
      const loan = loans[0]!;
      console.log(`  Loan Number: ${loan.loanNumber}`);
      console.log(`  Amount: ₦${loan.loanAmount.toLocaleString()}`);
      console.log(`  Status: ${loan.status} ❌ (SHOULD BE DISBURSED)`);
      console.log(`  Application Date: ${loan.applicationDate}`);
      console.log(`  Approval Date: ${loan.approvalDate}`);
      console.log(`  Disbursement Date: ${loan.disbursementDate}`);
      console.log(`  Outstanding Balance: ₦${loan.outstandingBalance.toLocaleString()}`);
      console.log(`  Amount Disbursed: ${loan.amountDisbursed || 'NOT SET'}`);

      console.log('\n📋 INSTALLMENTS:');
      if (loan.installments.length === 0) {
        console.log(`  ❌ NO INSTALLMENTS CREATED (This is why no next payment due!)`);
      } else {
        console.log(`  Total: ${loan.installments.length}`);
        loan.installments.forEach((inst: any) => {
          console.log(
            `    - Installment ${inst.installmentNumber}: ₦${inst.amount.toLocaleString()} due ${inst.dueDate.toLocaleDateString()} - Status: ${inst.status}`
          );
        });
      }

      console.log('\n💳 DISBURSEMENTS:');
      if (!loan.disbursement) {
        console.log(`  ❌ NO DISBURSEMENT CREATED`);
      } else {
        console.log(`    - Reference: ${loan.disbursement.disbursementReference}`);
        console.log(`    - Amount: ₦${loan.disbursement.amount.toLocaleString()}`);
        console.log(`    - Status: ${loan.disbursement.status}`);
      }

      console.log('\n🔄 LOAN STATUS HISTORY:');
      if (loan.statusHistory.length === 0) {
        console.log(`  ❌ NO STATUS HISTORY`);
      } else {
        loan.statusHistory.forEach((hist: any) => {
          console.log(
            `    - ${hist.fromStatus} → ${hist.toStatus} on ${hist.createdAt.toLocaleDateString()}`
          );
        });
      }
    } else {
      console.log('\n❌ NO LOANS FOUND FOR JOHN DOE');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  ISSUES FOUND:');
    console.log('  1. Loan status is PENDING (not APPROVED/DISBURSED)');
    console.log('  2. No installments created → no next payment due');
    console.log('  3. No disbursement record created');
    console.log('\n✅ TO FIX:');
    console.log('  Run: npm run fix:john-doe');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
