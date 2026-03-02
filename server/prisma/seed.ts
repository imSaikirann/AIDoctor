import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.doctor.count();

  if (count > 0) {
    console.log("Doctors already seeded");
    return;
  }

 await prisma.doctor.createMany({
  data: [
    {
      name: "Dr. Rajesh Kumar",
      specialization: "Cardiologist",
      calLink: "https://cal.com/rajesh-kumar",
    },
    {
      name: "Dr. Priya Sharma",
      specialization: "Dermatologist",
      calLink: "https://cal.com/priya-sharma",
    },
  ],
});

  console.log("✅ Doctors seeded");
}

main().finally(() => prisma.$disconnect());