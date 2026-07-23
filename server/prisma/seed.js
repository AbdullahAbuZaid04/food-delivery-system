const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

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

  const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });

  const hashedPassword = await bcrypt.hash("Admin$$123", 10);

  await prisma.user.upsert({
    where: { email: "admin@food.com" },
    update: {},
    create: {
      firstName: "Admin",
      lastName: "Admin",
      email: "admin@food.com",
      phone: "0590000000",
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log("✅ Roles seeded successfully.");
  console.log("✅ Admin user seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
