import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting database...');
  
  // Delete all data in correct order to respect foreign key constraints
  await prisma.routePricing.deleteMany({});
  console.log('Deleted route pricing');
  
  await prisma.booking.deleteMany({});
  console.log('Deleted bookings');
  
  await prisma.cityRoute.deleteMany({});
  console.log('Deleted city routes');
  
  await prisma.pricingRule.deleteMany({});
  console.log('Deleted pricing rules');
  
  await prisma.inquiry.deleteMany({});
  console.log('Deleted inquiries');
  
  await prisma.cabType.deleteMany({});
  console.log('Deleted cab types');
  
  await prisma.city.deleteMany({});
  console.log('Deleted cities');
  
  await prisma.user.deleteMany({});
  console.log('Deleted users');
  
  console.log('Database reset complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
