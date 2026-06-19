import { Router } from "express";
import {
    getMyProfile,
    updateMyProfile,
    getMentors
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/profile", protect, getMyProfile);
router.put("/profile", protect, updateMyProfile);
router.get("/mentors", protect, getMentors);

export default router;