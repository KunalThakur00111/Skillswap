import { Router } from "express";
import {
    getMyProfile,
    updateMyProfile,
    getMentors
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { cacheRoute } from "../middleware/cache.middleware.js";

const router = Router();

router.get("/profile", protect, getMyProfile);
router.put("/profile", protect, updateMyProfile);
router.get("/mentors", protect, cacheRoute("mentors", 60), getMentors);

export default router;