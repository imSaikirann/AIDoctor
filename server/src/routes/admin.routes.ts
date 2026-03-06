import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

// VERIFY DOCTOR
router.patch("/verify/:id", async (req, res) => {
  try {
    const doctor = await prisma.doctor.update({
      where: { id: req.params.id },
      data: { verified: true }
    });

    res.json(doctor);
  } catch (error) {
    console.log("VERIFY DOCTOR ERROR:", error);
    res.status(500).json({ message: "Failed to verify doctor" });
  }
});

// ALL USERS
router.get("/users", async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        doctorProfile: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.log("GET USERS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// DAILY BOOKINGS
router.get("/bookings", async (_req, res) => {
  try {
    const count = await prisma.appointment.count();
    res.json({ totalBookings: count });
  } catch (error) {
    console.log("GET BOOKINGS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch booking count" });
  }
});

export default router;