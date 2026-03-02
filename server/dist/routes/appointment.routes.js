import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { prisma } from "../lib/prisma.js";
const router = Router();
const TIME_SLOTS = [
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "02:00 PM",
    "04:00 PM",
];
/**
 * Get doctors
 */
router.get("/doctors", async (_, res) => {
    const doctors = await prisma.doctor.findMany();
    res.json(doctors);
});
/**
 * Get available slots
 */
router.get("/slots/:doctorId", async (req, res) => {
    const { doctorId } = req.params;
    const booked = await prisma.appointment.findMany({
        where: { doctorId },
        select: { slot: true },
    });
    const bookedSlots = booked.map((b) => b.slot);
    const available = TIME_SLOTS.filter((s) => !bookedSlots.includes(s));
    res.json(available);
});
/**
 * Book appointment
 */
router.post("/book", verifyToken, async (req, res) => {
    try {
        const { doctorId, slot } = req.body;
        const appointment = await prisma.appointment.create({
            data: {
                doctorId,
                slot,
                userId: req.user.userId,
            },
        });
        res.json({ success: true, appointment });
    }
    catch (err) {
        if (err.code === "P2002") {
            return res.status(400).json({ message: "Slot already booked" });
        }
        res.status(500).json({ message: "Booking failed" });
    }
});
export default router;
