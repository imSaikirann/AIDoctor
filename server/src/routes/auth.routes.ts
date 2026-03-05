import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const router = Router();

// PATIENT REGISTER
router.post("/register/patient", async (req, res) => {
  const { email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      role: "PATIENT"
    }
  });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET as string
  );

  res.cookie("token", token, { httpOnly: true });

  res.json(user);
});

// DOCTOR REGISTER
router.post("/register/doctor", async (req, res) => {
  const { email, password, name, specialization, calLink } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      role: "DOCTOR",
      doctorProfile: {
        create: {
          name,
          specialization,
          calLink
        }
      }
    },
    include: { doctorProfile: true }
  });

  res.json({
    message: "Doctor registered, waiting for admin approval",
    user
  });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { doctorProfile: true }
  });

  if (!user) return res.status(401).json({ message: "Invalid" });

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) return res.status(401).json({ message: "Invalid" });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET as string
  );

  res.cookie("token", token, { httpOnly: true });

  res.json(user);
});

export default router;