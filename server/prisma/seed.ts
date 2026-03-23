import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value.trim();
}



async function main(): Promise<void> {
  const email = getEnv("ADMIN_EMAIL").toLowerCase();
  const password = getEnv("ADMIN_PASSWORD");

  const existingAdmin = await prisma.user.findUnique({
    where: { email }
  });

  if (existingAdmin) {
    console.log(`Admin already exists: ${existingAdmin.email}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: "ADMIN"
    },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  console.log("Admin created successfully:");
  console.log(admin);
}

main()
  .catch((error: unknown) => {
    if (error instanceof Error) {
      console.error("Seed failed:", error.message);
    } else {
      console.error("Seed failed:", error);
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });