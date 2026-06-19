import { Router } from "express";
import {
    createReview,
    getMentorReviews,
    getMyGivenReviews
} from "../controllers/review.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", protect, createReview);
router.get("/my-given", protect, getMyGivenReviews);
router.get("/mentor/:mentorId", protect, getMentorReviews);

export default router;