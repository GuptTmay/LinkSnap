import { Router } from "express";
import { validate } from "../middlewares/requestValidate";
import { LoginSchema, SignupSchema } from "../schema/link";
import { BodyValidatedRequest } from "../types/validated-request";
import { authController } from "../controllers/auth";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();
router.post(`/signup`, validate({ body: SignupSchema }), (req, res) => authController.signup(req as BodyValidatedRequest<typeof SignupSchema>, res));
router.post("/signin", validate({ body: LoginSchema }), (req, res) => authController.signin(req as BodyValidatedRequest<typeof LoginSchema>, res));

// Protected route for testing purposes
router.post("/protected", requireAuth, (req, res) => res.status(200).json({ message: "Protected route accessed successfully", data: req.user }));

export default router;