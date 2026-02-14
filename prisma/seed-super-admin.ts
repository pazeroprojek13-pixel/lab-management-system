import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Update existing admin to SUPER_ADMIN
  const updated = await prisma.user.update({
    where: { email: 'admin@lab.com' },
    data: { role: 'SUPER_ADMIN' },
  });

  console.log('✅ Admin upgraded to SUPER_ADMIN:');
  console.log(`   Email: ${updated.email}`);
  console.log(`   Role: ${updated.role}`);
  console.log(`   ID: ${updated.id}`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
