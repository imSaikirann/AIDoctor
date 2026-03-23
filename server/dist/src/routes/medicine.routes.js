import { Router } from "express";
import { prisma } from "../lib/prisma.js";
const router = Router();
// GET ALL ACTIVE MEDICINES
router.get("/", async (req, res) => {
    try {
        const { search, category } = req.query;
        const medicines = await prisma.medicine.findMany({
            where: {
                isActive: true,
                ...(category
                    ? {
                        category: String(category),
                    }
                    : {}),
                ...(search
                    ? {
                        OR: [
                            { name: { contains: String(search), mode: "insensitive" } },
                            { description: { contains: String(search), mode: "insensitive" } },
                            { category: { contains: String(search), mode: "insensitive" } },
                        ],
                    }
                    : {}),
            },
            orderBy: { createdAt: "desc" },
        });
        res.json(medicines);
    }
    catch (error) {
        console.log("GET MEDICINES ERROR:", error);
        res.status(500).json({ message: "Failed to fetch medicines" });
    }
});
// GET SINGLE ACTIVE MEDICINE
router.get("/:id", async (req, res) => {
    try {
        const medicine = await prisma.medicine.findFirst({
            where: {
                id: req.params.id,
                isActive: true,
            },
        });
        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found" });
        }
        res.json(medicine);
    }
    catch (error) {
        console.log("GET MEDICINE ERROR:", error);
        res.status(500).json({ message: "Failed to fetch medicine" });
    }
});
export default router;
