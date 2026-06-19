import { Router } from "express";
import { getPlatformStats, getTopMentors, getMentorProfile } from "../controllers/public.controller.js";

const router = Router();

router.get("/stats", getPlatformStats);
router.get("/mentors/top", getTopMentors);
router.get("/mentors/:id", getMentorProfile);

export default router;
