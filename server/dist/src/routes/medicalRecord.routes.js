import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { decryptMedicalRecordContent, encryptMedicalRecordContent, } from "../lib/medicalRecordCrypto.js";
const router = Router();
const createRecordSchema = z.object({
    patientId: z.string().min(1).optional(),
    title: z.string().min(3).max(120),
    recordType: z.string().min(2).max(40),
    content: z.string().min(5).max(10000),
    eventAt: z.string().datetime().optional(),
});
async function doctorCanAccessPatient(doctorUserId, patientId) {
    const appointment = await prisma.appointment.findFirst({
        where: {
            userId: patientId,
            doctor: { userId: doctorUserId },
        },
        select: { id: true },
    });
    return Boolean(appointment);
}
function formatRecord(record) {
    return {
        id: record.id,
        patientId: record.patientId,
        createdByUserId: record.createdByUserId,
        createdByRole: record.createdByRole,
        title: record.title,
        recordType: record.recordType,
        content: decryptMedicalRecordContent(record.encryptedContent),
        eventAt: record.eventAt,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        patient: record.patient,
        createdBy: record.createdBy,
    };
}
router.get("/my", requireAuth, requireRole("PATIENT"), async (req, res) => {
    try {
        const records = await prisma.medicalRecord.findMany({
            where: { patientId: req.user.id },
            include: {
                patient: { select: { id: true, email: true } },
                createdBy: { select: { id: true, email: true, role: true } },
            },
            orderBy: [{ eventAt: "desc" }, { createdAt: "desc" }],
        });
        res.json(records.map(formatRecord));
    }
    catch (error) {
        console.error("GET MY MEDICAL RECORDS ERROR:", error);
        res.status(500).json({ message: "Failed to fetch medical records" });
    }
});
router.get("/doctor/patients", requireAuth, requireRole("DOCTOR"), async (req, res) => {
    try {
        const appointments = await prisma.appointment.findMany({
            where: {
                doctor: { userId: req.user.id },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        const uniquePatients = new Map();
        for (const appointment of appointments) {
            uniquePatients.set(appointment.user.id, appointment.user);
        }
        res.json(Array.from(uniquePatients.values()));
    }
    catch (error) {
        console.error("GET DOCTOR PATIENTS ERROR:", error);
        res.status(500).json({ message: "Failed to fetch doctor patients" });
    }
});
router.get("/patient/:patientId", requireAuth, requireRole("DOCTOR"), async (req, res) => {
    try {
        const { patientId } = req.params;
        const canAccess = await doctorCanAccessPatient(req.user.id, patientId);
        if (!canAccess) {
            return res
                .status(403)
                .json({ message: "You can only view records for your own patients" });
        }
        const records = await prisma.medicalRecord.findMany({
            where: { patientId },
            include: {
                patient: { select: { id: true, email: true } },
                createdBy: { select: { id: true, email: true, role: true } },
            },
            orderBy: [{ eventAt: "desc" }, { createdAt: "desc" }],
        });
        res.json(records.map(formatRecord));
    }
    catch (error) {
        console.error("GET PATIENT MEDICAL RECORDS ERROR:", error);
        res.status(500).json({ message: "Failed to fetch patient medical records" });
    }
});
router.post("/", requireAuth, async (req, res) => {
    try {
        const parsed = createRecordSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Invalid medical record payload",
                issues: parsed.error.flatten(),
            });
        }
        const { patientId, title, recordType, content, eventAt } = parsed.data;
        let targetPatientId = req.user.id;
        if (req.user.role === "DOCTOR") {
            if (!patientId) {
                return res
                    .status(400)
                    .json({ message: "patientId is required when doctor creates a record" });
            }
            const canAccess = await doctorCanAccessPatient(req.user.id, patientId);
            if (!canAccess) {
                return res
                    .status(403)
                    .json({ message: "You can only create records for your own patients" });
            }
            targetPatientId = patientId;
        }
        else if (req.user.role === "PATIENT") {
            if (patientId && patientId !== req.user.id) {
                return res
                    .status(403)
                    .json({ message: "Patients can only create their own records" });
            }
        }
        else {
            return res.status(403).json({ message: "Role not allowed for medical records" });
        }
        const patient = await prisma.user.findUnique({
            where: { id: targetPatientId },
            select: { id: true, email: true, role: true },
        });
        if (!patient || patient.role !== "PATIENT") {
            return res.status(404).json({ message: "Patient not found" });
        }
        const encryptedContent = encryptMedicalRecordContent(content);
        const created = await prisma.medicalRecord.create({
            data: {
                patientId: targetPatientId,
                createdByUserId: req.user.id,
                createdByRole: req.user.role,
                title,
                recordType,
                encryptedContent,
                eventAt: eventAt ? new Date(eventAt) : new Date(),
            },
            include: {
                patient: { select: { id: true, email: true } },
                createdBy: { select: { id: true, email: true, role: true } },
            },
        });
        res.status(201).json(formatRecord(created));
    }
    catch (error) {
        console.error("CREATE MEDICAL RECORD ERROR:", error);
        res.status(500).json({ message: "Failed to create medical record" });
    }
});
export default router;
