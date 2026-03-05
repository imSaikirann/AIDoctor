import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
// import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

// VERIFY DOCTOR
router.patch("/verify/:id", async (req, res) => {
  const doctor = await prisma.doctor.update({
    where: { id: req.params.id },
    data: { verified: true }
  });

  res.json(doctor);
});

// ALL USERS
router.get("/users", async (_req, res) => {
  const users = await prisma.user.findMany({
    include: { doctorProfile: true }
  });

  res.json(users);
});

// DAILY BOOKINGS
router.get("/bookings", async (_req, res) => {
  const count = await prisma.appointment.count();
  res.json({ totalBookings: count });
});

export default router;