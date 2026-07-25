const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const superAdminPhone = 'admin';
  const hashedPassword = await bcrypt.hash('superadmin@123', 10);

  // Delete previous seed if needed or update
  await prisma.user.deleteMany({
    where: {
      OR: [
        { phone: 'admin' },
        { phone: '01900000000' },
        { email: 'superadmin@messmealtracker.com' }
      ]
    }
  });

  const superAdmin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      phone: superAdminPhone,
      email: 'superadmin@messmealtracker.com',
      password: hashedPassword,
      role: 'SUPERADMIN',
      active: true,
    },
  });

  console.log('✔ Super Admin Created/Updated successfully:');
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
