import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
const router = Router();
router.use(requireAuth, requireRole("PATIENT"));
// helper: get or create cart
async function getOrCreateCart(userId) {
    let cart = await prisma.cart.findUnique({
        where: { userId },
    });
    if (!cart) {
        cart = await prisma.cart.create({
            data: { userId },
        });
    }
    return cart;
}
// GET CART
router.get("/", async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await getOrCreateCart(userId);
        const items = await prisma.cartItem.findMany({
            where: { cartId: cart.id },
            include: {
                medicine: true,
            },
            orderBy: { createdAt: "desc" },
        });
        const subtotal = items.reduce((sum, item) => {
            return sum + item.quantity * item.medicine.price;
        }, 0);
        res.json({
            cartId: cart.id,
            items,
            subtotal,
        });
    }
    catch (error) {
        console.log("GET CART ERROR:", error);
        res.status(500).json({ message: "Failed to fetch cart" });
    }
});
// ADD TO CART
router.post("/add", async (req, res) => {
    try {
        const userId = req.user.id;
        const { medicineId, quantity = 1 } = req.body;
        if (!medicineId) {
            return res.status(400).json({ message: "medicineId is required" });
        }
        const qty = Number(quantity);
        if (qty <= 0) {
            return res.status(400).json({ message: "Quantity must be greater than 0" });
        }
        const medicine = await prisma.medicine.findUnique({
            where: { id: medicineId },
        });
        if (!medicine || !medicine.isActive) {
            return res.status(404).json({ message: "Medicine not found" });
        }
        if (medicine.stock < qty) {
            return res.status(400).json({ message: "Insufficient stock" });
        }
        const cart = await getOrCreateCart(userId);
        const existing = await prisma.cartItem.findUnique({
            where: {
                cartId_medicineId: {
                    cartId: cart.id,
                    medicineId,
                },
            },
        });
        if (existing) {
            const newQty = existing.quantity + qty;
            if (medicine.stock < newQty) {
                return res.status(400).json({ message: "Requested quantity exceeds stock" });
            }
            const updated = await prisma.cartItem.update({
                where: { id: existing.id },
                data: { quantity: newQty },
                include: { medicine: true },
            });
            return res.json({
                message: "Cart updated",
                item: updated,
            });
        }
        const item = await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                medicineId,
                quantity: qty,
            },
            include: {
                medicine: true,
            },
        });
        res.status(201).json({
            message: "Added to cart",
            item,
        });
    }
    catch (error) {
        console.log("ADD TO CART ERROR:", error);
        res.status(500).json({ message: "Failed to add item to cart" });
    }
});
// UPDATE CART ITEM QUANTITY
router.patch("/item/:itemId", async (req, res) => {
    try {
        const userId = req.user.id;
        const { quantity } = req.body;
        const qty = Number(quantity);
        if (!qty || qty <= 0) {
            return res.status(400).json({ message: "Quantity must be greater than 0" });
        }
        const cart = await prisma.cart.findUnique({
            where: { userId },
        });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        const item = await prisma.cartItem.findFirst({
            where: {
                id: req.params.itemId,
                cartId: cart.id,
            },
            include: {
                medicine: true,
            },
        });
        if (!item) {
            return res.status(404).json({ message: "Cart item not found" });
        }
        if (item.medicine.stock < qty) {
            return res.status(400).json({ message: "Insufficient stock" });
        }
        const updated = await prisma.cartItem.update({
            where: { id: item.id },
            data: { quantity: qty },
            include: { medicine: true },
        });
        res.json({
            message: "Cart item updated",
            item: updated,
        });
    }
    catch (error) {
        console.log("UPDATE CART ITEM ERROR:", error);
        res.status(500).json({ message: "Failed to update cart item" });
    }
});
// REMOVE ONE ITEM FROM CART
router.delete("/item/:itemId", async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await prisma.cart.findUnique({
            where: { userId },
        });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        const item = await prisma.cartItem.findFirst({
            where: {
                id: req.params.itemId,
                cartId: cart.id,
            },
        });
        if (!item) {
            return res.status(404).json({ message: "Cart item not found" });
        }
        await prisma.cartItem.delete({
            where: { id: item.id },
        });
        res.json({ message: "Item removed from cart" });
    }
    catch (error) {
        console.log("REMOVE CART ITEM ERROR:", error);
        res.status(500).json({ message: "Failed to remove item from cart" });
    }
});
// CLEAR CART
router.delete("/clear", async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await prisma.cart.findUnique({
            where: { userId },
        });
        if (!cart) {
            return res.json({ message: "Cart already empty" });
        }
        await prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });
        res.json({ message: "Cart cleared successfully" });
    }
    catch (error) {
        console.log("CLEAR CART ERROR:", error);
        res.status(500).json({ message: "Failed to clear cart" });
    }
});
export default router;
