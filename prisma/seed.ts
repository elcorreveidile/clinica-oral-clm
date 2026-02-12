import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ── 1. Profesor ──
  const hashedPassword = await hash("profesor123", 12);

  const teacher = await prisma.user.upsert({
    where: { email: "profe@clm.ugr.es" },
    update: {},
    create: {
      email: "profe@clm.ugr.es",
      name: "Javier Benítez",
      password: hashedPassword,
      role: "TEACHER",
      emailVerified: new Date(),
    },
  });
  console.log(`  Teacher created: ${teacher.name} (${teacher.email})`);
  console.log(`  Teacher password: profesor123`);

  // ── 2. Código de acceso para registrar un estudiante ──
  const accessCode = await prisma.accessCode.upsert({
    where: { code: "CLINICA2024" },
    update: {},
    create: {
      code: "CLINICA2024",
      isUsed: false,
    },
  });
  console.log(`  Access code created: ${accessCode.code}`);

  console.log("\nSeed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
