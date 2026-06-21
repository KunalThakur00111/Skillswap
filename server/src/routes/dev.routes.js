import { Router } from "express";
import { createTestUser, mentorDiagnostic } from "../controllers/dev.controller.js";

const router = Router();

router.post("/test-user", createTestUser);
router.get("/mentors-diagnostic", mentorDiagnostic);

export default router;