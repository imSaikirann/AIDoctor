import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// GET VERIFIED DOCTORS
router.get("/doctors", async (_req, res) => {
  const doctors = await prisma.doctor.findMany({
    where: { verified: true }
  });

  res.json(doctors);
});

// GET AVAILABLE SLOTS FOR A DOCTOR
router.get("/slots/:doctorId", async (req, res) => {
  const { doctorId } = req.params;

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId }
  });

  if (!doctor || !doctor.verified) {
    return res.status(404).json({ message: "Doctor not found or not verified" });
  }

  const bookedAppointments = await prisma.appointment.findMany({
    where: { doctorId },
    select: { slot: true }
  });

  const bookedSlots = bookedAppointments.map((a) => a.slot);

  const allSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM"
  ];

  const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

  res.json({
    doctorId,
    availableSlots
  });
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

  const alreadyBooked = await prisma.appointment.findFirst({
    where: { doctorId, slot }
  });

  if (alreadyBooked) {
    return res.status(400).json({ message: "Slot already booked" });
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

// DOCTOR APPOINTMENTS
router.get("/doctor", requireAuth, requireRole("DOCTOR"), async (req, res) => {
  const doctor = await prisma.doctor.findUnique({
    where: { userId: req.user!.id }
  });

  if (!doctor) {
    return res.status(404).json({ message: "Doctor profile not found" });
  }

  const appointments = await prisma.appointment.findMany({
    where: { doctorId: doctor.id },
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });

  res.json(appointments);
});

export default router;