const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

// إنشاء الاتصال
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// إنشاء Adapter
const adapter = new PrismaPg(pool);

// إنشاء PrismaClient مع Adapter
const prisma = new PrismaClient({ adapter });

async function main() {
  const roles = [
    { name: "ADMIN" },
    { name: "OWNER" },
    { name: "CUSTOMER" },
    { name: "DRIVER" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  console.log("✅ Roles seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
