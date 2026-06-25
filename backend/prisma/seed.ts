import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash the admin password
  const hashedPassword = await bcrypt.hash('Kolawolelekan@21', 10);

  // Create or update admin user
  const admin = await prisma.user.upsert({
    where: { email: 'lekankolawolejohn@gmail.com' },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
    },
    create: {
      email: 'lekankolawolejohn@gmail.com',
      password: hashedPassword,
      firstName: 'Lekan',
      lastName: 'Kolawole',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  console.log('✅ Admin user created/updated:');
  console.log(`   Email: ${admin.email}`);
  console.log(`   Role: ${admin.role}`);
  console.log(`   ID: ${admin.id}`);

  // Optional: Create a test creator user
  const testCreatorPassword = await bcrypt.hash('Test@123', 10);
  const testCreator = await prisma.user.upsert({
    where: { email: 'creator@afrifund.com' },
    update: {
      password: testCreatorPassword,
      role: 'CREATOR',
      isVerified: true,
    },
    create: {
      email: 'creator@afrifund.com',
      password: testCreatorPassword,
      firstName: 'Test',
      lastName: 'Creator',
      role: 'CREATOR',
      isVerified: true,
    },
  });

  console.log('✅ Test creator user created/updated:');
  console.log(`   Email: ${testCreator.email}`);
  console.log(`   Role: ${testCreator.role}`);

  // Optional: Create a test backer user
  const testBackerPassword = await bcrypt.hash('Test@123', 10);
  const testBacker = await prisma.user.upsert({
    where: { email: 'backer@afrifund.com' },
    update: {
      password: testBackerPassword,
      role: 'BACKER',
      isVerified: true,
    },
    create: {
      email: 'backer@afrifund.com',
      password: testBackerPassword,
      firstName: 'Test',
      lastName: 'Backer',
      role: 'BACKER',
      isVerified: true,
    },
  });

  console.log('✅ Test backer user created/updated:');
  console.log(`   Email: ${testBacker.email}`);
  console.log(`   Role: ${testBacker.role}`);

  console.log('\n🎉 Database seeding completed!');
  console.log('\n📝 Admin Login Credentials:');
  console.log('   Email: lekankolawolejohn@gmail.com');
  console.log('   Password: Kolawolelekan@21');
  console.log('\n📝 Test Users (for development):');
  console.log('   Creator - creator@afrifund.com : Test@123');
  console.log('   Backer - backer@afrifund.com : Test@123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
