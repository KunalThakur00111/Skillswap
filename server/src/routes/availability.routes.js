import { Router } from "express";
import { getMyAvailability, updateMyAvailability, getAvailableSlots } from "../controllers/availability.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/me", protect, getMyAvailability);
router.put("/me", protect, updateMyAvailability);
router.get("/slots/:mentorId", protect, getAvailableSlots);

export default router;
