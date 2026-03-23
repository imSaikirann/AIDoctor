import { Request, Response, Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireRole("PATIENT"));

function normalizeUrl(url: string): string {
  return url.startsWith("http") ? url : `https://${url}`;
}

function isDirectCallUrl(url: string): boolean {
  return /(meet\.google\.com|zoom\.us|teams\.microsoft\.com|meet\.jit\.si|whereby\.com|cal\.video)/i.test(
    url
  );
}

function buildEmergencyMeetingUrl(
  doctorCalLink: string | null | undefined,
  doctorId: string
): string {
  if (doctorCalLink) {
    const normalized = normalizeUrl(doctorCalLink);
    if (isDirectCallUrl(normalized)) {
      return normalized;
    }
  }

  return `https://meet.jit.si/ai-doctor-emergency-${doctorId}-${Date.now()}`;
}

router.post("/emergency", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const doctors = await prisma.doctor.findMany({
      where: { verified: true },
      select: {
        id: true,
        name: true,
        specialization: true,
        calLink: true,
      },
    });

    if (doctors.length === 0) {
      return res
        .status(404)
        .json({ message: "No verified doctors are available right now." });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const appointments = await prisma.appointment.findMany({
      where: {
        createdAt: { gte: todayStart },
        doctorId: { in: doctors.map((doctor) => doctor.id) },
      },
      select: {
        doctorId: true,
      },
    });

    const doctorLoadMap = new Map<string, number>();
    for (const doctor of doctors) {
      doctorLoadMap.set(doctor.id, 0);
    }

    for (const appointment of appointments) {
      doctorLoadMap.set(
        appointment.doctorId,
        (doctorLoadMap.get(appointment.doctorId) ?? 0) + 1
      );
    }

    const selectedDoctor = [...doctors].sort((a, b) => {
      const loadDiff =
        (doctorLoadMap.get(a.id) ?? 0) - (doctorLoadMap.get(b.id) ?? 0);
      if (loadDiff !== 0) return loadDiff;
      return a.name.localeCompare(b.name);
    })[0];

    const now = new Date();
    const slot = `Emergency ${now.toISOString()}`;
    const meetingUrl = buildEmergencyMeetingUrl(
      selectedDoctor.calLink,
      selectedDoctor.id
    );

    const appointment = await prisma.appointment.create({
      data: {
        doctorId: selectedDoctor.id,
        userId,
        slot,
        meetingUrl,
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
      message: "Emergency doctor connected successfully.",
      appointmentId: appointment.id,
      doctor: appointment.doctor,
      slot: appointment.slot,
      meetingUrl: appointment.meetingUrl,
      appointment,
    });
  } catch (err: any) {
    console.error(err);

    if (err.code === "P2002") {
      return res
        .status(409)
        .json({ message: "Emergency slot conflict. Please tap again." });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
