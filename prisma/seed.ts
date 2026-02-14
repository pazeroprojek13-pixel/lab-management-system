import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create default campus first
  const campus = await prisma.campus.upsert({
    where: { code: 'MAIN' },
    update: {},
    create: {
      name: 'Main Campus',
      code: 'MAIN',
      location: 'Main Building',
      description: 'Main campus location',
    },
  });
  
  console.log('✅ Campus created:', campus.name);

  // Check if admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
  });

  if (!existingAdmin) {
    // Create default admin with campus
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@lab.com',
        password: hashedPassword,
        name: 'System Administrator',
        role: Role.ADMIN,
        campusId: campus.id,
      },
    });

    console.log('✅ Default admin created:');
    console.log(`   Email: admin@lab.com`);
    console.log(`   Password: admin123`);
    console.log(`   ID: ${admin.id}`);
  } else {
    console.log('Admin user already exists');
  }

  // Check if labs already exist for this campus
  const existingLabs = await prisma.lab.findFirst({
    where: { campusId: campus.id },
  });

  if (!existingLabs) {
    // Create sample labs with campus association
    const labs = await prisma.lab.createMany({
      data: [
        { name: 'Computer Lab 1', code: 'LAB-001', capacity: 30, location: 'Building A, Floor 1', status: 'ACTIVE' as const, campusId: campus.id },
        { name: 'Computer Lab 2', code: 'LAB-002', capacity: 25, location: 'Building A, Floor 2', status: 'ACTIVE' as const, campusId: campus.id },
        { name: 'Networking Lab', code: 'LAB-003', capacity: 20, location: 'Building B, Floor 1', status: 'ACTIVE' as const, campusId: campus.id },
      ],
    });

    console.log(`✅ Created ${labs.count} sample labs`);
  } else {
    console.log('Labs already exist for this campus');
  }
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
