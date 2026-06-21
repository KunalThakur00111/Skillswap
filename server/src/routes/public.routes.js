import { Router } from "express";
import { getPlatformStats, getTopMentors, getMentorProfile } from "../controllers/public.controller.js";
import { mentorDiagnostic } from "../controllers/dev.controller.js";
import { optionalProtect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/stats", getPlatformStats);
router.get("/mentors/top", optionalProtect, getTopMentors);
router.get("/mentors/:id", optionalProtect, getMentorProfile);
router.get("/diagnostic", mentorDiagnostic);

export default router;
