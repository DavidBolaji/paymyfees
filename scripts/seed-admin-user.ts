import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding admin user...');

  const adminEmail = 'admin@paymyfees.com'.toLowerCase();
  const adminPassword = 'Admin@123456';

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existingAdmin) {
    console.log('Admin user already exists:', adminEmail);
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      phone: '+2348012345678',
      password: hashedPassword,
      role: UserRole.ADMIN,
      fullName: 'System Administrator',
      emailVerified: true,
      phoneVerified: true,
      isActive: true,
      isFirstTime: false,
      country: 'Nigeria',
      residencyStatus: 'LOCAL'
    }
  });

  console.log('Admin user created successfully!');
  console.log('Email:', adminEmail);
  console.log('Password:', adminPassword);
  console.log('User ID:', admin.id);
}

main()
  .catch((e) => {
    console.error('Error seeding admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
