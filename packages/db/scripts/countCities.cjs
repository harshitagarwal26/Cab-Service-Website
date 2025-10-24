const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const n = await prisma.city.count();
  console.log("City count:", n);
}
main().finally(() => prisma.$disconnect());
