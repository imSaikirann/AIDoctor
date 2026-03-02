import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
dotenv.config();
const app = express();
// ✅ CORS setup (production ready)
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use(express.json());
// routes
app.use("/api/auth", authRoutes);
app.get("/health", (_, res) => {
    res.json({ status: "OK" });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
