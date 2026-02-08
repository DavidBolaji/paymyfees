import { PrismaClient, UserRole, LoanStatus, ResidencyStatus, TransactionStatus, PaymentStatus, VerificationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper function to generate random dates
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to calculate loan details
function calculateLoanDetails(amount: number, interestRate: number, months: number) {
  const interest = (amount * interestRate * months) / (12 * 100);
  const totalAmount = amount + interest;
  const monthlyPayment = totalAmount / months;
  
  return {
    totalInterest: interest,
    totalAmount,
    monthlyPayment,
  };
}

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.payment.deleteMany();
  await prisma.installment.deleteMany();
  await prisma.disbursement.deleteMany();
  await prisma.loanStatusHistory.deleteMany();
  await prisma.schoolVerification.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationSettings.deleteMany();
  await prisma.document.deleteMany();
  await prisma.supportMessage.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.parentProfile.deleteMany();
  await prisma.schoolProfile.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Cleaned existing data\n');

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Create Admin User
  console.log('👤 Creating admin user...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@paymyfees.co',
      password: hashedPassword,
      role: UserRole.ADMIN,
      fullName: 'System Administrator',
      emailVerified: true,
      phoneVerified: true,
      phone: '+2348012345678',
      country: 'Nigeria',
      isFirstTime: false,
      notificationSettings: {
        create: {
          emailNotifications: true,
          inAppNotifications: true,
          walletFunding: true,
          loanApproval: true,
          repaymentReminders: true,
          verificationStatus: true,
          securityAlerts: true,
          promotions: false,
        },
      },
    },
  });
  console.log(`✅ Admin created: ${admin.email}\n`);

  // Create Schools
  console.log('🏫 Creating schools...');
  const schools = [];
  
  const schoolsData = [
    {
      name: 'University of Lagos',
      email: 'admin@unilag.edu.ng',
      phone: '+2348023456789',
      address: 'Akoka, Yaba',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      website: 'https://unilag.edu.ng',
      isVerified: true,
    },
    {
      name: 'Covenant University',
      email: 'registry@covenantuniversity.edu.ng',
      phone: '+2348034567890',
      address: 'Km 10 Idiroko Road, Canaan Land',
      city: 'Ota',
      state: 'Ogun',
      country: 'Nigeria',
      website: 'https://covenantuniversity.edu.ng',
      isVerified: true,
    },
    {
      name: 'Kings College Lagos',
      email: 'info@kingscollege.edu.ng',
      phone: '+2348045678901',
      address: 'Catholic Mission Street',
      city: 'Lagos Island',
      state: 'Lagos',
      country: 'Nigeria',
      website: 'https://kingscollege.edu.ng',
      isVerified: true,
    },
    {
      name: 'Harvard University',
      email: 'admissions@harvard.edu',
      phone: '+16174951000',
      address: 'Massachusetts Hall, Cambridge',
      city: 'Cambridge',
      state: 'Massachusetts',
      country: 'United States',
      website: 'https://harvard.edu',
      isVerified: true,
    },
    {
      name: 'University of Toronto',
      email: 'admissions@utoronto.ca',
      phone: '+14169782011',
      address: '27 Kings College Circle',
      city: 'Toronto',
      state: 'Ontario',
      country: 'Canada',
      website: 'https://utoronto.ca',
      isVerified: false,
    },
  ];

  for (const schoolData of schoolsData) {
    const school = await prisma.user.create({
      data: {
        email: schoolData.email,
        password: hashedPassword,
        role: UserRole.SCHOOL,
        fullName: schoolData.name,
        emailVerified: true,
        phoneVerified: true,
        phone: schoolData.phone,
        country: schoolData.country,
        isFirstTime: false,
        schoolProfile: {
          create: {
            isPrimary: true,
            schoolName: schoolData.name,
            schoolAddress: schoolData.address,
            city: schoolData.city,
            state: schoolData.state,
            country: schoolData.country,
            schoolEmail: schoolData.email,
            schoolPhone: schoolData.phone,
            website: schoolData.website,
            isVerified: schoolData.isVerified,
            verifiedAt: schoolData.isVerified ? new Date() : null,
            bankName: 'First Bank of Nigeria',
            accountNumber: `30${Math.floor(Math.random() * 100000000)}`,
            accountName: schoolData.name,
          },
        },
        notificationSettings: {
          create: {},
        },
      },
      include: { schoolProfile: true },
    });
    schools.push(school);
    console.log(`✅ School created: ${school.fullName}`);
  }
  console.log('');

  // Create Parent Users with different scenarios
  console.log('👨‍👩‍👧‍👦 Creating parent users...\n');

  // Scenario 1: Local parent with pending loan
  const parent1 = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      password: hashedPassword,
      role: UserRole.PARENT,
      fullName: 'John Doe',
      phone: '+2348056789012',
      emailVerified: true,
      phoneVerified: true,
      country: 'Nigeria',
      residencyStatus: ResidencyStatus.LOCAL,
      isFirstTime: false,
      parentProfile: {
        create: {
          dateOfBirth: new Date('1985-03-15'),
          address: '15 Admiralty Way',
          city: 'Lekki',
          state: 'Lagos',
          postalCode: '101245',
          country: 'Nigeria',
          language: 'English',
          bvn: '22345678901',
          nin: '12345678901',
          bvnVerified: true,
          ninVerified: true,
          employmentStatus: 'Employed',
          employerName: 'Tech Solutions Ltd',
          monthlyIncome: 500000,
          creditScore: 720,
        },
      },
      wallet: {
        create: {
          balance: 50000,
          currency: 'NGN',
        },
      },
      notificationSettings: {
        create: {},
      },
    },
    include: { parentProfile: true, wallet: true },
  });
  console.log(`✅ Parent created: ${parent1.fullName} (Local, Pending Loan)`);

  // Scenario 2: Local parent with active loan (making payments)
  const parent2 = await prisma.user.create({
    data: {
      email: 'sarah.williams@example.com',
      password: hashedPassword,
      role: UserRole.PARENT,
      fullName: 'Sarah Williams',
      phone: '+2348067890123',
      emailVerified: true,
      phoneVerified: true,
      country: 'Nigeria',
      residencyStatus: ResidencyStatus.LOCAL,
      isFirstTime: false,
      parentProfile: {
        create: {
          dateOfBirth: new Date('1988-07-22'),
          address: '42 Ogudu Road',
          city: 'Ojota',
          state: 'Lagos',
          postalCode: '100234',
          country: 'Nigeria',
          language: 'English',
          bvn: '22456789012',
          nin: '12456789012',
          bvnVerified: true,
          ninVerified: true,
          employmentStatus: 'Self-Employed',
          employerName: 'Williams Fashion House',
          monthlyIncome: 350000,
          creditScore: 680,
        },
      },
      wallet: {
        create: {
          balance: 120000,
          currency: 'NGN',
        },
      },
      notificationSettings: {
        create: {},
      },
    },
    include: { parentProfile: true, wallet: true },
  });
  console.log(`✅ Parent created: ${parent2.fullName} (Local, Active Loan)`);

  // Scenario 3: International parent with approved loan
  const parent3 = await prisma.user.create({
    data: {
      email: 'michael.chen@example.com',
      password: hashedPassword,
      role: UserRole.PARENT,
      fullName: 'Michael Chen',
      phone: '+14165551234',
      emailVerified: true,
      phoneVerified: true,
      country: 'Canada',
      residencyStatus: ResidencyStatus.INTERNATIONAL,
      isFirstTime: false,
      parentProfile: {
        create: {
          dateOfBirth: new Date('1982-11-08'),
          address: '123 Bay Street',
          city: 'Toronto',
          state: 'Ontario',
          postalCode: 'M5J 2R8',
          country: 'Canada',
          language: 'English',
          employmentStatus: 'Employed',
          employerName: 'Royal Bank of Canada',
          monthlyIncome: 8500, // CAD
          creditScore: 750,
        },
      },
      wallet: {
        create: {
          balance: 0,
          currency: 'NGN',
        },
      },
      notificationSettings: {
        create: {},
      },
    },
    include: { parentProfile: true, wallet: true },
  });
  console.log(`✅ Parent created: ${parent3.fullName} (International, Approved Loan)`);

  // Scenario 4: Local parent with completed loan
  const parent4 = await prisma.user.create({
    data: {
      email: 'ada.okafor@example.com',
      password: hashedPassword,
      role: UserRole.PARENT,
      fullName: 'Ada Okafor',
      phone: '+2348078901234',
      emailVerified: true,
      phoneVerified: true,
      country: 'Nigeria',
      residencyStatus: ResidencyStatus.LOCAL,
      isFirstTime: false,
      parentProfile: {
        create: {
          dateOfBirth: new Date('1990-05-18'),
          address: '78 Independence Layout',
          city: 'Enugu',
          state: 'Enugu',
          postalCode: '400001',
          country: 'Nigeria',
          language: 'English',
          bvn: '22567890123',
          nin: '12567890123',
          bvnVerified: true,
          ninVerified: true,
          employmentStatus: 'Employed',
          employerName: 'Nigerian Breweries',
          monthlyIncome: 450000,
          creditScore: 800,
          totalLoans: 1,
          completedLoans: 1,
        },
      },
      wallet: {
        create: {
          balance: 25000,
          currency: 'NGN',
        },
      },
      notificationSettings: {
        create: {},
      },
    },
    include: { parentProfile: true, wallet: true },
  });
  console.log(`✅ Parent created: ${parent4.fullName} (Local, Completed Loan)`);

  // Scenario 5: International parent with disbursed loan
  const parent5 = await prisma.user.create({
    data: {
      email: 'james.anderson@example.com',
      password: hashedPassword,
      role: UserRole.PARENT,
      fullName: 'James Anderson',
      phone: '+16175551234',
      emailVerified: true,
      phoneVerified: true,
      country: 'United States',
      residencyStatus: ResidencyStatus.INTERNATIONAL,
      isFirstTime: false,
      parentProfile: {
        create: {
          dateOfBirth: new Date('1980-09-25'),
          address: '456 Harvard Street',
          city: 'Cambridge',
          state: 'Massachusetts',
          postalCode: '02138',
          country: 'United States',
          language: 'English',
          employmentStatus: 'Employed',
          employerName: 'MIT Research Labs',
          monthlyIncome: 12000, // USD
          creditScore: 780,
        },
      },
      wallet: {
        create: {
          balance: 0,
          currency: 'NGN',
        },
      },
      notificationSettings: {
        create: {},
      },
    },
    include: { parentProfile: true, wallet: true },
  });
  console.log(`✅ Parent created: ${parent5.fullName} (International, Disbursed Loan)`);

  // Scenario 6: New local parent (first time user)
  const parent6 = await prisma.user.create({
    data: {
      email: 'chioma.nwosu@example.com',
      password: hashedPassword,
      role: UserRole.PARENT,
      fullName: 'Chioma Nwosu',
      phone: '+2348089012345',
      emailVerified: true,
      phoneVerified: false,
      country: 'Nigeria',
      residencyStatus: ResidencyStatus.LOCAL,
      isFirstTime: true,
      parentProfile: {
        create: {
          dateOfBirth: new Date('1992-12-10'),
          address: '23 Allen Avenue',
          city: 'Ikeja',
          state: 'Lagos',
          postalCode: '100271',
          country: 'Nigeria',
          language: 'English',
          bvn: '22678901234',
          bvnVerified: false,
          employmentStatus: 'Employed',
          employerName: 'Dangote Group',
          monthlyIncome: 380000,
        },
      },
      wallet: {
        create: {
          balance: 0,
          currency: 'NGN',
        },
      },
      notificationSettings: {
        create: {},
      },
    },
    include: { parentProfile: true, wallet: true },
  });
  console.log(`✅ Parent created: ${parent6.fullName} (New User, First Time)\n`);

  const parents = [parent1, parent2, parent3, parent4, parent5, parent6];

  // Create Loans with different statuses
  console.log('💰 Creating loans...\n');

  // Loan 1: Pending loan for parent1 (Local)
  const loanAmount1 = 250000;
  const interestRate1 = 5;
  const months1 = 6;
  const loanCalc1 = calculateLoanDetails(loanAmount1, interestRate1, months1);

  const loan1 = await prisma.loan.create({
    data: {
      loanNumber: `LN${Date.now()}001`,
      userId: parent1.id,
      //@ts-ignore
      schoolId: schools[0].schoolProfile![0].id,
      loanAmount: loanAmount1,
      interestRate: interestRate1,
      totalInterest: loanCalc1.totalInterest,
      totalAmount: loanCalc1.totalAmount,
      monthlyPayment: loanCalc1.monthlyPayment,
      repaymentMonths: months1,
      outstandingBalance: loanCalc1.totalAmount,
      //@ts-ignore
      schoolName: schools[0].fullName,
      academicSession: '2024/2025',
      term: 'First Term',
      residencyStatus: ResidencyStatus.LOCAL,
      status: LoanStatus.PENDING,
      applicationDate: new Date(),
    },
  });
  console.log(`✅ Loan created: ${loan1.loanNumber} - PENDING (${parent1.fullName})`);

  // Create school verification for loan1
  await prisma.schoolVerification.create({
    data: {
      loanId: loan1.id,
      //@ts-ignore
      schoolId: schools[0].schoolProfile![0].id,
      studentName: 'David Doe',
      studentClass: 'Year 1',
      invoiceAmount: loanAmount1,
      status: VerificationStatus.PENDING,
    },
  });

  // Loan 2: Active loan for parent2 (Local) - with installments and payments
  const loanAmount2 = 500000;
  const interestRate2 = 6;
  const months2 = 12;
  const loanCalc2 = calculateLoanDetails(loanAmount2, interestRate2, months2);

  const loan2 = await prisma.loan.create({
    data: {
      loanNumber: `LN${Date.now()}002`,
      userId: parent2.id,
      //@ts-ignore
      schoolId: schools[1].schoolProfile![0].id,
      loanAmount: loanAmount2,
      interestRate: interestRate2,
      totalInterest: loanCalc2.totalInterest,
      totalAmount: loanCalc2.totalAmount,
      monthlyPayment: loanCalc2.monthlyPayment,
      repaymentMonths: months2,
      outstandingBalance: loanCalc2.totalAmount - (loanCalc2.monthlyPayment * 3),
      amountRepaid: loanCalc2.monthlyPayment * 3,
      amountDisbursed: loanAmount2,
      //@ts-ignore
      schoolName: schools[1].fullName,
      academicSession: '2024/2025',
      term: 'First Term',
      residencyStatus: ResidencyStatus.LOCAL,
      status: LoanStatus.ACTIVE,
      applicationDate: randomDate(new Date(2024, 8, 1), new Date(2024, 9, 1)),
      approvalDate: randomDate(new Date(2024, 9, 1), new Date(2024, 9, 15)),
      disbursementDate: randomDate(new Date(2024, 9, 15), new Date(2024, 10, 1)),
      firstPaymentDate: new Date(2024, 10, 1),
      approvedBy: admin.id,
    },
  });
  console.log(`✅ Loan created: ${loan2.loanNumber} - ACTIVE (${parent2.fullName})`);

  // Create installments for loan2
  const startDate = new Date(2024, 10, 1);
  for (let i = 0; i < months2; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    
    const status = i < 3 ? PaymentStatus.PAID : PaymentStatus.PENDING;
    
    await prisma.installment.create({
      data: {
        loanId: loan2.id,
        installmentNumber: i + 1,
        amount: loanCalc2.monthlyPayment,
        dueDate,
        paidDate: i < 3 ? new Date(dueDate.getTime() - 86400000) : null,
        status,
      },
    });
  }

  // Create disbursement for loan2
  await prisma.disbursement.create({
    data: {
      disbursementReference: `DISB${Date.now()}002`,
      loanId: loan2.id,
      //@ts-ignore
      schoolId: schools[1].schoolProfile![0].id,
      amount: loanAmount2,
      status: TransactionStatus.COMPLETED,
      bankName: 'First Bank of Nigeria',
      //@ts-ignore
      accountNumber: schools[1].schoolProfile![0].accountNumber!,
      //@ts-ignore
      accountName: schools[1].schoolProfile![0].accountName!,
      disbursedAt: loan2.disbursementDate,
      confirmedAt: loan2.disbursementDate,
    },
  });

  // Loan 3: Approved international loan for parent3
  const loanAmount3 = 3500000; // ~$4,500 USD
  const interestRate3 = 7;
  const months3 = 9;
  const loanCalc3 = calculateLoanDetails(loanAmount3, interestRate3, months3);

  const loan3 = await prisma.loan.create({
    data: {
      loanNumber: `LN${Date.now()}003`,
      userId: parent3.id,
      //@ts-ignore
      schoolId: schools[4].schoolProfile![0].id,
      loanAmount: loanAmount3,
      interestRate: interestRate3,
      totalInterest: loanCalc3.totalInterest,
      totalAmount: loanCalc3.totalAmount,
      monthlyPayment: loanCalc3.monthlyPayment,
      repaymentMonths: months3,
      outstandingBalance: loanCalc3.totalAmount,
      //@ts-ignore
      schoolName: schools[4].fullName,
      academicSession: '2024/2025',
      residencyStatus: ResidencyStatus.INTERNATIONAL,
      countryOfStudy: 'Canada',
      programCourseOfStudy: 'Computer Science',
      employmentStatus: 'Employed',
      companyName: 'Royal Bank of Canada',
      jobTitleRole: 'Senior Analyst',
      monthlyNetIncome: 8500,
      paymentFrequency: 'Monthly',
      accountHolderName: 'Michael Chen',
      bankName: 'TD Bank',
      accountNumber: 'CA1234567890',
      countryOfBankAccount: 'Canada',
      status: LoanStatus.APPROVED,
      applicationDate: randomDate(new Date(2024, 10, 1), new Date(2024, 10, 15)),
      approvalDate: new Date(),
      approvedBy: admin.id,
    },
  });
  console.log(`✅ Loan created: ${loan3.loanNumber} - APPROVED (${parent3.fullName})`);

  // Loan 4: Completed loan for parent4 (Local)
  const loanAmount4 = 180000;
  const interestRate4 = 5;
  const months4 = 6;
  const loanCalc4 = calculateLoanDetails(loanAmount4, interestRate4, months4);

  const loan4 = await prisma.loan.create({
    data: {
      loanNumber: `LN${Date.now()}004`,
      userId: parent4.id,
      //@ts-ignore
      schoolId: schools[2].schoolProfile![0].id,
      loanAmount: loanAmount4,
      interestRate: interestRate4,
      totalInterest: loanCalc4.totalInterest,
      totalAmount: loanCalc4.totalAmount,
      monthlyPayment: loanCalc4.monthlyPayment,
      repaymentMonths: months4,
      outstandingBalance: 0,
      amountRepaid: loanCalc4.totalAmount,
      amountDisbursed: loanAmount4,
      //@ts-ignore
      schoolName: schools[2].fullName,
      academicSession: '2023/2024',
      term: 'Third Term',
      residencyStatus: ResidencyStatus.LOCAL,
      status: LoanStatus.COMPLETED,
      applicationDate: new Date(2024, 0, 15),
      approvalDate: new Date(2024, 1, 1),
      disbursementDate: new Date(2024, 1, 10),
      firstPaymentDate: new Date(2024, 2, 1),
      lastPaymentDate: new Date(2024, 7, 1),
      completionDate: new Date(2024, 7, 1),
      approvedBy: admin.id,
    },
  });
  console.log(`✅ Loan created: ${loan4.loanNumber} - COMPLETED (${parent4.fullName})`);

  // Create all installments as paid for loan4
  const loan4StartDate = new Date(2024, 2, 1);
  for (let i = 0; i < months4; i++) {
    const dueDate = new Date(loan4StartDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    
    await prisma.installment.create({
      data: {
        loanId: loan4.id,
        installmentNumber: i + 1,
        amount: loanCalc4.monthlyPayment,
        dueDate,
        paidDate: new Date(dueDate.getTime() - 86400000),
        status: PaymentStatus.PAID,
      },
    });
  }

  // Loan 5: Disbursed international loan for parent5
  const loanAmount5 = 5000000; // ~$6,000 USD
  const interestRate5 = 8;
  const months5 = 12;
  const loanCalc5 = calculateLoanDetails(loanAmount5, interestRate5, months5);

  const loan5 = await prisma.loan.create({
    data: {
      loanNumber: `LN${Date.now()}005`,
      userId: parent5.id,
      //@ts-ignore
      schoolId: schools[3].schoolProfile![0].id,
      loanAmount: loanAmount5,
      interestRate: interestRate5,
      totalInterest: loanCalc5.totalInterest,
      totalAmount: loanCalc5.totalAmount,
      monthlyPayment: loanCalc5.monthlyPayment,
      repaymentMonths: months5,
      outstandingBalance: loanCalc5.totalAmount,
      amountDisbursed: loanAmount5,
      //@ts-ignore
      schoolName: schools[3].fullName,
      academicSession: '2024/2025',
      residencyStatus: ResidencyStatus.INTERNATIONAL,
      countryOfStudy: 'United States',
      programCourseOfStudy: 'MBA',
      employmentStatus: 'Employed',
      companyName: 'MIT Research Labs',
      jobTitleRole: 'Research Scientist',
      monthlyNetIncome: 12000,
      paymentFrequency: 'Monthly',
      accountHolderName: 'James Anderson',
      bankName: 'Bank of America',
      accountNumber: 'US9876543210',
      countryOfBankAccount: 'United States',
      status: LoanStatus.DISBURSED,
      applicationDate: randomDate(new Date(2024, 9, 1), new Date(2024, 9, 15)),
      approvalDate: randomDate(new Date(2024, 9, 15), new Date(2024, 10, 1)),
      disbursementDate: new Date(2024, 10, 15),
      firstPaymentDate: new Date(2024, 11, 1),
      approvedBy: admin.id,
    },
  });
  console.log(`✅ Loan created: ${loan5.loanNumber} - DISBURSED (${parent5.fullName})`);

  // Create installments for loan5
  const loan5StartDate = new Date(2024, 11, 1);
  for (let i = 0; i < months5; i++) {
    const dueDate = new Date(loan5StartDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    
    await prisma.installment.create({
      data: {
        loanId: loan5.id,
        installmentNumber: i + 1,
        amount: loanCalc5.monthlyPayment,
        dueDate,
        status: PaymentStatus.PENDING,
      },
    });
  }

  // Create disbursement for loan5
  await prisma.disbursement.create({
    data: {
      disbursementReference: `DISB${Date.now()}005`,
      loanId: loan5.id,
      //@ts-ignore
      schoolId: schools[3].schoolProfile![0].id,
      amount: loanAmount5,
      status: TransactionStatus.COMPLETED,
      //@ts-ignore
      bankName: schools[3].schoolProfile![0].bankName!,
      //@ts-ignore
      accountNumber: schools[3].schoolProfile![0].accountNumber!,
      //@ts-ignore
      accountName: schools[3].schoolProfile![0].accountName!,
      disbursedAt: loan5.disbursementDate,
      confirmedAt: loan5.disbursementDate,
    },
  });

  console.log('');

  // Create wallet transactions
  console.log('💳 Creating wallet transactions...\n');

  // Wallet funding for parent2
  await prisma.transaction.create({
    data: {
      transactionReference: `TXN${Date.now()}001`,
      userId: parent2.id,
      walletId: parent2.wallet!.id,
      type: 'CREDIT',
      amount: 120000,
      balanceBefore: 0,
      balanceAfter: 120000,
      description: 'Wallet funding via Paystack',
      category: 'WALLET_FUNDING',
      status: TransactionStatus.COMPLETED,
      gatewayReference: `PAY${Date.now()}`,
    },
  });

  // Wallet funding for parent4
  await prisma.transaction.create({
    data: {
      transactionReference: `TXN${Date.now()}002`,
      userId: parent4.id,
      walletId: parent4.wallet!.id,
      type: 'CREDIT',
      amount: 25000,
      balanceBefore: 0,
      balanceAfter: 25000,
      description: 'Wallet funding via Paystack',
      category: 'WALLET_FUNDING',
      status: TransactionStatus.COMPLETED,
      gatewayReference: `PAY${Date.now()}`,
    },
  });

  console.log('✅ Wallet transactions created\n');

  // Create notifications
  console.log('🔔 Creating notifications...\n');

  const notificationData = [
    {
      userId: parent1.id,
      type: 'INFO',
      title: 'Loan Application Submitted',
      message: `Your loan application ${loan1.loanNumber} has been submitted successfully and is under review.`,
      isRead: false,
    },
    {
      userId: parent2.id,
      type: 'REMINDER',
      title: 'Payment Due Soon',
      message: `Your next installment payment of ₦${loanCalc2.monthlyPayment.toLocaleString()} is due in 5 days.`,
      isRead: false,
    },
    {
      userId: parent3.id,
      type: 'SUCCESS',
      title: 'Loan Approved!',
      message: `Congratulations! Your loan application ${loan3.loanNumber} has been approved.`,
      isRead: true,
    },
    {
      userId: parent4.id,
      type: 'SUCCESS',
      title: 'Loan Completed',
      message: `Congratulations! You have successfully completed your loan ${loan4.loanNumber}.`,
      isRead: true,
    },
    {
      userId: parent5.id,
      type: 'INFO',
      title: 'Funds Disbursed',
      //@ts-ignore
      message: `Your loan amount of ₦${loanAmount5.toLocaleString()} has been disbursed to ${schools[3].fullName}.`,
      isRead: false,
    },
  ];

  for (const notif of notificationData) {
    //@ts-ignore
    await prisma.notification.create({ data: notif });
  }

  console.log('✅ Notifications created\n');

  // Create support tickets
  console.log('🎫 Creating support tickets...\n');

  await prisma.supportTicket.create({
    data: {
      ticketNumber: `TKT${Date.now()}001`,
      userId: parent1.id,
      subject: 'Question about loan approval timeline',
      category: 'Loan Application',
      priority: 'MEDIUM',
      status: 'OPEN',
      description: 'How long does it typically take for a loan application to be reviewed and approved?',
      messages: {
        create: [
          {
            senderId: parent1.id,
            senderRole: UserRole.PARENT,
            message: 'How long does it typically take for a loan application to be reviewed and approved?',
          },
        ],
      },
    },
  });

  await prisma.supportTicket.create({
    data: {
      ticketNumber: `TKT${Date.now()}002`,
      userId: parent2.id,
      subject: 'Payment confirmation issue',
      category: 'Payments',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      description: 'I made a payment yesterday but it is not reflecting in my account.',
      assignedTo: admin.id,
      messages: {
        create: [
          {
            senderId: parent2.id,
            senderRole: UserRole.PARENT,
            message: 'I made a payment yesterday but it is not reflecting in my account.',
          },
          {
            senderId: admin.id,
            senderRole: UserRole.ADMIN,
            message: 'Thank you for reaching out. We are investigating this issue and will update you shortly.',
          },
        ],
      },
    },
  });

  await prisma.supportTicket.create({
    data: {
      ticketNumber: `TKT${Date.now()}003`,
      userId: parent4.id,
      subject: 'Request for loan completion certificate',
      category: 'Documentation',
      priority: 'LOW',
      status: 'RESOLVED',
      description: 'I have completed my loan repayment. Can I get a completion certificate?',
      assignedTo: admin.id,
      resolvedAt: new Date(),
      messages: {
        create: [
          {
            senderId: parent4.id,
            senderRole: UserRole.PARENT,
            message: 'I have completed my loan repayment. Can I get a completion certificate?',
          },
          {
            senderId: admin.id,
            senderRole: UserRole.ADMIN,
            message: 'Congratulations on completing your loan! Your certificate has been sent to your email.',
          },
        ],
      },
    },
  });

  console.log('✅ Support tickets created\n');

  // Summary
  console.log('📊 Seed Summary:\n');
  console.log(`✅ 1 Admin user`);
  //@ts-ignore
  console.log(`✅ ${schools.length} Schools (${schools.filter(s => s.schoolProfile![0].isVerified).length} verified)`);
  console.log(`✅ ${parents.length} Parents (${parents.filter(p => p.residencyStatus === ResidencyStatus.LOCAL).length} local, ${parents.filter(p => p.residencyStatus === ResidencyStatus.INTERNATIONAL).length} international)`);
  console.log(`✅ 5 Loans:`);
  console.log(`   - 1 PENDING`);
  console.log(`   - 1 ACTIVE (with payments)`);
  console.log(`   - 1 APPROVED`);
  console.log(`   - 1 COMPLETED`);
  console.log(`   - 1 DISBURSED`);
  console.log(`✅ Installments, Disbursements, Transactions`);
  console.log(`✅ 5 Notifications`);
  console.log(`✅ 3 Support Tickets\n`);

  console.log('🎉 Database seeded successfully!\n');
  console.log('📝 Login Credentials:');
  console.log('━'.repeat(50));
  console.log('Admin:');
  console.log(`  Email: admin@paymyfees.co`);
  console.log(`  Password: Password123!`);
  console.log('');
  console.log('Parents:');
  console.log(`  1. john.doe@example.com (Local, Pending Loan)`);
  console.log(`  2. sarah.williams@example.com (Local, Active Loan)`);
  console.log(`  3. michael.chen@example.com (International, Approved)`);
  console.log(`  4. ada.okafor@example.com (Local, Completed Loan)`);
  console.log(`  5. james.anderson@example.com (International, Disbursed)`);
  console.log(`  6. chioma.nwosu@example.com (New User)`);
  console.log(`  Password: Password123! (for all)`);
  console.log('');
  console.log('Schools:');
  schools.forEach((school, i) => {
    console.log(`  ${i + 1}. ${school.email}`);
  });
  console.log(`  Password: Password123! (for all)`);
  console.log('━'.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
