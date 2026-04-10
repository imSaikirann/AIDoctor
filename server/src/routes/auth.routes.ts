import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const router = Router();

const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email address")
  .transform((value) => value.toLowerCase());

const patientRegistrationSchema = z.object({
  email: emailSchema,
  password: z.string().trim().min(6, "Password must be at least 6 characters"),
});

const doctorRegistrationSchema = patientRegistrationSchema.extend({
  name: z.string().trim().min(2, "Doctor name must be at least 2 characters"),
  specialization: z
    .string()
    .trim()
    .min(2, "Specialization must be at least 2 characters"),
  calLink: z
    .union([z.string().trim().url("Please enter a valid booking link"), z.literal("")])
    .optional()
    .transform((value) => (value ? value.trim() : undefined)),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

function getValidationMessage(error: z.ZodError) {
  const issue = error.issues[0];
  return issue?.message ?? "Invalid request payload";
}

// PATIENT REGISTER
router.post("/register/patient", async (req, res) => {
    try {
      const parsed = patientRegistrationSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          message: getValidationMessage(parsed.error),
          issues: parsed.error.flatten(),
        });
        return;
      }

      const { email, password } = parsed.data;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.status(409).json({ message: "Email already registered" });
        return;
      }

      const hashed = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashed,
          role: "PATIENT",
        },
      });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET as string
      );

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      res.status(201).json(user);
    } catch (error: unknown) {
      console.log("REGISTER PATIENT ERROR:", error);

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        res.status(409).json({ message: "Email already registered" });
        return;
      }

      res.status(500).json({ message: "Failed to register patient" });
    }
  });

// DOCTOR REGISTER
router.post("/register/doctor", async (req, res) =>{
    try {
      const parsed = doctorRegistrationSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          message: getValidationMessage(parsed.error),
          issues: parsed.error.flatten(),
        });
        return;
      }

      const { email, password, name, specialization, calLink } = parsed.data;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.status(409).json({ message: "Email already registered" });
        return;
      }

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
              calLink: calLink || null,
            },
          },
        },
        include: { doctorProfile: true },
      });

      res.status(201).json({
        message: "Doctor registered, waiting for admin approval",
        user,
      });
    } catch (error: unknown) {
      console.log("REGISTER DOCTOR ERROR:", error);

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        res.status(409).json({ message: "Email already registered" });
        return;
      }

      res.status(500).json({ message: "Failed to register doctor" });
    }
  });

// LOGIN
router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: getValidationMessage(parsed.error),
      issues: parsed.error.flatten(),
    });
  }

  const { email, password } = parsed.data;

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

// LOGOUT
router.post("/logout", (_req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
  });

  res.json({ message: "Logged out successfully" });
});

type JwtPayload = {
  id: string;
  role: "ADMIN" | "DOCTOR" | "PATIENT";
};

router.get("/me", async (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { doctorProfile: true }
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json(user);
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
});

export default router;
