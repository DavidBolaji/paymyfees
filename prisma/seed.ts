/**
 * Database Seed — PayMyFees (Admin Only)
 * Clears all users and related data, then creates admin accounts only.
 * Password for every account: Test1234!
 */

import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🌱 PayMyFees Database Seed (Admin Only)\n');
  console.log('━'.repeat(60));

  // ── 1. Clear Database ───────────────────────────────────────────────────────
  console.log('\n🧹 Clearing database...');

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

  const PASSWORD = await bcrypt.hash('Test1234!', 10);

  // ── 2. Admin (Student / Parent Admin) ──────────────────────────────────────
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
  console.log(`✅ ${admin.email} (ADMIN — Student/Parent Admin)`);

  // ── 3. School Admin ─────────────────────────────────────────────────────────
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
      notificationSettings: { create: {} },
    },
  });
  console.log(`✅ ${schoolAdmin.email} (SCHOOL_ADMIN)`);

  // ── 4. Teacher Admin ────────────────────────────────────────────────────────
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
      notificationSettings: { create: {} },
    },
  });
  console.log(`✅ ${teacherAdmin.email} (TEACHER_ADMIN)\n`);

  // ── Summary ─────────────────────────────────────────────────────────────────
  const line = '━'.repeat(60);
  console.log(line);
  console.log('🎉 SEED COMPLETE — Admin Accounts');
  console.log(line);
  console.log('Password for ALL accounts: Test1234!\n');
  console.log('  admin@paymyfees.co         ADMIN        (Student/Parent Admin)');
  console.log('  schooladmin@paymyfees.co   SCHOOL_ADMIN');
  console.log('  teacheradmin@paymyfees.co  TEACHER_ADMIN');
  console.log(line);
}

main()
  .catch((e) => {
    console.error('\n❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
