// prisma/seed.ts (ESM)
import pkg from "@prisma/client";
import bcrypt from "bcryptjs";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  // Admin user
  const email = "admin@cab.local";
  const password = "Admin@123";
  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, hashedPassword, name: "Admin", role: "admin" }
  });

  // Cities: keep as-is (no uniqueness assumption)
  const cities = [
    { name: "Mumbai", state: "Maharashtra" },
    { name: "Delhi", state: "Delhi" }
    // ...add the rest as desired
  ];
  for (const c of cities) {
    const existing = await prisma.city.findFirst({ where: { name: c.name, state: c.state } });
    if (!existing) await prisma.city.create({ data: c });
  }

  // OPTIONAL: no fixed cab types; admin will add them in UI
  // If a placeholder helps onboarding, uncomment:
  // let placeholder = await prisma.cabType.findFirst({ where: { name: "Sample Type" } });
  // if (!placeholder) {
  //   placeholder = await prisma.cabType.create({ data: { name: "Sample Type", seats: 4, luggage: 2, active: true } });
  // }

  // Settings JSON-as-string for SQLite
  await prisma.setting.upsert({
    where: { key: "payment.razorpay" },
    update: { valueJson: JSON.stringify({ keyId: "rzp_test_xxx", keySecret: "rzp_secret_xxx" }) },
    create: { key: "payment.razorpay", valueJson: JSON.stringify({ keyId: "rzp_test_xxx", keySecret: "rzp_secret_xxx" }) }
  });

  console.log("Seed completed. Admin: admin@cab.local / Admin@123");
}
main().catch(console.error).finally(() => prisma.$disconnect());
