import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { UpdateOrderStatusBody } from "../types.js";
// import type { UpdateOrderStatusBody } from "../types/order.types.js";

const router = Router();


router.use(requireAuth, requireRole("ADMIN"));

// VERIFY DOCTOR
router.patch(
  "/verify/:id",
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const doctor = await prisma.doctor.update({
        where: { id: req.params.id },
        data: { verified: true },
      });

      res.json(doctor);
    } catch (error) {
      console.log("VERIFY DOCTOR ERROR:", error);
      res.status(500).json({ message: "Failed to verify doctor" });
    }
  }
);

// ALL USERS
router.get("/users", async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        doctorProfile: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(users);
  } catch (error) {
    console.log("GET USERS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// DAILY BOOKINGS
router.get("/bookings", async (_req: Request, res: Response): Promise<void> => {
  try {
    const count = await prisma.appointment.count();
    res.json({ totalBookings: count });
  } catch (error) {
    console.log("GET BOOKINGS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch booking count" });
  }
});

// ADD MEDICINE
router.post("/medicines", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      price,
      stock,
      imageUrl,
      category,
      isActive,
    } = req.body as {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      imageUrl?: string;
      category?: string;
      isActive?: boolean;
    };

    if (!name?.trim() || price == null || stock == null) {
      res.status(400).json({
        message: "Name, price and stock are required",
      });
      return;
    }

    const medicine = await prisma.medicine.create({
      data: {
        name: String(name).trim(),
        description: description?.trim() || null,
        price: Number(price),
        stock: Number(stock),
        imageUrl: imageUrl?.trim() || null,
        category: category?.trim() || null,
        isActive: isActive ?? true,
      },
    });

    res.status(201).json(medicine);
  } catch (error) {
    console.log("ADD MEDICINE ERROR:", error);
    res.status(500).json({ message: "Failed to add medicine" });
  }
});

// GET ALL MEDICINES FOR ADMIN
router.get(
  "/medicines",
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const medicines = await prisma.medicine.findMany({
        orderBy: { createdAt: "desc" },
      });

      res.json(medicines);
    } catch (error) {
      console.log("GET ADMIN MEDICINES ERROR:", error);
      res.status(500).json({ message: "Failed to fetch medicines" });
    }
  }
);

// GET SINGLE MEDICINE
router.get(
  "/medicines/:id",
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const medicine = await prisma.medicine.findUnique({
        where: { id: req.params.id },
      });

      if (!medicine) {
        res.status(404).json({ message: "Medicine not found" });
        return;
      }

      res.json(medicine);
    } catch (error) {
      console.log("GET ONE MEDICINE ERROR:", error);
      res.status(500).json({ message: "Failed to fetch medicine" });
    }
  }
);

// UPDATE MEDICINE
router.put(
  "/medicines/:id",
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const {
        name,
        description,
        price,
        stock,
        imageUrl,
        category,
        isActive,
      } = req.body as {
        name?: string;
        description?: string | null;
        price?: number;
        stock?: number;
        imageUrl?: string | null;
        category?: string | null;
        isActive?: boolean;
      };

      const existing = await prisma.medicine.findUnique({
        where: { id: req.params.id },
      });

      if (!existing) {
        res.status(404).json({ message: "Medicine not found" });
        return;
      }

      const medicine = await prisma.medicine.update({
        where: { id: req.params.id },
        data: {
          ...(name !== undefined ? { name: String(name).trim() } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(price !== undefined ? { price: Number(price) } : {}),
          ...(stock !== undefined ? { stock: Number(stock) } : {}),
          ...(imageUrl !== undefined ? { imageUrl } : {}),
          ...(category !== undefined ? { category } : {}),
          ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
        },
      });

      res.json(medicine);
    } catch (error) {
      console.log("UPDATE MEDICINE ERROR:", error);
      res.status(500).json({ message: "Failed to update medicine" });
    }
  }
);

// DELETE MEDICINE
router.delete(
  "/medicines/:id",
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const existing = await prisma.medicine.findUnique({
        where: { id: req.params.id },
      });

      if (!existing) {
        res.status(404).json({ message: "Medicine not found" });
        return;
      }

      const linkedCartItems = await prisma.cartItem.count({
        where: { medicineId: req.params.id },
      });

      const linkedOrderItems = await prisma.orderItem.count({
        where: { medicineId: req.params.id },
      });

      if (linkedCartItems > 0 || linkedOrderItems > 0) {
        res.status(400).json({
          message:
            "Cannot delete medicine because it is already used in cart or orders. Mark it inactive instead.",
        });
        return;
      }

      await prisma.medicine.delete({
        where: { id: req.params.id },
      });

      res.json({ message: "Medicine deleted successfully" });
    } catch (error) {
      console.log("DELETE MEDICINE ERROR:", error);
      res.status(500).json({ message: "Failed to delete medicine" });
    }
  }
);

// GET ALL ORDERS FOR ADMIN
router.get("/orders", async (_req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        items: {
          include: {
            medicine: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(orders);
  } catch (error) {
    console.log("GET ADMIN ORDERS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// GET SINGLE ORDER FOR ADMIN
router.get(
  "/orders/:id",
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const order = await prisma.order.findUnique({
        where: { id: req.params.id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
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
    } catch (error) {
      console.log("GET ADMIN ORDER ERROR:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  }
);

// UPDATE ORDER STATUS
router.patch(
  "/orders/:id/status",
  async (
    req: Request<{ id: string }, {}, UpdateOrderStatusBody>,
    res: Response
  ): Promise<void> => {
    try {
      const { status } = req.body;

      if (!status || !["PENDING", "CONFIRMED", "CANCELLED"].includes(status)) {
        res.status(400).json({
          message: "Valid status is required",
        });
        return;
      }

      const existing = await prisma.order.findUnique({
        where: { id: req.params.id },
        include: { items: true },
      });

      if (!existing) {
        res.status(404).json({ message: "Order not found" });
        return;
      }

      if (existing.status === status) {
        res.json(existing);
        return;
      }

      if (existing.status === "CANCELLED" && status !== "CANCELLED") {
        res.status(400).json({
          message: "Cancelled order cannot be changed to another status",
        });
        return;
      }

      if (status === "CANCELLED" && existing.status !== "CANCELLED") {
        const updatedOrder = await prisma.$transaction(async (tx) => {
          for (const item of existing.items) {
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
            where: { id: req.params.id },
            data: { status: "CANCELLED" },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  role: true,
                },
              },
              items: {
                include: {
                  medicine: true,
                },
              },
            },
          });
        });

        res.json({
          message: "Order status updated successfully",
          order: updatedOrder,
        });
        return;
      }

      const updatedOrder = await prisma.order.update({
        where: { id: req.params.id },
        data: { status },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          items: {
            include: {
              medicine: true,
            },
          },
        },
      });

      res.json({
        message: "Order status updated successfully",
        order: updatedOrder,
      });
    } catch (error) {
      console.log("UPDATE ORDER STATUS ERROR:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  }
);

// OPTIONAL DASHBOARD STATS
router.get("/stats", async (_req: Request, res: Response): Promise<void> => {
  try {
    const [users, doctors, medicines, orders, appointments] = await Promise.all(
      [
        prisma.user.count(),
        prisma.doctor.count(),
        prisma.medicine.count(),
        prisma.order.count(),
        prisma.appointment.count(),
      ]
    );

    res.json({
      users,
      doctors,
      medicines,
      orders,
      appointments,
    });
  } catch (error) {
    console.log("ADMIN STATS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

export default router;