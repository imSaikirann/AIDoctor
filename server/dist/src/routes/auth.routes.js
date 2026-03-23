import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
const router = Router();
// PATIENT REGISTER
router.post("/register/patient", async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password?.trim();
        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required" });
            return;
        }
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
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });
        res.status(201).json(user);
    }
    catch (error) {
        console.log("REGISTER PATIENT ERROR:", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002") {
            res.status(409).json({ message: "Email already registered" });
            return;
        }
        res.status(500).json({ message: "Failed to register patient" });
    }
});
// DOCTOR REGISTER
router.post("/register/doctor", async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password?.trim();
        const name = req.body.name?.trim();
        const specialization = req.body.specialization?.trim();
        const calLink = req.body.calLink?.trim();
        if (!email || !password || !name || !specialization) {
            res.status(400).json({
                message: "Email, password, name and specialization are required",
            });
            return;
        }
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
    }
    catch (error) {
        console.log("REGISTER DOCTOR ERROR:", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002") {
            res.status(409).json({ message: "Email already registered" });
            return;
        }
        res.status(500).json({ message: "Failed to register doctor" });
    }
});
// LOGIN
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
        where: { email },
        include: { doctorProfile: true }
    });
    if (!user)
        return res.status(401).json({ message: "Invalid" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
        return res.status(401).json({ message: "Invalid" });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
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
router.get("/me", async (req, res) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            include: { doctorProfile: true }
        });
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        res.json(user);
    }
    catch {
        res.status(401).json({ message: "Invalid token" });
    }
});
export default router;
