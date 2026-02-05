import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function debugDashboardStats() {
  console.log('Starting dashboard stats debug...\n');
  
  try {
    // Check database connection
    await prisma.$connect();
    console.log('✓ Database connected\n');

    // Check all users first
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      }
    });

    console.log('=== ALL USERS IN DATABASE ===');
    console.log('Total users:', allUsers.length);
    
    if (allUsers.length === 0) {
      console.log('❌ No users found in database!');
      return;
    }
    
    allUsers.forEach((u, i) => {
      console.log(`${i + 1}. ${u.email} - ${u.role} - ${u.fullName}`);
    });

    // Find a parent or student user
    let user = await prisma.user.findFirst({
      where: { role: 'PARENT' }
    });

    if (!user) {
      console.log('\n⚠️  No parent user found, checking for student user...');
      user = await prisma.user.findFirst({
        where: { role: 'STUDENT' }
      });
    }

    if (!user) {
      console.log('\n❌ No parent or student user found in database');
      console.log('Please create a parent or student user');
      return;
    }

    console.log('\n=== USER INFO ===');
    console.log('User ID:', user.id);
    console.log('Email:', user.email);
    console.log('Name:', user.fullName);

    // Get loans
    const loans = await prisma.loan.findMany({
      where: { userId: user.id }
    });

    console.log('\n=== LOANS ===');
    console.log('Total loans:', loans.length);
    
    if (loans.length > 0) {
      loans.forEach((loan, index) => {
        console.log(`\nLoan ${index + 1}:`);
        console.log('  ID:', loan.id);
        console.log('  Status:', loan.status);
        console.log('  Loan Amount:', loan.loanAmount.toString());
        console.log('  Monthly Payment:', loan.monthlyPayment.toString());
        console.log('  Repayment Months:', loan.repaymentMonths);
        console.log('  Amount Repaid:', loan.amountRepaid.toString());
        console.log('  Outstanding Balance:', loan.outstandingBalance.toString());
        console.log('  Disbursement Date:', loan.disbursementDate);
      });
    } else {
      console.log('No loans found for this user');
    }

    // Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id }
    });

    console.log('\n=== WALLET ===');
    if (wallet) {
      console.log('Wallet ID:', wallet.id);
      console.log('Balance:', wallet.balance.toString());
      console.log('Auto Debit:', wallet.autoDebitEnabled);
    } else {
      console.log('No wallet found for this user');
    }

    // Get installments for active/disbursed loans
    const activeLoans = loans.filter(l => l.status === 'ACTIVE' || l.status === 'DISBURSED');
    if (activeLoans.length > 0) {
      console.log('\n=== INSTALLMENTS ===');
      for (const loan of activeLoans) {
        const installments = await prisma.installment.findMany({
          where: { loanId: loan.id },
          orderBy: { installmentNumber: 'asc' }
        });
        
        console.log(`\nLoan ${loan.loanNumber}:`);
        console.log('  Total installments:', installments.length);
        
        if (installments.length > 0) {
          installments.forEach((inst, idx) => {
            console.log(`  Installment ${idx + 1}:`);
            console.log('    Number:', inst.installmentNumber);
            console.log('    Amount:', inst.amount.toString());
            console.log('    Due Date:', inst.dueDate);
            console.log('    Status:', inst.status);
            console.log('    Paid Date:', inst.paidDate);
          });
        }
        
        const nextDue = installments.find(i => i.status === 'PENDING');
        if (nextDue) {
          console.log('\n  ✓ Next due installment:');
          console.log('    Number:', nextDue.installmentNumber);
          console.log('    Amount:', nextDue.amount.toString());
          console.log('    Due Date:', nextDue.dueDate);
        } else {
          console.log('\n  ⚠️  No pending installments found');
        }
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n✓ Database disconnected');
  }
}

debugDashboardStats();
