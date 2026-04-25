/**
 * Database Seed — PayMyFees
 * Covers: Admin, School Admin, Teacher Admin, Schools, Parents, Students, Teachers
 * All non-admin users are provisioned on Embedly (customer + wallet)
 * Password for every account: Test1234!
 */

import {
  PrismaClient,
  UserRole,
  LoanStatus,
  ResidencyStatus,
  TransactionStatus,
  PaymentStatus,
  VerificationStatus,
  TransactionType,
  NotificationType,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ── Inline Embedly client (avoids @/ alias issues in ts-node) ─────────────────
const EMBEDLY_BASE = process.env.EMBEDLY_ENV === 'production'
  ? 'https://waas-prod.embedly.ng/api/v1'
  : 'https://waas-staging.embedly.ng/api/v1';
const EMBEDLY_API_KEY = process.env.EMBEDLY_API_KEY || '';
const EMBEDLY_ORG_ID = process.env.EMBEDLY_ORG_ID || '';
const EMBEDLY_CURRENCY_ID = process.env.EMBEDLY_NGN_CURRENCY_ID || 'fd5e474d-bb42-4db1-ab74-e8d2a01047e9';
const EMBEDLY_CUSTOMER_TYPE_ID = process.env.EMBEDLY_CUSTOMER_TYPE_ID || 'f671da57-e281-4b40-965f-a96f4205405e';
const EMBEDLY_COUNTRY_ID = process.env.EMBEDLY_COUNTRY_ID || 'c15ad9ae-c4d7-4342-b70f-de5508627e3b';

async function embedlyRequest(method: string, path: string, body?: unknown) {
  const res = await fetch(`${EMBEDLY_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-api-key': EMBEDLY_API_KEY },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

function normalizeMobile(phone: string): string {
  const stripped = phone.replace(/^\+?234/, '');
  return stripped.startsWith('0') ? stripped : `0${stripped}`;
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 86_400_000);
}

function loanMath(principal: number, months: number) {
  const monthlyRate = 0.025; // 2.5% monthly
  const totalInterest = principal * monthlyRate * months;
  const totalAmount = principal + totalInterest;
  const monthlyPayment = totalAmount / months;
  return {
    interestRate: monthlyRate,
    totalInterest,
    totalAmount,
    monthlyPayment,
    outstandingBalance: totalAmount,
  };
}

// Second base URL used by the wallet list endpoint
const EMBEDLY_WAAS_BASE = process.env.EMBEDLY_ENV === 'production'
  ? 'https://waas-prod.embedly.ng/WaasCore/api/v1'
  : 'https://waas-staging.embedly.ng/WaasCore/api/v1';

async function embedlyWaasRequest(method: string, path: string, body?: unknown) {
  const res = await fetch(`${EMBEDLY_WAAS_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-api-key': EMBEDLY_API_KEY },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

/**
 * Fetch all customers from Embedly and build an email → customerId map.
 * Called once at the start of the seed so every user can do a fast lookup.
 */
async function buildEmbedlyCustomerMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const res = await embedlyRequest('GET', `/customers/get/all`);
    // Response shape: { data: [ { id, emailAddress, ... }, ... ] } or { data: { customers: [...] } }
    const list: any[] =
      Array.isArray(res?.data) ? res.data :
      Array.isArray(res?.data?.customers) ? res.data.customers :
      Array.isArray(res) ? res : [];

    for (const c of list) {
      const email: string = (c.emailAddress ?? c.email ?? '').toLowerCase();
      const id: string = c.id ?? c.customerId;
      if (email && id) map.set(email, id);
    }
    console.log(`   📋 Loaded ${map.size} existing Embedly customers`);
  } catch (err) {
    console.warn(`   ⚠️  Could not load Embedly customer list: ${err instanceof Error ? err.message : String(err)}`);
  }
  return map;
}

/**
 * Fetch wallet list for a customer using the WaasCore endpoint.
 * Returns the first wallet's details, or null if none found.
 */
async function lookupEmbedlyWallet(customerId: string): Promise<{
  embedlyWalletId: string;
  virtualAccountNumber: string;
  virtualAccountBank: string;
} | null> {
  try {
    const res = await embedlyWaasRequest('GET', `/wallets/get/list/${customerId}`);
    const list: any[] =
      Array.isArray(res?.data) ? res.data :
      Array.isArray(res?.data?.wallets) ? res.data.wallets :
      Array.isArray(res) ? res : [];

    const wallet = list[0];
    if (!wallet) return null;

    const walletId: string = wallet.walletId ?? wallet.id;
    const virtualAccount = wallet.virtualAccount ?? wallet.virtualAccountDetails ?? wallet;
    const accountNumber: string = virtualAccount?.accountNumber ?? wallet.accountNumber;
    const bankName: string = virtualAccount?.bankName ?? wallet.bankName ?? '';

    if (walletId && accountNumber) {
      return { embedlyWalletId: walletId, virtualAccountNumber: accountNumber, virtualAccountBank: bankName };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Provision Embedly customer + wallet for a user.
 * Uses a pre-built customerMap (email → customerId) to skip creation when
 * the customer already exists on Embedly. Then fetches wallet via WaasCore.
 * Non-fatal: logs warning and returns nulls on any failure.
 */
async function provisionEmbedly(
  user: { id: string; fullName: string; email: string; phone: string | null },
  customerMap: Map<string, string>
) {
  if (!EMBEDLY_API_KEY || !EMBEDLY_ORG_ID) {
    console.warn(`     ⚠️  Embedly env vars missing — skipping for ${user.email}`);
    return { embedlyCustomerId: null, virtualAccountNumber: null, virtualAccountBank: null, embedlyWalletId: null };
  }
  try {
    const parts = user.fullName.trim().split(' ');
    const firstName = parts[0] ?? user.fullName;
    const lastName = parts.slice(1).join(' ') || firstName;

    // ── Step 1: Get or create customer ───────────────────────────────────────
    let embedlyCustomerId: string | null = customerMap.get(user.email.toLowerCase()) ?? null;

    if (embedlyCustomerId) {
      console.log(`     ♻️  Reusing existing Embedly customer ${embedlyCustomerId} (${user.email})`);
    } else {
      const customerRes = await embedlyRequest('POST', '/customers/add', {
        organizationId: EMBEDLY_ORG_ID,
        firstName,
        lastName,
        middleName: firstName,
        emailAddress: user.email,
        mobileNumber: normalizeMobile(user.phone || '08000000000'),
        dob: '1990-01-01',
        customerTypeId: EMBEDLY_CUSTOMER_TYPE_ID,
        address: 'Nigeria',
        city: 'Lagos',
        countryId: EMBEDLY_COUNTRY_ID,
      });
      embedlyCustomerId = customerRes?.data?.id ?? null;
      if (!embedlyCustomerId) {
        throw new Error(`Customer creation failed: ${JSON.stringify(customerRes)}`);
      }
      console.log(`     ✨ Created new Embedly customer ${embedlyCustomerId} (${user.email})`);
    }

    await prisma.user.update({ where: { id: user.id }, data: { embedlyCustomerId } });

    // ── Step 2: Get or create wallet ─────────────────────────────────────────
    // First try to fetch existing wallet via WaasCore
    let walletDetails = await lookupEmbedlyWallet(embedlyCustomerId);

    if (!walletDetails) {
      // No wallet yet — create one
      const walletRes = await embedlyRequest('POST', '/wallets/add', {
        customerId: embedlyCustomerId,
        currencyId: EMBEDLY_CURRENCY_ID,
        name: `${user.fullName} Wallet`,
      });
      const wId = walletRes?.walletId ?? walletRes?.id ?? walletRes?.data?.id;
      const va = walletRes?.virtualAccount ?? walletRes?.data?.virtualAccount;
      if (wId && va?.accountNumber) {
        walletDetails = {
          embedlyWalletId: wId,
          virtualAccountNumber: va.accountNumber,
          virtualAccountBank: va.bankName ?? '',
        };
      } else {
        // Creation may have silently failed — try fetch again
        walletDetails = await lookupEmbedlyWallet(embedlyCustomerId);
      }
    }

    if (!walletDetails) {
      throw new Error(`Could not get wallet for customer ${embedlyCustomerId}`);
    }

    await prisma.wallet.update({
      where: { userId: user.id },
      data: {
        embedlyWalletId: walletDetails.embedlyWalletId,
        virtualAccountNumber: walletDetails.virtualAccountNumber,
        virtualAccountBank: walletDetails.virtualAccountBank,
      },
    });

    console.log(`     🏦 ${walletDetails.virtualAccountNumber} @ ${walletDetails.virtualAccountBank} (${user.email})`);
    return {
      embedlyCustomerId,
      virtualAccountNumber: walletDetails.virtualAccountNumber,
      virtualAccountBank: walletDetails.virtualAccountBank,
      embedlyWalletId: walletDetails.embedlyWalletId,
    };
  } catch (err) {
    console.warn(`     ⚠️  Embedly failed for ${user.email}: ${err instanceof Error ? err.message : String(err)}`);
    return { embedlyCustomerId: null, virtualAccountNumber: null, virtualAccountBank: null, embedlyWalletId: null };
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱 PayMyFees Database Seed\n');
  console.log('━'.repeat(60));

  // ── 1. Clear Database ───────────────────────────────────────────────────────
  console.log('\n🧹 Clearing database...');

  // Disable FK checks for clean wipe (MySQL)
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`;

  await prisma.paymentReminder.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.supportAttachment.deleteMany();
  await prisma.supportMessage.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.verificationLog.deleteMany();
  await prisma.schoolProfileVerificationLog.deleteMany();
  await prisma.schoolProfileVerification.deleteMany();
  await prisma.schoolVerification.deleteMany();
  await prisma.schoolFundingDetails.deleteMany();
  await prisma.loanStatusHistory.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.installment.deleteMany();
  await prisma.disbursement.deleteMany();
  await prisma.document.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationSettings.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.parentProfile.deleteMany();
  await prisma.schoolProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.emailLog.deleteMany();
  await prisma.smsLog.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.waitlist.deleteMany();
  await prisma.systemSetting.deleteMany();

  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`;

  console.log('✅ Database cleared\n');

  // Build Embedly customer map ONCE (email → customerId) before creating any users
  console.log('🔗 Loading existing Embedly customers...');
  const customerMap = await buildEmbedlyCustomerMap();
  console.log('');

  const PASSWORD = await bcrypt.hash('Test1234!', 10);

  // ── 2. Admin ────────────────────────────────────────────────────────────────
  console.log('👤 Creating Admin...');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@paymyfees.co',
      password: PASSWORD,
      role: UserRole.ADMIN,
      fullName: 'Super Admin',
      phone: '+2348000000001',
      emailVerified: true,
      phoneVerified: true,
      country: 'Nigeria',
      isFirstTime: false,
      notificationSettings: { create: {} },
    },
  });
  console.log(`   ✅ ${admin.email} (ADMIN — no Embedly wallet)\n`);

  // ── 3. School Admin ─────────────────────────────────────────────────────────
  console.log('🏢 Creating School Admin & Teacher Admin...');

  const schoolAdmin = await prisma.user.create({
    data: {
      email: 'schooladmin@paymyfees.co',
      password: PASSWORD,
      role: UserRole.SCHOOL_ADMIN,
      fullName: 'School Admin',
      phone: '+2348000000002',
      emailVerified: true,
      phoneVerified: true,
      country: 'Nigeria',
      isFirstTime: false,
      wallet: { create: { balance: 0, currency: 'NGN' } },
      notificationSettings: { create: {} },
    },
  });
  await provisionEmbedly({ id: schoolAdmin.id, fullName: schoolAdmin.fullName, email: schoolAdmin.email, phone: schoolAdmin.phone! }, customerMap);
  console.log(`   ✅ ${schoolAdmin.email} (SCHOOL_ADMIN)`);

  const teacherAdmin = await prisma.user.create({
    data: {
      email: 'teacheradmin@paymyfees.co',
      password: PASSWORD,
      role: UserRole.TEACHER_ADMIN,
      fullName: 'Teacher Admin',
      phone: '+2348000000003',
      emailVerified: true,
      phoneVerified: true,
      country: 'Nigeria',
      isFirstTime: false,
      wallet: { create: { balance: 0, currency: 'NGN' } },
      notificationSettings: { create: {} },
    },
  });
  await provisionEmbedly({ id: teacherAdmin.id, fullName: teacherAdmin.fullName, email: teacherAdmin.email, phone: teacherAdmin.phone! }, customerMap);
  console.log(`   ✅ ${teacherAdmin.email} (TEACHER_ADMIN)\n`);

  // ── 4. Schools ──────────────────────────────────────────────────────────────
  console.log('🏫 Creating Schools...');

  const schoolData = [
    {
      email: 'school1@paymyfees.co',
      name: 'University of Lagos',
      phone: '+2348011111001',
      address: 'Akoka, Yaba, Lagos',
      city: 'Lagos',
      state: 'Lagos',
      bankName: 'First Bank of Nigeria',
      accountNumber: '3012345601',
    },
    {
      email: 'school2@paymyfees.co',
      name: 'Covenant University',
      phone: '+2348011111002',
      address: 'Km 10 Idiroko Road, Canaan Land, Ota',
      city: 'Ota',
      state: 'Ogun',
      bankName: 'GTBank',
      accountNumber: '0123456702',
    },
    {
      email: 'school3@paymyfees.co',
      name: 'Kings College Lagos',
      phone: '+2348011111003',
      address: 'Catholic Mission Street, Lagos Island',
      city: 'Lagos Island',
      state: 'Lagos',
      bankName: 'Access Bank',
      accountNumber: '0098765403',
    },
  ];

  const schoolUsers: any[] = [];

  for (const s of schoolData) {
    const schoolUser = await prisma.user.create({
      data: {
        email: s.email,
        password: PASSWORD,
        role: UserRole.SCHOOL,
        fullName: s.name,
        phone: s.phone,
        emailVerified: true,
        phoneVerified: true,
        country: 'Nigeria',
        isFirstTime: false,
        schoolProfile: {
          create: {
            isPrimary: true,
            schoolName: s.name,
            schoolAddress: s.address,
            city: s.city,
            state: s.state,
            country: 'Nigeria',
            schoolEmail: s.email,
            schoolPhone: s.phone,
            bankName: s.bankName,
            accountNumber: s.accountNumber,
            accountName: s.name,
            isVerified: true,
            verifiedAt: daysAgo(30),
            academicLevel: 'Tertiary',
            currentAcademicSession: '2024/2025',
            totalStudents: Math.floor(Math.random() * 3000) + 500,
          },
        },
        wallet: { create: { balance: 0, currency: 'NGN' } },
        notificationSettings: { create: {} },
      },
      include: { schoolProfile: true },
    });
    await provisionEmbedly({ id: schoolUser.id, fullName: schoolUser.fullName, email: schoolUser.email, phone: schoolUser.phone! }, customerMap);
    schoolUsers.push(schoolUser);
    console.log(`   ✅ ${schoolUser.email} — ${s.name}`);
  }

  // Helper to get the SchoolProfile id for a school user
  const sp = (idx: number) => (schoolUsers[idx] as any).schoolProfile[0].id as string;

  console.log('');

  // ── 5. Parents ──────────────────────────────────────────────────────────────
  console.log('👨‍👩‍👧 Creating Parents (6 scenarios)...');

  // parent1 — Local, fresh application → loan is PENDING
  const parent1 = await prisma.user.create({
    data: {
      email: 'parent1@paymyfees.co',
      password: PASSWORD,
      role: UserRole.PARENT,
      fullName: 'John Adeyemi',
      phone: '+2348022221001',
      emailVerified: true,
      phoneVerified: true,
      country: 'Nigeria',
      residencyStatus: ResidencyStatus.LOCAL,
      isFirstTime: false,
      parentProfile: {
        create: {
          dateOfBirth: new Date('1985-03-15'),
          address: '15 Admiralty Way, Lekki Phase 1',
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria',
          bvn: '22100000001',
          nin: '12100000001',
          bvnVerified: true,
          ninVerified: true,
          employmentStatus: 'Employed',
          employerName: 'Dangote Group',
          monthlyIncome: 480000,
          creditScore: 710,
        },
      },
      wallet: { create: { balance: 5000, currency: 'NGN' } },
      notificationSettings: { create: {} },
    },
    include: { parentProfile: true, wallet: true },
  });
  await provisionEmbedly({ id: parent1.id, fullName: parent1.fullName, email: parent1.email, phone: parent1.phone! }, customerMap);
  console.log(`   ✅ ${parent1.email} — Local parent, PENDING loan`);

  // parent2 — Local, loan UNDER_REVIEW
  const parent2 = await prisma.user.create({
    data: {
      email: 'parent2@paymyfees.co',
      password: PASSWORD,
      role: UserRole.PARENT,
      fullName: 'Ngozi Okonkwo',
      phone: '+2348022221002',
      emailVerified: true,
      phoneVerified: true,
      country: 'Nigeria',
      residencyStatus: ResidencyStatus.LOCAL,
      isFirstTime: false,
      parentProfile: {
        create: {
          dateOfBirth: new Date('1979-08-20'),
          address: '42 Ogudu Road, Ojota',
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria',
          bvn: '22100000002',
          nin: '12100000002',
          bvnVerified: true,
          ninVerified: true,
          employmentStatus: 'Self-Employed',
          employerName: 'Okonkwo Trading',
          monthlyIncome: 320000,
          creditScore: 670,
        },
      },
      wallet: { create: { balance: 0, currency: 'NGN' } },
      notificationSettings: { create: {} },
    },
    include: { parentProfile: true, wallet: true },
  });
  await provisionEmbedly({ id: parent2.id, fullName: parent2.fullName, email: parent2.email, phone: parent2.phone! }, customerMap);
  console.log(`   ✅ ${parent2.email} — Local parent, UNDER_REVIEW loan`);

  // parent3 — Local, ACTIVE loan (3 of 6 installments paid)
  const parent3Math = loanMath(300000, 6);
  const parent3 = await prisma.user.create({
    data: {
      email: 'parent3@paymyfees.co',
      password: PASSWORD,
      role: UserRole.PARENT,
      fullName: 'Emeka Obi',
      phone: '+2348022221003',
      emailVerified: true,
      phoneVerified: true,
      country: 'Nigeria',
      residencyStatus: ResidencyStatus.LOCAL,
      isFirstTime: false,
      parentProfile: {
        create: {
          dateOfBirth: new Date('1983-11-30'),
          address: '8 Trans-Amadi Road, Port Harcourt',
          city: 'Port Harcourt',
          state: 'Rivers',
          country: 'Nigeria',
          bvn: '22100000003',
          nin: '12100000003',
          bvnVerified: true,
          ninVerified: true,
          employmentStatus: 'Employed',
          employerName: 'Shell Nigeria',
          monthlyIncome: 600000,
          creditScore: 740,
          activeLoans: 1,
          totalLoans: 1,
          totalBorrowed: 300000,
          totalRepaid: Math.floor(parent3Math.monthlyPayment * 3),
          outstandingBalance: Math.ceil(parent3Math.totalAmount - parent3Math.monthlyPayment * 3),
        },
      },
      // Give wallet enough balance to test 1 repayment
      wallet: { create: { balance: Math.ceil(parent3Math.monthlyPayment * 1.2), currency: 'NGN' } },
      notificationSettings: { create: {} },
    },
    include: { parentProfile: true, wallet: true },
  });
  await provisionEmbedly({ id: parent3.id, fullName: parent3.fullName, email: parent3.email, phone: parent3.phone! }, customerMap);
  console.log(`   ✅ ${parent3.email} — Local parent, ACTIVE loan (3/6 paid, wallet funded)`);

  // parent4 — Local, COMPLETED loan
  const parent4 = await prisma.user.create({
    data: {
      email: 'parent4@paymyfees.co',
      password: PASSWORD,
      role: UserRole.PARENT,
      fullName: 'Fatimah Bello',
      phone: '+2348022221004',
      emailVerified: true,
      phoneVerified: true,
      country: 'Nigeria',
      residencyStatus: ResidencyStatus.LOCAL,
      isFirstTime: false,
      parentProfile: {
        create: {
          dateOfBirth: new Date('1990-05-18'),
          address: '22 Ahmadu Bello Way, Kaduna',
          city: 'Kaduna',
          state: 'Kaduna',
          country: 'Nigeria',
          bvn: '22100000004',
          nin: '12100000004',
          bvnVerified: true,
          ninVerified: true,
          employmentStatus: 'Employed',
          employerName: 'Zenith Bank Plc',
          monthlyIncome: 420000,
          creditScore: 800,
          totalLoans: 1,
          completedLoans: 1,
        },
      },
      wallet: { create: { balance: 15000, currency: 'NGN' } },
      notificationSettings: { create: {} },
    },
    include: { parentProfile: true, wallet: true },
  });
  await provisionEmbedly({ id: parent4.id, fullName: parent4.fullName, email: parent4.email, phone: parent4.phone! }, customerMap);
  console.log(`   ✅ ${parent4.email} — Local parent, COMPLETED loan`);

  // parent5 — International, loan DISBURSED (first payments incoming)
  const parent5 = await prisma.user.create({
    data: {
      email: 'parent5@paymyfees.co',
      password: PASSWORD,
      role: UserRole.PARENT,
      fullName: 'Chidinma Eze',
      phone: '+2348022221005', // Nigerian number for Embedly
      emailVerified: true,
      phoneVerified: true,
      country: 'United Kingdom',
      residencyStatus: ResidencyStatus.INTERNATIONAL,
      isFirstTime: false,
      parentProfile: {
        create: {
          dateOfBirth: new Date('1978-02-14'),
          address: '10 Canary Wharf, London',
          city: 'London',
          state: 'England',
          country: 'United Kingdom',
          employmentStatus: 'Employed',
          employerName: 'HSBC Bank UK',
          monthlyIncome: 800000,
          creditScore: 760,
          activeLoans: 1,
          totalLoans: 1,
        },
      },
      wallet: { create: { balance: 0, currency: 'NGN' } },
      notificationSettings: { create: {} },
    },
    include: { parentProfile: true, wallet: true },
  });
  await provisionEmbedly({ id: parent5.id, fullName: parent5.fullName, email: parent5.email, phone: parent5.phone! }, customerMap);
  console.log(`   ✅ ${parent5.email} — International parent, DISBURSED loan`);

  // parent6 — Local, loan REJECTED
  const parent6 = await prisma.user.create({
    data: {
      email: 'parent6@paymyfees.co',
      password: PASSWORD,
      role: UserRole.PARENT,
      fullName: 'Tunde Lawal',
      phone: '+2348022221006',
      emailVerified: true,
      phoneVerified: true,
      country: 'Nigeria',
      residencyStatus: ResidencyStatus.LOCAL,
      isFirstTime: false,
      parentProfile: {
        create: {
          dateOfBirth: new Date('1988-09-12'),
          address: '5 Allen Avenue, Ikeja',
          city: 'Ikeja',
          state: 'Lagos',
          country: 'Nigeria',
          bvn: '22100000006',
          nin: '12100000006',
          bvnVerified: false,
          ninVerified: false,
          employmentStatus: 'Unemployed',
          creditScore: 450,
        },
      },
      wallet: { create: { balance: 0, currency: 'NGN' } },
      notificationSettings: { create: {} },
    },
    include: { parentProfile: true, wallet: true },
  });
  await provisionEmbedly({ id: parent6.id, fullName: parent6.fullName, email: parent6.email, phone: parent6.phone! }, customerMap);
  console.log(`   ✅ ${parent6.email} — Local parent, REJECTED loan\n`);

  // ── 6. Students ─────────────────────────────────────────────────────────────
  console.log('🎓 Creating Students (4 scenarios)...');

  // student1 — FIRST TIME LOGIN → residency modal will show
  const student1 = await prisma.user.create({
    data: {
      email: 'student1@paymyfees.co',
      password: PASSWORD,
      role: UserRole.STUDENT,
      fullName: 'Amara Osei',
      phone: '+2348033331001',
      emailVerified: true,
      phoneVerified: true,
      country: 'Nigeria',
      residencyStatus: ResidencyStatus.LOCAL, // default, modal will update
      isFirstTime: true, // ← triggers residency modal on login
      wallet: { create: { balance: 0, currency: 'NGN' } },
      notificationSettings: { create: {} },
    },
    include: { wallet: true },
  });
  await provisionEmbedly({ id: student1.id, fullName: student1.fullName, email: student1.email, phone: student1.phone! }, customerMap);
  console.log(`   ✅ ${student1.email} — FIRST TIME (modal will show on login)`);

  // student2 — Local student, no loan yet (can apply fresh)
  const student2 = await prisma.user.create({
    data: {
      email: 'student2@paymyfees.co',
      password: PASSWORD,
      role: UserRole.STUDENT,
      fullName: 'Kelechi Nnaji',
      phone: '+2348033331002',
      emailVerified: true,
      phoneVerified: true,
      country: 'Nigeria',
      residencyStatus: ResidencyStatus.LOCAL,
      isFirstTime: false,
      wallet: { create: { balance: 10000, currency: 'NGN' } },
      notificationSettings: { create: {} },
    },
    include: { wallet: true },
  });
  await provisionEmbedly({ id: student2.id, fullName: student2.fullName, email: student2.email, phone: student2.phone! }, customerMap);
  console.log(`   ✅ ${student2.email} — Local student (can apply for loan)`);

  // student3 — International student, no loan yet
  const student3 = await prisma.user.create({
    data: {
      email: 'student3@paymyfees.co',
      password: PASSWORD,
      role: UserRole.STUDENT,
      fullName: 'Adaeze Muonagor',
      phone: '+2348033331003',
      emailVerified: true,
      phoneVerified: true,
      country: 'Canada',
      residencyStatus: ResidencyStatus.INTERNATIONAL,
      isFirstTime: false,
      wallet: { create: { balance: 0, currency: 'NGN' } },
      notificationSettings: { create: {} },
    },
    include: { wallet: true },
  });
  await provisionEmbedly({ id: student3.id, fullName: student3.fullName, email: student3.email, phone: student3.phone! }, customerMap);
  console.log(`   ✅ ${student3.email} — International student (sees int. loan form)`);

  // student4 — Local, ACTIVE loan (can test repayment)
  const student4Math = loanMath(200000, 6);
  const student4 = await prisma.user.create({
    data: {
      email: 'student4@paymyfees.co',
      password: PASSWORD,
      role: UserRole.STUDENT,
      fullName: 'Tobenna Ike',
      phone: '+2348033331004',
      emailVerified: true,
      phoneVerified: true,
      country: 'Nigeria',
      residencyStatus: ResidencyStatus.LOCAL,
      isFirstTime: false,
      wallet: {
        create: {
          balance: Math.ceil(student4Math.monthlyPayment * 1.5), // enough for 1 repayment
          currency: 'NGN',
        },
      },
      notificationSettings: { create: {} },
    },
    include: { wallet: true },
  });
  await provisionEmbedly({ id: student4.id, fullName: student4.fullName, email: student4.email, phone: student4.phone! }, customerMap);
  console.log(`   ✅ ${student4.email} — Local student, ACTIVE loan (wallet funded for repayment test)\n`);

  // ── 7. Teachers ─────────────────────────────────────────────────────────────
  console.log('👩‍🏫 Creating Teachers (3 scenarios)...');

  // teacher1 — Brand new, first login (no loan)
  const teacher1 = await prisma.user.create({
    data: {
      email: 'teacher1@paymyfees.co',
      password: PASSWORD,
      role: UserRole.TEACHER,
      fullName: 'Blessing Okafor',
      phone: '+2348044441001',
      emailVerified: true,
      phoneVerified: true,
      country: 'Nigeria',
      isFirstTime: false,
      teacherProfile: {
        create: {
          schoolName: 'Kings College Lagos',
          schoolEmail: 'school3@paymyfees.co',
          subject: 'Mathematics',
          employmentStatus: 'Full-time',
          staffId: 'KCL-TCH-001',
        },
      },
      wallet: { create: { balance: 0, currency: 'NGN' } },
      notificationSettings: { create: {} },
    },
    include: { teacherProfile: true, wallet: true },
  });
  await provisionEmbedly({ id: teacher1.id, fullName: teacher1.fullName, email: teacher1.email, phone: teacher1.phone! }, customerMap);
  console.log(`   ✅ ${teacher1.email} — New teacher (no loan, testing apply form)`);

  // teacher2 — PENDING teacher loan application
  const teacher2 = await prisma.user.create({
    data: {
      email: 'teacher2@paymyfees.co',
      password: PASSWORD,
      role: UserRole.TEACHER,
      fullName: 'Rafiu Salami',
      phone: '+2348044441002',
      emailVerified: true,
      phoneVerified: true,
      country: 'Nigeria',
      isFirstTime: false,
      teacherProfile: {
        create: {
          schoolName: 'Covenant University',
          schoolEmail: 'school2@paymyfees.co',
          schoolAddress: 'Km 10 Idiroko Road, Canaan Land, Ota',
          registrationNumber: 'CAC-CU-2001',
          subject: 'Chemistry',
          employmentStatus: 'Full-time',
          staffId: 'CU-TCH-042',
        },
      },
      wallet: { create: { balance: 0, currency: 'NGN' } },
      notificationSettings: { create: {} },
    },
    include: { teacherProfile: true, wallet: true },
  });
  await provisionEmbedly({ id: teacher2.id, fullName: teacher2.fullName, email: teacher2.email, phone: teacher2.phone! }, customerMap);
  console.log(`   ✅ ${teacher2.email} — Teacher with PENDING loan`);

  // teacher3 — ACTIVE teacher loan (can test repayment)
  const teacher3Math = loanMath(150000, 6);
  const teacher3 = await prisma.user.create({
    data: {
      email: 'teacher3@paymyfees.co',
      password: PASSWORD,
      role: UserRole.TEACHER,
      fullName: 'Chinwe Uzoma',
      phone: '+2348044441003',
      emailVerified: true,
      phoneVerified: true,
      country: 'Nigeria',
      isFirstTime: false,
      teacherProfile: {
        create: {
          schoolName: 'University of Lagos',
          schoolEmail: 'school1@paymyfees.co',
          schoolAddress: 'Akoka, Yaba, Lagos',
          registrationNumber: 'CAC-UNILAG-1962',
          subject: 'English Language',
          employmentStatus: 'Full-time',
          staffId: 'UL-TCH-117',
        },
      },
      wallet: {
        create: {
          balance: Math.ceil(teacher3Math.monthlyPayment * 1.5),
          currency: 'NGN',
        },
      },
      notificationSettings: { create: {} },
    },
    include: { teacherProfile: true, wallet: true },
  });
  await provisionEmbedly({ id: teacher3.id, fullName: teacher3.fullName, email: teacher3.email, phone: teacher3.phone! }, customerMap);
  console.log(`   ✅ ${teacher3.email} — Teacher with ACTIVE loan (wallet funded)\n`);

  // ── 8. Loans ─────────────────────────────────────────────────────────────────
  console.log('💰 Creating Loans...');

  const loanCounter = { n: 1 };
  function loanNumber() {
    return `PMF-2025-${String(loanCounter.n++).padStart(4, '0')}`;
  }

  // ── Loan A: parent1 → PENDING ──────────────────────────────────────────────
  const loanA_amount = 250000;
  const loanA_months = 6;
  const loanA = loanMath(loanA_amount, loanA_months);
  const loanARecord = await prisma.loan.create({
    data: {
      loanNumber: loanNumber(),
      userId: parent1.id,
      schoolId: sp(0), // University of Lagos
      schoolName: schoolUsers[0].fullName,
      loanAmount: loanA_amount,
      interestRate: loanA.interestRate,
      totalInterest: loanA.totalInterest,
      totalAmount: loanA.totalAmount,
      monthlyPayment: loanA.monthlyPayment,
      repaymentMonths: loanA_months,
      outstandingBalance: loanA.totalAmount,
      academicSession: '2024/2025',
      term: 'First Term',
      residencyStatus: ResidencyStatus.LOCAL,
      status: LoanStatus.PENDING,
      applicationDate: daysAgo(2),
      notes: 'UNILAG 100L tuition 2024/2025',
    },
  });
  // School verification request
  await prisma.schoolVerification.create({
    data: {
      loanId: loanARecord.id,
      schoolId: sp(0),
      studentName: 'Daniel Adeyemi',
      studentClass: '100 Level',
      invoiceAmount: loanA_amount,
      status: VerificationStatus.PENDING,
    },
  });
  await prisma.loanStatusHistory.create({
    data: { loanId: loanARecord.id, newStatus: LoanStatus.PENDING, reason: 'Application submitted by parent' },
  });
  await prisma.notification.create({
    data: {
      userId: parent1.id,
      type: NotificationType.INFO,
      title: 'Loan Application Submitted',
      message: `Your loan application ${loanARecord.loanNumber} is under review. We'll notify you within 24–48 hours.`,
    },
  });
  console.log(`   ✅ ${loanARecord.loanNumber} — PENDING (${parent1.fullName})`);

  // ── Loan B: parent2 → UNDER_REVIEW ────────────────────────────────────────
  const loanB_amount = 180000;
  const loanB_months = 6;
  const loanB = loanMath(loanB_amount, loanB_months);
  const loanBRecord = await prisma.loan.create({
    data: {
      loanNumber: loanNumber(),
      userId: parent2.id,
      schoolId: sp(2), // Kings College
      schoolName: schoolUsers[2].fullName,
      loanAmount: loanB_amount,
      interestRate: loanB.interestRate,
      totalInterest: loanB.totalInterest,
      totalAmount: loanB.totalAmount,
      monthlyPayment: loanB.monthlyPayment,
      repaymentMonths: loanB_months,
      outstandingBalance: loanB.totalAmount,
      academicSession: '2024/2025',
      term: 'First Term',
      residencyStatus: ResidencyStatus.LOCAL,
      status: LoanStatus.UNDER_REVIEW,
      applicationDate: daysAgo(7),
    },
  });
  await prisma.schoolVerification.create({
    data: {
      loanId: loanBRecord.id,
      schoolId: sp(2),
      studentName: 'Emeka Okonkwo',
      studentClass: 'SS2',
      invoiceAmount: loanB_amount,
      status: VerificationStatus.VERIFIED,
      enrollmentConfirmed: true,
      invoiceConfirmed: true,
      respondedAt: daysAgo(4),
    },
  });
  await prisma.loanStatusHistory.createMany({
    data: [
      { loanId: loanBRecord.id, newStatus: LoanStatus.PENDING, reason: 'Application submitted' },
      { loanId: loanBRecord.id, previousStatus: LoanStatus.PENDING, newStatus: LoanStatus.UNDER_REVIEW, changedBy: admin.id, reason: 'Documents verified, under final review' },
    ],
  });
  await prisma.notification.create({
    data: {
      userId: parent2.id,
      type: NotificationType.INFO,
      title: 'Loan Under Review',
      message: `Your loan application ${loanBRecord.loanNumber} is now under review by our team.`,
    },
  });
  console.log(`   ✅ ${loanBRecord.loanNumber} — UNDER_REVIEW (${parent2.fullName})`);

  // ── Loan C: parent3 → ACTIVE (3/6 paid) ────────────────────────────────────
  const loanC_amount = 300000;
  const loanC_months = 6;
  const loanC = loanMath(loanC_amount, loanC_months);
  const loanC_paidCount = 3;
  const loanC_amountRepaid = Math.round(loanC.monthlyPayment * loanC_paidCount);
  const loanC_outstanding = Math.round(loanC.totalAmount - loanC_amountRepaid);

  const loanCRecord = await prisma.loan.create({
    data: {
      loanNumber: loanNumber(),
      userId: parent3.id,
      schoolId: sp(1), // Covenant
      schoolName: schoolUsers[1].fullName,
      loanAmount: loanC_amount,
      interestRate: loanC.interestRate,
      totalInterest: loanC.totalInterest,
      totalAmount: loanC.totalAmount,
      monthlyPayment: loanC.monthlyPayment,
      repaymentMonths: loanC_months,
      outstandingBalance: loanC_outstanding,
      amountRepaid: loanC_amountRepaid,
      amountDisbursed: loanC_amount,
      academicSession: '2024/2025',
      term: 'Second Term',
      residencyStatus: ResidencyStatus.LOCAL,
      status: LoanStatus.ACTIVE,
      applicationDate: daysAgo(120),
      approvalDate: daysAgo(110),
      disbursementDate: daysAgo(100),
      firstPaymentDate: daysAgo(70),
      approvedBy: admin.id,
    },
  });
  // Installments: 3 PAID, 3 PENDING
  const loanC_startDate = daysAgo(70);
  for (let i = 0; i < loanC_months; i++) {
    const dueDate = addMonths(loanC_startDate, i);
    const isPaid = i < loanC_paidCount;
    await prisma.installment.create({
      data: {
        loanId: loanCRecord.id,
        installmentNumber: i + 1,
        amount: loanC.monthlyPayment,
        dueDate,
        paidDate: isPaid ? new Date(dueDate.getTime() - 86_400_000) : null,
        status: isPaid ? PaymentStatus.PAID : PaymentStatus.PENDING,
      },
    });
  }
  // Disbursement record
  await prisma.disbursement.create({
    data: {
      disbursementReference: `DISB-${loanCRecord.loanNumber}`,
      loanId: loanCRecord.id,
      schoolId: sp(1),
      amount: loanC_amount,
      status: TransactionStatus.COMPLETED,
      bankName: 'GTBank',
      accountNumber: '0123456702',
      accountName: schoolUsers[1].fullName,
      disbursedAt: daysAgo(100),
      confirmedAt: daysAgo(100),
    },
  });
  // Wallet transaction for funding
  await prisma.transaction.create({
    data: {
      transactionReference: `FUND-${loanCRecord.loanNumber}-01`,
      userId: parent3.id,
      walletId: parent3.wallet!.id,
      type: TransactionType.CREDIT,
      amount: loanC.monthlyPayment * 2,
      balanceBefore: 0,
      balanceAfter: loanC.monthlyPayment * 2,
      description: 'Wallet funding via bank transfer',
      category: 'WALLET_FUNDING',
      status: TransactionStatus.COMPLETED,
    },
  });
  await prisma.loanStatusHistory.createMany({
    data: [
      { loanId: loanCRecord.id, newStatus: LoanStatus.PENDING },
      { loanId: loanCRecord.id, previousStatus: LoanStatus.PENDING, newStatus: LoanStatus.UNDER_REVIEW, changedBy: admin.id },
      { loanId: loanCRecord.id, previousStatus: LoanStatus.UNDER_REVIEW, newStatus: LoanStatus.APPROVED, changedBy: admin.id },
      { loanId: loanCRecord.id, previousStatus: LoanStatus.APPROVED, newStatus: LoanStatus.DISBURSED, changedBy: admin.id },
      { loanId: loanCRecord.id, previousStatus: LoanStatus.DISBURSED, newStatus: LoanStatus.ACTIVE, changedBy: admin.id },
    ],
  });
  await prisma.notification.create({
    data: {
      userId: parent3.id,
      type: NotificationType.REMINDER,
      title: 'Next Installment Due Soon',
      message: `Installment #${loanC_paidCount + 1} of ₦${Math.round(loanC.monthlyPayment).toLocaleString()} is due in 5 days.`,
    },
  });
  console.log(`   ✅ ${loanCRecord.loanNumber} — ACTIVE 3/6 paid (${parent3.fullName}) — fund wallet via virtual acct to test repayment`);

  // ── Loan D: parent4 → COMPLETED ────────────────────────────────────────────
  const loanD_amount = 120000;
  const loanD_months = 4;
  const loanD = loanMath(loanD_amount, loanD_months);

  const loanDRecord = await prisma.loan.create({
    data: {
      loanNumber: loanNumber(),
      userId: parent4.id,
      schoolId: sp(2), // Kings College
      schoolName: schoolUsers[2].fullName,
      loanAmount: loanD_amount,
      interestRate: loanD.interestRate,
      totalInterest: loanD.totalInterest,
      totalAmount: loanD.totalAmount,
      monthlyPayment: loanD.monthlyPayment,
      repaymentMonths: loanD_months,
      outstandingBalance: 0,
      amountRepaid: loanD.totalAmount,
      amountDisbursed: loanD_amount,
      academicSession: '2023/2024',
      term: 'Third Term',
      residencyStatus: ResidencyStatus.LOCAL,
      status: LoanStatus.COMPLETED,
      applicationDate: daysAgo(300),
      approvalDate: daysAgo(290),
      disbursementDate: daysAgo(280),
      firstPaymentDate: daysAgo(250),
      lastPaymentDate: daysAgo(130),
      completionDate: daysAgo(130),
      approvedBy: admin.id,
    },
  });
  const loanD_startDate = daysAgo(250);
  for (let i = 0; i < loanD_months; i++) {
    const dueDate = addMonths(loanD_startDate, i);
    await prisma.installment.create({
      data: {
        loanId: loanDRecord.id,
        installmentNumber: i + 1,
        amount: loanD.monthlyPayment,
        dueDate,
        paidDate: new Date(dueDate.getTime() - 86_400_000),
        status: PaymentStatus.PAID,
      },
    });
  }
  await prisma.disbursement.create({
    data: {
      disbursementReference: `DISB-${loanDRecord.loanNumber}`,
      loanId: loanDRecord.id,
      schoolId: sp(2),
      amount: loanD_amount,
      status: TransactionStatus.COMPLETED,
      bankName: 'Access Bank',
      accountNumber: '0098765403',
      accountName: schoolUsers[2].fullName,
      disbursedAt: daysAgo(280),
      confirmedAt: daysAgo(280),
    },
  });
  await prisma.notification.create({
    data: {
      userId: parent4.id,
      type: NotificationType.SUCCESS,
      title: 'Loan Fully Repaid 🎉',
      message: `Congratulations! You have fully repaid loan ${loanDRecord.loanNumber}. You are now eligible for a new loan.`,
      isRead: true,
    },
  });
  console.log(`   ✅ ${loanDRecord.loanNumber} — COMPLETED (${parent4.fullName})`);

  // ── Loan E: parent5 → DISBURSED (International, installments pending) ──────
  const loanE_amount = 2800000;
  const loanE_months = 12;
  const loanE = loanMath(loanE_amount, loanE_months);

  const loanERecord = await prisma.loan.create({
    data: {
      loanNumber: loanNumber(),
      userId: parent5.id,
      schoolId: sp(0), // University of Lagos
      schoolName: schoolUsers[0].fullName,
      loanAmount: loanE_amount,
      interestRate: loanE.interestRate,
      totalInterest: loanE.totalInterest,
      totalAmount: loanE.totalAmount,
      monthlyPayment: loanE.monthlyPayment,
      repaymentMonths: loanE_months,
      outstandingBalance: loanE.totalAmount,
      amountDisbursed: loanE_amount,
      academicSession: '2024/2025',
      residencyStatus: ResidencyStatus.INTERNATIONAL,
      countryOfStudy: 'United Kingdom',
      programCourseOfStudy: 'Computer Science',
      employmentStatus: 'Employed',
      companyName: 'HSBC Bank UK',
      jobTitleRole: 'Senior Analyst',
      monthlyNetIncome: 800000,
      paymentFrequency: 'Monthly',
      accountHolderName: 'Chidinma Eze',
      bankName: 'HSBC UK',
      accountNumber: 'GB12HSBC12345698765432',
      countryOfBankAccount: 'United Kingdom',
      status: LoanStatus.DISBURSED,
      applicationDate: daysAgo(40),
      approvalDate: daysAgo(30),
      disbursementDate: daysAgo(15),
      firstPaymentDate: addMonths(new Date(), 1),
      approvedBy: admin.id,
    },
  });
  const loanE_startDate = addMonths(new Date(), 1);
  for (let i = 0; i < loanE_months; i++) {
    await prisma.installment.create({
      data: {
        loanId: loanERecord.id,
        installmentNumber: i + 1,
        amount: loanE.monthlyPayment,
        dueDate: addMonths(loanE_startDate, i),
        status: PaymentStatus.PENDING,
      },
    });
  }
  await prisma.disbursement.create({
    data: {
      disbursementReference: `DISB-${loanERecord.loanNumber}`,
      loanId: loanERecord.id,
      schoolId: sp(0),
      amount: loanE_amount,
      status: TransactionStatus.COMPLETED,
      bankName: 'First Bank of Nigeria',
      accountNumber: '3012345601',
      accountName: schoolUsers[0].fullName,
      disbursedAt: daysAgo(15),
      confirmedAt: daysAgo(15),
    },
  });
  await prisma.notification.create({
    data: {
      userId: parent5.id,
      type: NotificationType.SUCCESS,
      title: 'Loan Disbursed',
      message: `₦${loanE_amount.toLocaleString()} has been disbursed to ${schoolUsers[0].fullName}. Your first repayment is due next month.`,
    },
  });
  console.log(`   ✅ ${loanERecord.loanNumber} — DISBURSED International (${parent5.fullName})`);

  // ── Loan F: parent6 → REJECTED ─────────────────────────────────────────────
  const loanF_amount = 150000;
  const loanF_months = 4;
  const loanF = loanMath(loanF_amount, loanF_months);

  const loanFRecord = await prisma.loan.create({
    data: {
      loanNumber: loanNumber(),
      userId: parent6.id,
      schoolId: sp(2),
      schoolName: schoolUsers[2].fullName,
      loanAmount: loanF_amount,
      interestRate: loanF.interestRate,
      totalInterest: loanF.totalInterest,
      totalAmount: loanF.totalAmount,
      monthlyPayment: loanF.monthlyPayment,
      repaymentMonths: loanF_months,
      outstandingBalance: loanF.totalAmount,
      academicSession: '2024/2025',
      term: 'First Term',
      residencyStatus: ResidencyStatus.LOCAL,
      status: LoanStatus.REJECTED,
      applicationDate: daysAgo(20),
      rejectionReason: 'Insufficient credit score and unverified identity documents. Please verify your BVN and NIN then reapply.',
    },
  });
  await prisma.loanStatusHistory.createMany({
    data: [
      { loanId: loanFRecord.id, newStatus: LoanStatus.PENDING },
      { loanId: loanFRecord.id, previousStatus: LoanStatus.PENDING, newStatus: LoanStatus.UNDER_REVIEW, changedBy: admin.id },
      { loanId: loanFRecord.id, previousStatus: LoanStatus.UNDER_REVIEW, newStatus: LoanStatus.REJECTED, changedBy: admin.id, reason: 'Insufficient credit score and unverified identity documents.' },
    ],
  });
  await prisma.notification.create({
    data: {
      userId: parent6.id,
      type: NotificationType.WARNING,
      title: 'Loan Application Rejected',
      message: 'Your loan application was not approved. Please verify your identity documents and reapply.',
    },
  });
  console.log(`   ✅ ${loanFRecord.loanNumber} — REJECTED (${parent6.fullName})`);

  // ── Loan G: student4 → ACTIVE (2/6 paid, can test repayment) ───────────────
  const loanG_amount = 200000;
  const loanG_months = 6;
  const loanG = loanMath(loanG_amount, loanG_months);
  const loanG_paidCount = 2;
  const loanG_amountRepaid = Math.round(loanG.monthlyPayment * loanG_paidCount);
  const loanG_outstanding = Math.round(loanG.totalAmount - loanG_amountRepaid);

  const loanGRecord = await prisma.loan.create({
    data: {
      loanNumber: loanNumber(),
      userId: student4.id,
      schoolId: sp(0), // University of Lagos
      schoolName: schoolUsers[0].fullName,
      loanAmount: loanG_amount,
      interestRate: loanG.interestRate,
      totalInterest: loanG.totalInterest,
      totalAmount: loanG.totalAmount,
      monthlyPayment: loanG.monthlyPayment,
      repaymentMonths: loanG_months,
      outstandingBalance: loanG_outstanding,
      amountRepaid: loanG_amountRepaid,
      amountDisbursed: loanG_amount,
      academicSession: '2024/2025',
      term: 'Second Term',
      residencyStatus: ResidencyStatus.LOCAL,
      status: LoanStatus.ACTIVE,
      applicationDate: daysAgo(90),
      approvalDate: daysAgo(80),
      disbursementDate: daysAgo(70),
      firstPaymentDate: daysAgo(40),
      approvedBy: admin.id,
    },
  });
  const loanG_startDate = daysAgo(40);
  for (let i = 0; i < loanG_months; i++) {
    const dueDate = addMonths(loanG_startDate, i);
    const isPaid = i < loanG_paidCount;
    await prisma.installment.create({
      data: {
        loanId: loanGRecord.id,
        installmentNumber: i + 1,
        amount: loanG.monthlyPayment,
        dueDate,
        paidDate: isPaid ? new Date(dueDate.getTime() - 86_400_000) : null,
        status: isPaid ? PaymentStatus.PAID : PaymentStatus.PENDING,
      },
    });
  }
  await prisma.disbursement.create({
    data: {
      disbursementReference: `DISB-${loanGRecord.loanNumber}`,
      loanId: loanGRecord.id,
      schoolId: sp(0),
      amount: loanG_amount,
      status: TransactionStatus.COMPLETED,
      bankName: 'First Bank of Nigeria',
      accountNumber: '3012345601',
      accountName: schoolUsers[0].fullName,
      disbursedAt: daysAgo(70),
      confirmedAt: daysAgo(70),
    },
  });
  // Wallet funding transaction
  await prisma.transaction.create({
    data: {
      transactionReference: `FUND-${loanGRecord.loanNumber}-01`,
      userId: student4.id,
      walletId: student4.wallet!.id,
      type: TransactionType.CREDIT,
      amount: loanG.monthlyPayment * 2,
      balanceBefore: 0,
      balanceAfter: loanG.monthlyPayment * 2,
      description: 'Wallet funding via bank transfer',
      category: 'WALLET_FUNDING',
      status: TransactionStatus.COMPLETED,
    },
  });
  await prisma.notification.create({
    data: {
      userId: student4.id,
      type: NotificationType.REMINDER,
      title: 'Next Installment Due',
      message: `Installment #${loanG_paidCount + 1} of ₦${Math.round(loanG.monthlyPayment).toLocaleString()} is due soon. Fund your wallet to make the payment.`,
    },
  });
  console.log(`   ✅ ${loanGRecord.loanNumber} — ACTIVE 2/6 paid (${student4.fullName}) — wallet funded, virtual acct ready`);

  // ── Loan H: teacher2 → PENDING teacher loan ─────────────────────────────────
  const loanH_amount = 100000;
  const loanH_months = 4;
  const loanH = loanMath(loanH_amount, loanH_months);

  const loanHRecord = await prisma.loan.create({
    data: {
      loanNumber: loanNumber(),
      userId: teacher2.id,
      schoolId: sp(1), // Covenant University
      schoolName: schoolUsers[1].fullName,
      loanAmount: loanH_amount,
      interestRate: loanH.interestRate,
      totalInterest: loanH.totalInterest,
      totalAmount: loanH.totalAmount,
      monthlyPayment: loanH.monthlyPayment,
      repaymentMonths: loanH_months,
      outstandingBalance: loanH.totalAmount,
      academicSession: '2024/2025',
      residencyStatus: ResidencyStatus.LOCAL,
      status: LoanStatus.PENDING,
      applicationDate: daysAgo(3),
      notes: JSON.stringify({ teacherLoan: true, loanType: 'Teachers Support Loan', repaymentMethod: 'Salary Deduction' }),
    },
  });
  await prisma.notification.create({
    data: {
      userId: teacher2.id,
      type: NotificationType.INFO,
      title: 'Teacher Loan Application Submitted',
      message: `Your loan application ${loanHRecord.loanNumber} has been submitted and is under review.`,
    },
  });
  console.log(`   ✅ ${loanHRecord.loanNumber} — PENDING Teacher Loan (${teacher2.fullName})`);

  // ── Loan I: teacher3 → ACTIVE teacher loan (2/6 paid) ─────────────────────
  const loanI_amount = 150000;
  const loanI_months = 6;
  const loanI = loanMath(loanI_amount, loanI_months);
  const loanI_paidCount = 2;
  const loanI_amountRepaid = Math.round(loanI.monthlyPayment * loanI_paidCount);
  const loanI_outstanding = Math.round(loanI.totalAmount - loanI_amountRepaid);

  const loanIRecord = await prisma.loan.create({
    data: {
      loanNumber: loanNumber(),
      userId: teacher3.id,
      schoolId: sp(0), // University of Lagos
      schoolName: schoolUsers[0].fullName,
      loanAmount: loanI_amount,
      interestRate: loanI.interestRate,
      totalInterest: loanI.totalInterest,
      totalAmount: loanI.totalAmount,
      monthlyPayment: loanI.monthlyPayment,
      repaymentMonths: loanI_months,
      outstandingBalance: loanI_outstanding,
      amountRepaid: loanI_amountRepaid,
      amountDisbursed: loanI_amount,
      academicSession: '2024/2025',
      residencyStatus: ResidencyStatus.LOCAL,
      status: LoanStatus.ACTIVE,
      applicationDate: daysAgo(100),
      approvalDate: daysAgo(90),
      disbursementDate: daysAgo(80),
      firstPaymentDate: daysAgo(50),
      approvedBy: admin.id,
      notes: JSON.stringify({ teacherLoan: true, loanType: 'Professional Development', repaymentMethod: 'Salary Deduction' }),
    },
  });
  const loanI_startDate = daysAgo(50);
  for (let i = 0; i < loanI_months; i++) {
    const dueDate = addMonths(loanI_startDate, i);
    const isPaid = i < loanI_paidCount;
    await prisma.installment.create({
      data: {
        loanId: loanIRecord.id,
        installmentNumber: i + 1,
        amount: loanI.monthlyPayment,
        dueDate,
        paidDate: isPaid ? new Date(dueDate.getTime() - 86_400_000) : null,
        status: isPaid ? PaymentStatus.PAID : PaymentStatus.PENDING,
      },
    });
  }
  await prisma.disbursement.create({
    data: {
      disbursementReference: `DISB-${loanIRecord.loanNumber}`,
      loanId: loanIRecord.id,
      schoolId: sp(0),
      amount: loanI_amount,
      status: TransactionStatus.COMPLETED,
      bankName: 'First Bank of Nigeria',
      accountNumber: '3012345601',
      accountName: schoolUsers[0].fullName,
      disbursedAt: daysAgo(80),
      confirmedAt: daysAgo(80),
    },
  });
  await prisma.transaction.create({
    data: {
      transactionReference: `FUND-${loanIRecord.loanNumber}-01`,
      userId: teacher3.id,
      walletId: teacher3.wallet!.id,
      type: TransactionType.CREDIT,
      amount: loanI.monthlyPayment * 2,
      balanceBefore: 0,
      balanceAfter: loanI.monthlyPayment * 2,
      description: 'Wallet funding via bank transfer',
      category: 'WALLET_FUNDING',
      status: TransactionStatus.COMPLETED,
    },
  });
  console.log(`   ✅ ${loanIRecord.loanNumber} — ACTIVE Teacher Loan 2/6 paid (${teacher3.fullName})\n`);

  // ── 9. Support Tickets ──────────────────────────────────────────────────────
  console.log('🎫 Creating Support Tickets...');

  await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TKT-2025-001',
      userId: parent1.id,
      subject: 'How long does loan review take?',
      category: 'Loan Application',
      priority: 'MEDIUM',
      status: 'OPEN',
      description: 'I applied 2 days ago and want to know when I will hear back.',
      messages: {
        create: [
          { senderId: parent1.id, senderRole: UserRole.PARENT, message: 'I applied 2 days ago. How long does review take?' },
        ],
      },
    },
  });

  await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TKT-2025-002',
      userId: parent3.id,
      subject: 'Payment not reflecting after wallet debit',
      category: 'Payments',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      description: 'My wallet was debited for installment #2 but the status still shows PENDING.',
      assignedTo: admin.id,
      firstResponseAt: daysAgo(1),
      messages: {
        create: [
          { senderId: parent3.id, senderRole: UserRole.PARENT, message: 'My wallet was debited but installment #2 still shows PENDING.' },
          { senderId: admin.id, senderRole: UserRole.ADMIN, message: 'We are investigating this. Please provide your transaction reference.' },
          { senderId: parent3.id, senderRole: UserRole.PARENT, message: 'The reference is TXN-2024-XYZ.' },
        ],
      },
    },
  });

  await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TKT-2025-003',
      userId: parent4.id,
      subject: 'Request for loan completion letter',
      category: 'Documentation',
      priority: 'LOW',
      status: 'RESOLVED',
      description: 'I have completed my loan. Please send my completion letter.',
      resolvedAt: daysAgo(5),
      messages: {
        create: [
          { senderId: parent4.id, senderRole: UserRole.PARENT, message: 'Please send my loan completion letter.' },
          { senderId: admin.id, senderRole: UserRole.ADMIN, message: 'Congratulations! Your letter has been sent to your email.' },
        ],
      },
    },
  });

  console.log('   ✅ 3 support tickets created\n');

  // ── 10. FAQs & System Settings ──────────────────────────────────────────────
  console.log('⚙️  Creating FAQs & System Settings...');

  await prisma.faq.createMany({
    data: [
      { question: 'How do I apply for a loan?', answer: 'Log in, go to "Apply for Loan", fill in the form and upload your documents.', category: 'Loans', order: 1, isActive: true },
      { question: 'How long does loan approval take?', answer: 'Loan applications are reviewed within 24–48 business hours after school verification.', category: 'Loans', order: 2, isActive: true },
      { question: 'How do I repay my loan?', answer: 'Fund your wallet via your virtual account number, then click "Make Repayment" on the loan details page.', category: 'Repayment', order: 1, isActive: true },
      { question: 'What is my virtual account number?', answer: 'Go to Wallet → your virtual account number is displayed at the top. Transfer funds to it to credit your wallet.', category: 'Wallet', order: 1, isActive: true },
      { question: 'Can teachers apply for loans?', answer: 'Yes! Teachers can apply for Teachers Support Loans, Professional Development loans, and Emergency loans.', category: 'Loans', order: 3, isActive: true },
    ],
  });

  await prisma.systemSetting.createMany({
    data: [
      { key: 'loan_interest_rate_monthly', value: '0.025', description: 'Monthly interest rate (2.5%)' },
      { key: 'max_loan_amount_local', value: '5000000', description: 'Maximum loan amount for local applicants (NGN)' },
      { key: 'max_loan_amount_international', value: '10000000', description: 'Maximum loan amount for international applicants (NGN)' },
      { key: 'max_repayment_months', value: '24', description: 'Maximum repayment tenure in months' },
    ],
  });

  console.log('   ✅ FAQs and system settings created\n');

  // ── Summary ─────────────────────────────────────────────────────────────────
  const pw = 'Test1234!';
  const line = '━'.repeat(60);

  console.log(line);
  console.log('🎉 SEED COMPLETE — Login Credentials');
  console.log(line);
  console.log(`Password for ALL accounts: ${pw}\n`);

  console.log('ADMIN');
  console.log(`  admin@paymyfees.co         Super Admin (no wallet)\n`);

  console.log('SCHOOL ADMIN / TEACHER ADMIN');
  console.log(`  schooladmin@paymyfees.co   School Admin → /school-admin`);
  console.log(`  teacheradmin@paymyfees.co  Teacher Admin → /teacher-admin\n`);

  console.log('SCHOOLS (SCHOOL role → /school-dashboard)');
  console.log(`  school1@paymyfees.co       University of Lagos (verified)`);
  console.log(`  school2@paymyfees.co       Covenant University (verified)`);
  console.log(`  school3@paymyfees.co       Kings College Lagos (verified)\n`);

  console.log('PARENTS (PARENT role → /dashboard)');
  console.log(`  parent1@paymyfees.co       Local — loan PENDING (just submitted)`);
  console.log(`  parent2@paymyfees.co       Local — loan UNDER_REVIEW`);
  console.log(`  parent3@paymyfees.co       Local — loan ACTIVE 3/6 paid ← test repayment`);
  console.log(`  parent4@paymyfees.co       Local — loan COMPLETED`);
  console.log(`  parent5@paymyfees.co       International — loan DISBURSED`);
  console.log(`  parent6@paymyfees.co       Local — loan REJECTED\n`);

  console.log('STUDENTS (STUDENT role → /dashboard)');
  console.log(`  student1@paymyfees.co      FIRST TIME LOGIN → residency modal shows`);
  console.log(`  student2@paymyfees.co      Local — no loan (test apply form)`);
  console.log(`  student3@paymyfees.co      International — no loan (test int. form)`);
  console.log(`  student4@paymyfees.co      Local — loan ACTIVE 2/6 paid ← test repayment\n`);

  console.log('TEACHERS (TEACHER role → /teacher-dashboard)');
  console.log(`  teacher1@paymyfees.co      New teacher — test apply-for-loan form`);
  console.log(`  teacher2@paymyfees.co      Teacher — loan PENDING`);
  console.log(`  teacher3@paymyfees.co      Teacher — loan ACTIVE 2/6 paid ← test repayment\n`);

  console.log(line);
  console.log('📝 LOAN NUMBERS:');
  console.log(`  ${loanARecord.loanNumber}  PENDING     — parent1`);
  console.log(`  ${loanBRecord.loanNumber}  UNDER_REVIEW — parent2`);
  console.log(`  ${loanCRecord.loanNumber}  ACTIVE 3/6  — parent3`);
  console.log(`  ${loanDRecord.loanNumber}  COMPLETED   — parent4`);
  console.log(`  ${loanERecord.loanNumber}  DISBURSED   — parent5`);
  console.log(`  ${loanFRecord.loanNumber}  REJECTED    — parent6`);
  console.log(`  ${loanGRecord.loanNumber}  ACTIVE 2/6  — student4`);
  console.log(`  ${loanHRecord.loanNumber}  PENDING     — teacher2`);
  console.log(`  ${loanIRecord.loanNumber}  ACTIVE 2/6  — teacher3`);
  console.log(line);
  console.log('\n⚠️  To test repayment: send any amount to the virtual account number');
  console.log('    shown in Wallet page. Embedly webhook will credit the wallet.');
  console.log('    Then use "Make Repayment" on the loan detail page.\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
