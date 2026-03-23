import { Router } from "express";
import { groq } from "../lib/groq.js";
const router = Router();
router.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ message: "Message required" });
        }
        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful medical assistant. Provide informational guidance only. Always recommend consulting a doctor.",
                },
                {
                    role: "user",
                    content: message,
                },
            ],
            temperature: 0.4,
        });
        const reply = completion.choices?.[0]?.message?.content || "No response";
        res.json({ reply });
    }
    catch (err) {
        console.error("AI CHAT ERROR:", err);
        res.status(500).json({ message: "AI failed" });
    }
});
router.post("/triage", async (req, res) => {
    try {
        const { message } = req.body;
        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            temperature: 0.2,
            messages: [
                {
                    role: "system",
                    content: `
You are a medical triage assistant.

Return STRICT JSON in this format:

{
  "riskLevel": "LOW | MEDIUM | HIGH",
  "possibleConditions": ["condition1"],
  "advice": "short advice",
  "seeDoctor": true
}

Be cautious. Never diagnose definitively.
`,
                },
                {
                    role: "user",
                    content: message,
                },
            ],
        });
        const text = completion.choices?.[0]?.message?.content || "{}";
        res.json({ raw: text });
    }
    catch (err) {
        console.error("TRIAGE ERROR:", err);
        res.status(500).json({ message: "Triage failed" });
    }
});
export default router;
