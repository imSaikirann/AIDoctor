import { Request, Response, Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const router = Router();

type JwtPayload = {
  id: string;
  role: "ADMIN" | "DOCTOR" | "PATIENT";
};

function getUserFromToken(req: Request): JwtPayload | null {
  const token = req.cookies?.token;
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
  } catch {
    return null;
  }
}

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
    const currentUser = getUserFromToken(req);
    let userId = currentUser?.id;

    if (!userId) {
      const email = req.body.email?.trim().toLowerCase();
      const password = req.body.password?.trim();

      if (!email || !password) {
        return res.status(400).json({
          message: "Email and password are required for emergency booking.",
        });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        if (existingUser.role !== "PATIENT") {
          return res.status(409).json({
            message: "This email is already registered as a non-patient account.",
          });
        }

        const validPassword = await bcrypt.compare(password, existingUser.password);
        if (!validPassword) {
          return res.status(401).json({
            message: "Incorrect password for this existing account.",
          });
        }

        userId = existingUser.id;
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const createdUser = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            role: "PATIENT",
          },
        });

        userId = createdUser.id;
      }

      const token = jwt.sign(
        { id: userId, role: "PATIENT" },
        process.env.JWT_SECRET as string
      );

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    } else if (currentUser?.role !== "PATIENT") {
      return res.status(403).json({
        message: "Only patient accounts can create emergency bookings.",
      });
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
        userId: userId!,
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
