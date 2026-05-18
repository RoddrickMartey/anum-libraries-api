import bcrypt from 'bcrypt';
import prisma from '../shared/prisma.js';
import logger from '../shared/logger.js';
import env from '../config/env.js';

const seed = async () => {
  logger.info('Seeding database...');

  // Check if super admin already exists
  const existing = await prisma.staff.findUnique({
    where: { email: 'superadmin@anum-libraries.com' },
  });

  if (existing) {
    logger.info('Super admin already exists — skipping seed');
    return;
  }

  // Hash password
  const passwordHash = await bcrypt.hash('Admin@1234', env.BCRYPT_ROUNDS);

  // Create super admin
  const superAdmin = await prisma.staff.create({
    data: {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@anum-libraries.com',
      passwordHash,
      role: 'SUPER_ADMIN',
      branchId: null,
      isActive: true,
    },
  });

  logger.info('Super admin created', {
    id: superAdmin.id,
    email: superAdmin.email,
  });

  logger.info('Seeding complete');
};

seed()
  .catch((error) => {
    logger.error('Seed failed', { error });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
