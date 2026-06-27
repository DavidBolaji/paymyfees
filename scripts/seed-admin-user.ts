import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMINS = [
  {
    email: 'admin@paymyfees.co',
    role: UserRole.ADMIN,
    fullName: 'Super Admin',
    phone: '+2348000000001',
    label: 'ADMIN (Parent/Student management)',
  },
  {
    email: 'schooladmin@paymyfees.co',
    role: UserRole.SCHOOL_ADMIN,
    fullName: 'School Admin',
    phone: '+2348000000002',
    label: 'SCHOOL_ADMIN',
  },
  {
    email: 'teacheradmin@paymyfees.co',
    role: UserRole.TEACHER_ADMIN,
    fullName: 'Teacher Admin',
    phone: '+2348000000003',
    label: 'TEACHER_ADMIN',
  },
];

const PASSWORD_PLAIN = 'Admin@123456';

async function main() {
  console.log('\n🌱 Seeding admin users (upsert — no data wipe)\n');

  const hashedPassword = await bcrypt.hash(PASSWORD_PLAIN, 10);

  for (const admin of ADMINS) {
    const existing = await prisma.user.findUnique({ where: { email: admin.email } });

    if (existing) {
      console.log(`⏭️  ${admin.email} already exists — skipping`);
      continue;
    }

    await prisma.user.create({
      data: {
        email: admin.email,
        phone: admin.phone,
        password: hashedPassword,
        role: admin.role,
        fullName: admin.fullName,
        emailVerified: true,
        phoneVerified: true,
        isActive: true,
        isFirstTime: false,
        country: 'Nigeria',
        residencyStatus: 'LOCAL',
        notificationSettings: { create: {} },
      },
    });

    console.log(`✅ Created ${admin.email} (${admin.label})`);
  }

  console.log('\n━'.repeat(60));
  console.log('Password for ALL accounts: ' + PASSWORD_PLAIN);
  console.log('━'.repeat(60) + '\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
