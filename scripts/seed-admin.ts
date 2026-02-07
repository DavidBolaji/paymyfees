/**
 * Seed Admin User Script
 * Creates a default admin user for testing
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    console.log('🌱 Seeding admin user...');

    const adminEmail = 'admin@paymyfees.com'.toLowerCase();

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN',
        email: adminEmail
      }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('Email: admin@paymyfees.com');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@123456', 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        phone: '+2348012345678',
        password: hashedPassword,
        role: 'ADMIN',
        fullName: 'System Administrator',
        emailVerified: true,
        phoneVerified: true,
        isActive: true,
        isFirstTime: false,
        country: 'Nigeria',
        residencyStatus: 'LOCAL'
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@paymyfees.com');
    console.log('🔑 Password: Admin@123456');
    console.log('👤 User ID:', admin.id);
    console.log('\n⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
