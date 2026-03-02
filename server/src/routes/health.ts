import { Router } from "express";

const router = Router();

router.get("/health", async (req, res) => {
  res.json({"status":"OK"});
});

export default router;