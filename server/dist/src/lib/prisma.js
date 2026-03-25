import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();
const delegates = prisma;
if (!delegates.medicalRecord) {
    throw new Error("Prisma client is missing the MedicalRecord model delegate. Run `npx prisma generate` in the server directory and restart the server.");
}
