import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// PATIENT: CREATE FEEDBACK FOR THEIR OWN APPOINTMENT
router.post("/", requireAuth, requireRole("PATIENT"), async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;

    if (!appointmentId || !rating) {
      return res.status(400).json({ message: "appointmentId and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: true }
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.userId !== req.user!.id) {
      return res.status(403).json({ message: "You can only give feedback for your own appointment" });
    }

    const existing = await prisma.feedback.findUnique({
      where: { appointmentId }
    });

    if (existing) {
      return res.status(400).json({ message: "Feedback already submitted for this appointment" });
    }

    const feedback = await prisma.feedback.create({
      data: {
        appointmentId,
        rating,
        comment,
        patientId: req.user!.id,
        doctorId: appointment.doctorId
      },
      include: {
        patient: {
          select: { id: true, email: true }
        },
        doctor: {
          select: { id: true, name: true, specialization: true }
        },
        appointment: {
          select: { id: true, slot: true, meetingUrl: true }
        }
      }
    });

    res.json(feedback);
  } catch (error) {
    console.log("CREATE FEEDBACK ERROR:", error);
    res.status(500).json({ message: "Failed to create feedback" });
  }
});

// PATIENT: VIEW THEIR FEEDBACKS
router.get("/my", requireAuth, requireRole("PATIENT"), async (req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      where: { patientId: req.user!.id },
      include: {
        doctor: {
          select: { id: true, name: true, specialization: true }
        },
        appointment: {
          select: { id: true, slot: true, meetingUrl: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(feedbacks);
  } catch (error) {
    console.log("MY FEEDBACK ERROR:", error);
    res.status(500).json({ message: "Failed to fetch feedbacks" });
  }
});

// DOCTOR: VIEW FEEDBACKS RECEIVED
router.get("/doctor", requireAuth, requireRole("DOCTOR"), async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.user!.id }
    });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const feedbacks = await prisma.feedback.findMany({
      where: { doctorId: doctor.id },
      include: {
        patient: {
          select: { id: true, email: true }
        },
        appointment: {
          select: { id: true, slot: true, meetingUrl: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(feedbacks);
  } catch (error) {
    console.log("DOCTOR FEEDBACK ERROR:", error);
    res.status(500).json({ message: "Failed to fetch doctor feedbacks" });
  }
});

// ADMIN: VIEW ALL FEEDBACKS
router.get("/admin", requireAuth, requireRole("ADMIN"), async (_req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      include: {
        patient: {
          select: { id: true, email: true }
        },
        doctor: {
          select: { id: true, name: true, specialization: true }
        },
        appointment: {
          select: { id: true, slot: true, meetingUrl: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(feedbacks);
  } catch (error) {
    console.log("ADMIN FEEDBACK ERROR:", error);
    res.status(500).json({ message: "Failed to fetch all feedbacks" });
  }
});

export default router;