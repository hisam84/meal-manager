import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const superAdminPhone = '01900000000';
  const hashedPassword = await bcrypt.hash('superadmin123', 10);

  // Upsert Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { phone: superAdminPhone },
    update: {
      role: 'SUPERADMIN',
      active: true,
      password: hashedPassword,
    },
    create: {
      name: 'Super Admin',
      phone: superAdminPhone,
      email: 'superadmin@messmealtracker.com',
      password: hashedPassword,
      role: 'SUPERADMIN',
      active: true,
    },
  });

  console.log('✔ Super Admin created/updated successfully:');
  console.log({
    id: superAdmin.id,
    name: superAdmin.name,
    phone: superAdmin.phone,
    role: superAdmin.role,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
