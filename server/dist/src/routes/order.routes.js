import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
// import type { PlaceOrderBody } from "../types/order.types.js";
const router = Router();
router.use(requireAuth, requireRole("PATIENT"));
router.post("/place", async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, } = req.body;
        if (!fullName?.trim() ||
            !phone?.trim() ||
            !addressLine1?.trim() ||
            !city?.trim() ||
            !state?.trim() ||
            !postalCode?.trim() ||
            !country?.trim()) {
            res.status(400).json({
                message: "fullName, phone, addressLine1, city, state, postalCode and country are required",
            });
            return;
        }
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        medicine: true,
                    },
                },
            },
        });
        if (!cart || cart.items.length === 0) {
            res.status(400).json({ message: "Cart is empty" });
            return;
        }
        const result = await prisma.$transaction(async (tx) => {
            let total = 0;
            for (const item of cart.items) {
                if (!item.medicine.isActive) {
                    throw new Error(`Medicine "${item.medicine.name}" is not available`);
                }
                if (item.medicine.stock < item.quantity) {
                    throw new Error(`Insufficient stock for "${item.medicine.name}"`);
                }
                total += item.quantity * item.medicine.price;
            }
            const order = await tx.order.create({
                data: {
                    userId,
                    total,
                    status: "PENDING",
                    fullName: fullName.trim(),
                    phone: phone.trim(),
                    addressLine1: addressLine1.trim(),
                    addressLine2: addressLine2?.trim() || null,
                    city: city.trim(),
                    state: state.trim(),
                    postalCode: postalCode.trim(),
                    country: country.trim(),
                },
            });
            for (const item of cart.items) {
                await tx.orderItem.create({
                    data: {
                        orderId: order.id,
                        medicineId: item.medicineId,
                        medicineName: item.medicine.name,
                        unitPrice: item.medicine.price,
                        quantity: item.quantity,
                    },
                });
                await tx.medicine.update({
                    where: { id: item.medicineId },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });
            }
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
            const fullOrder = await tx.order.findUnique({
                where: { id: order.id },
                include: {
                    items: {
                        include: {
                            medicine: true,
                        },
                    },
                },
            });
            return fullOrder;
        });
        res.status(201).json({
            message: "Order placed successfully",
            order: result,
        });
    }
    catch (error) {
        console.log("PLACE ORDER ERROR:", error);
        const message = error instanceof Error ? error.message : "Failed to place order";
        res.status(500).json({ message });
    }
});
router.get("/my", async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        medicine: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json(orders);
    }
    catch (error) {
        console.log("GET MY ORDERS ERROR:", error);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
});
router.get("/:orderId", async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const order = await prisma.order.findFirst({
            where: {
                id: req.params.orderId,
                userId,
            },
            include: {
                items: {
                    include: {
                        medicine: true,
                    },
                },
            },
        });
        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        res.json(order);
    }
    catch (error) {
        console.log("GET ORDER ERROR:", error);
        res.status(500).json({ message: "Failed to fetch order" });
    }
});
router.patch("/cancel/:orderId", async (req, res) => {
    try {
        const userId = req.user?.id;
        const orderId = req.params.orderId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                userId,
            },
            include: {
                items: true,
            },
        });
        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        if (order.status === "CANCELLED") {
            res.status(400).json({ message: "Order already cancelled" });
            return;
        }
        const updatedOrder = await prisma.$transaction(async (tx) => {
            for (const item of order.items) {
                await tx.medicine.update({
                    where: { id: item.medicineId },
                    data: {
                        stock: {
                            increment: item.quantity,
                        },
                    },
                });
            }
            return tx.order.update({
                where: { id: orderId },
                data: { status: "CANCELLED" },
                include: {
                    items: {
                        include: {
                            medicine: true,
                        },
                    },
                },
            });
        });
        res.json({
            message: "Order cancelled successfully",
            order: updatedOrder,
        });
    }
    catch (error) {
        console.log("CANCEL ORDER ERROR:", error);
        res.status(500).json({ message: "Failed to cancel order" });
    }
});
export default router;
