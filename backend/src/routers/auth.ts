import { Router } from "express";
import { authController } from "../controllers/auth";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();
router.post("/google", (req, res) => authController.googleAuth(req, res));

// Protected route for testing purposes
router.post("/protected", requireAuth, (req, res) => res.status(200).json({ message: "Protected route accessed successfully", data: req.user }));

export default router;