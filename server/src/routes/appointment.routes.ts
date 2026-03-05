import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
// import { requireAuth, requireRole } from "";

const router = Router();

// GET VERIFIED DOCTORS
router.get("/doctors", async (_req, res) => {
  const doctors = await prisma.doctor.findMany({
    where: { verified: true }
  });

  res.json(doctors);
});

// BOOK APPOINTMENT
router.post("/book", requireAuth, requireRole("PATIENT"), async (req, res) => {
  const { doctorId, slot } = req.body;

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId }
  });

  if (!doctor || !doctor.verified) {
    return res.status(400).json({ message: "Doctor not available" });
  }

  const appointment = await prisma.appointment.create({
    data: {
      doctorId,
      userId: req.user!.id,
      slot,
      meetingUrl: doctor.calLink
    }
  });

  res.json(appointment);
});

// PATIENT APPOINTMENTS
router.get("/my", requireAuth, async (req, res) => {
  const data = await prisma.appointment.findMany({
    where: { userId: req.user!.id },
    include: { doctor: true }
  });

  res.json(data);
});

export default router;