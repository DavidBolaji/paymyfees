// @ts-nocheck
import { PrismaClient, PaymentStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

function calculateLoanDetails(amount: Decimal, interestRate: Decimal, months: number) {
  const amountNum = Number(amount);
  const rateNum = Number(interestRate);
  
  const interest = (amountNum * rateNum * months) / (12 * 100);
  const totalAmount = amountNum + interest;
  const monthlyPayment = totalAmount / months;
  
  return {
    totalInterest: interest,
    totalAmount,
    monthlyPayment,
  };
}

async function main() {
  try {
    // Find John Doe
    const johnDoe = await prisma.user.findUnique({
      where: { email: 'john.doe@example.com' },
    });

    if (!johnDoe) {
      console.log('❌ John Doe not found!');
      return;
    }

    const loans = await prisma.loan.findMany({
      where: { userId: johnDoe.id },
    });

    const loan = loans[0];
    if (!loan) {
      console.log('❌ No loan found for John Doe!');
      return;
    }

    console.log('🔄 Fixing John Doe\'s loan...\n');

    // Step 1: Find admin and school
    const admin = await prisma.user.findFirst({
      where: { email: 'admin@paymyfees.co' },
    });

    const school = await prisma.user.findFirst({
      where: { role: 'SCHOOL' },
      include: { schoolProfile: true },
    });

    // Step 2: Delete existing installments and disbursements if they exist
    console.log('Step 1: Cleaning up old records...');
    await prisma.installment.deleteMany({
      where: { loanId: loan.id },
    });
    await prisma.disbursement.deleteMany({
      where: { loanId: loan.id },
    });
    await prisma.loanStatusHistory.deleteMany({
      where: { loanId: loan.id },
    });
    console.log('  ✅ Old records cleared\n');

    // Step 3: Create fresh installments
    console.log('Step 2: Creating installments...');
    const loanCalc = calculateLoanDetails(
      loan.loanAmount,
      loan.interestRate,
      loan.repaymentMonths
    );

    const today = new Date();
    const firstPaymentDate = new Date(today);
    firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
    firstPaymentDate.setDate(1);

    for (let i = 0; i < loan.repaymentMonths; i++) {
      const dueDate = new Date(firstPaymentDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      await prisma.installment.create({
        data: {
          loanId: loan.id,
          installmentNumber: i + 1,
          amount: new Decimal(loanCalc.monthlyPayment),
          dueDate,
          status: PaymentStatus.PENDING,
        },
      });
    }
    console.log(`  ✅ Created ${loan.repaymentMonths} installments\n`);

    // Step 4: Create disbursement
    console.log('Step 3: Creating disbursement...');
    const schoolProfile = school?.schoolProfile?.[0];
    
    if (!schoolProfile) {
      console.log('  ⚠️  No school profile found, skipping disbursement');
    } else {
      await prisma.disbursement.create({
        data: {
          disbursementReference: `DISB${Date.now()}`,
          loanId: loan.id,
          schoolId: schoolProfile.id,
          amount: loan.loanAmount,
          status: 'COMPLETED',
          bankName: schoolProfile.bankName || 'First Bank of Nigeria',
          accountNumber: schoolProfile.accountNumber || '3012345678',
          accountName: schoolProfile.accountName || 'University of Lagos',
          disbursedAt: today,
          confirmedAt: today,
        },
      });
      console.log(`  ✅ Disbursement created\n`);
    }

    // Step 5: Update loan with payment dates
    console.log('Step 4: Updating loan details...');
    await prisma.loan.update({
      where: { id: loan.id },
      data: {
        status: 'DISBURSED',
        disbursementDate: today,
        firstPaymentDate,
        amountDisbursed: loan.loanAmount,
        approvalDate: today,
        approvedBy: admin?.id,
      },
    });
    console.log(`  ✅ Loan updated\n`);

    // Step 6: Create status history
    console.log('Step 5: Creating status history...');
    await prisma.loanStatusHistory.create({
      data: {
        loanId: loan.id,
        previousStatus: 'PENDING',
        newStatus: 'APPROVED',
        changedBy: admin?.id,
        reason: 'Approved by admin - Fixed',
      },
    });

    await prisma.loanStatusHistory.create({
      data: {
        loanId: loan.id,
        previousStatus: 'APPROVED',
        newStatus: 'DISBURSED',
        changedBy: admin?.id,
        reason: 'Funds disbursed to school - Fixed',
      },
    });
    console.log(`  ✅ Status history created\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ JOHN DOE\'S LOAN FIXED!\n');
    console.log('Summary:');
    console.log(`  Loan Number: ${loan.loanNumber}`);
    console.log(`  Status: DISBURSED ✅`);
    console.log(`  Amount: ₦${Number(loan.loanAmount).toLocaleString()}`);
    console.log(`  Monthly Payment: ₦${loanCalc.monthlyPayment.toLocaleString('en-NG', { maximumFractionDigits: 2 })}`);
    console.log(`  First Payment Due: ${firstPaymentDate.toLocaleDateString()}`);
    console.log(`  Total Installments: ${loan.repaymentMonths}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
