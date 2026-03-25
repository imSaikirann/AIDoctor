import { Request, Response, Router } from "express";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const router = Router();

const emergencyBookingSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(7).max(30),
  problem: z.string().min(5).max(2000),
  doctorId: z.string().min(1),
});

class EmergencyBookingError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

function normalizeUrl(url: string): string {
  return url.startsWith("http") ? url : `https://${url}`;
}

function buildEmergencyMeetingUrl(
  doctorCalLink: string | null | undefined,
  doctorId: string
): string {
  if (doctorCalLink) {
    return normalizeUrl(doctorCalLink);
  }

  return `https://meet.jit.si/ai-doctor-emergency-${doctorId}-${Date.now()}`;
}

async function getOrCreateEmergencyPatient(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    if (existing.role !== "PATIENT") {
      throw new EmergencyBookingError(
        400,
        "This email belongs to a non-patient account. Please use a different email."
      );
    }
    return existing;
  }

  const generatedPassword = randomBytes(24).toString("hex");
  const hashed = await bcrypt.hash(generatedPassword, 10);

  return prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashed,
      role: "PATIENT",
    },
  });
}

router.post("/emergency", async (req: Request, res: Response) => {
  try {
    const parsed = emergencyBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid emergency booking payload",
        issues: parsed.error.flatten(),
      });
    }
    const { email, phone, problem, doctorId } = parsed.data;

    const selectedDoctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        name: true,
        specialization: true,
        calLink: true,
        verified: true,
        createdAt: true,
      },
    });

    if (!selectedDoctor || !selectedDoctor.verified) {
      throw new EmergencyBookingError(
        404,
        "Selected doctor is not available for emergency booking."
      );
    }

    const patient = await getOrCreateEmergencyPatient(email);

    const now = new Date();
    const slot = `Emergency ${now.toISOString()}`;
    const meetingUrl = buildEmergencyMeetingUrl(
      selectedDoctor.calLink,
      selectedDoctor.id
    );

    const appointment = await prisma.appointment.create({
      data: {
        doctorId: selectedDoctor.id,
        userId: patient.id,
        slot,
        meetingUrl,
        isEmergency: true,
        emergencyContactEmail: patient.email,
        emergencyContactPhone: phone.trim(),
        emergencyProblem: problem.trim(),
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            calLink: true,
            verified: true,
            createdAt: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Emergency doctor booked successfully.",
      appointmentId: appointment.id,
      doctor: appointment.doctor,
      slot: appointment.slot,
      meetingUrl: appointment.meetingUrl,
      appointment,
    });
  } catch (err: any) {
    console.error(err);

    if (err instanceof EmergencyBookingError) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    if (err.code === "P2002") {
      return res
        .status(409)
        .json({ message: "Emergency slot conflict. Please tap again." });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
