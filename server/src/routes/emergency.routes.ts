import { Request, Response, Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";


// You can adjust slots dynamically later
const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
];

const router = Router();


router.use(requireAuth, requireRole("PATIENT"));

router.post("/emergency",  async (req: Request, res: Response) => {
  try {
      const userId = req.user?.id!;

    // 1️⃣ Get all verified doctors
    const doctors = await prisma.doctor.findMany({
      where: { verified: true },
      select: { id: true, name: true },
    });

    if (doctors.length === 0) {
      return res.status(404).json({ message: "No doctors available" });
    }

    // 2️⃣ Get today's appointments
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const appointments = await prisma.appointment.findMany({
      where: {
        createdAt: { gte: todayStart },
      },
      select: {
        doctorId: true,
        slot: true,
      },
    });

    // 3️⃣ Build doctor availability map
    const doctorMap = new Map<
      string,
      { bookedSlots: Set<string>; count: number }
    >();

    doctors.forEach((doc) => {
      doctorMap.set(doc.id, {
        bookedSlots: new Set(),
        count: 0,
      });
    });

    appointments.forEach((appt) => {
      if (doctorMap.has(appt.doctorId)) {
        doctorMap.get(appt.doctorId)!.bookedSlots.add(appt.slot);
        doctorMap.get(appt.doctorId)!.count += 1;
      }
    });

    // 4️⃣ Find best doctor + earliest slot
    let selectedDoctorId: string | null = null;
    let selectedSlot: string | null = null;

    for (const slot of TIME_SLOTS) {
      // sort doctors by least load
      const sortedDoctors = [...doctors].sort((a, b) => {
        return (
          doctorMap.get(a.id)!.count - doctorMap.get(b.id)!.count
        );
      });

      for (const doc of sortedDoctors) {
        const doctorData = doctorMap.get(doc.id)!;

        if (!doctorData.bookedSlots.has(slot)) {
          selectedDoctorId = doc.id;
          selectedSlot = slot;
          break;
        }
      }

      if (selectedDoctorId && selectedSlot) break;
    }

    if (!selectedDoctorId || !selectedSlot) {
      return res.status(400).json({
        message: "No slots available right now",
      });
    }

    // 5️⃣ Create appointment (IMPORTANT: rely on DB uniqueness)
    const appointment = await prisma.appointment.create({
      data: {
        doctorId: selectedDoctorId,
        userId,
        slot: selectedSlot,
        meetingUrl: `https://meet.example.com/${Date.now()}`, // replace with real logic
      },
      include: {
        doctor: true,
      },
    });

    // 6️⃣ Return response
    return res.status(200).json({
      message: "Emergency appointment booked",
      doctor: appointment.doctor,
      slot: appointment.slot,
      meetingUrl: appointment.meetingUrl,
    });
  } catch (err: any) {
    console.error(err);

    // Handle race condition (important)
    if (err.code === "P2002") {
      return res.status(409).json({
        message: "Slot just got booked, retrying...",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;

