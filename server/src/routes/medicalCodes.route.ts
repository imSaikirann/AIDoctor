import express from "express";


const router = express.Router();

export const medicalCodes = [
  {
    id: "1",
    code: "B34.9",
    condition: "Viral infection",
    description: "Viral infection, unspecified"
  },
  {
    id: "2",
    code: "J06.9",
    condition: "Common Cold",
    description: "Acute upper respiratory infection"
  },
  {
    id: "3",
    code: "E11",
    condition: "Type 2 Diabetes",
    description: "Type 2 diabetes mellitus"
  },
  {
    id: "4",
    code: "I10",
    condition: "Hypertension",
    description: "Essential hypertension"
  }
];
// get all codes
router.get("/medical-codes", (req, res) => {
  res.json(medicalCodes);
});

// search codes
router.get("/medical-codes/search", (req, res) => {
  const q = (req.query.q as string)?.toLowerCase();

  const result = medicalCodes.filter(
    (c) =>
      c.condition.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
  );

  res.json(result);
});

// single code
router.get("/medical-codes/:id", (req, res) => {
  const code = medicalCodes.find((c) => c.id === req.params.id);

  if (!code) {
    return res.status(404).json({ message: "Not found" });
  }

  res.json(code);
});

export default router;