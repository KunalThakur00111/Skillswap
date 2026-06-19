import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import {
    createDoubt,
    getDoubts,
    getDoubtById,
    updateDoubt,
    deleteDoubt,
    upvoteDoubt,
    bookmarkDoubt,
    getBookmarkedDoubts,
    getSimilarDoubts,
    getCommunityStats
} from "../controllers/doubt.controller.js";
import {
    createReply,
    updateReply,
    deleteReply,
    upvoteReply,
    acceptReply
} from "../controllers/reply.controller.js";

const router = express.optionalRouter ? express.Router() : express.Router();

// Doubt Routes
router.post("/", protect, upload.array("images", 5), createDoubt);
router.get("/", protect, getDoubts);
router.get("/bookmarked", protect, getBookmarkedDoubts);
router.get("/stats", protect, getCommunityStats);
router.get("/:id", protect, getDoubtById);
router.put("/:id", protect, updateDoubt);
router.delete("/:id", protect, deleteDoubt);
router.put("/:id/upvote", protect, upvoteDoubt);
router.put("/:id/bookmark", protect, bookmarkDoubt);
router.get("/:id/similar", protect, getSimilarDoubts);

// Reply Routes
router.post("/:doubtId/replies", protect, upload.array("images", 5), createReply);
router.put("/replies/:id", protect, updateReply);
router.delete("/replies/:id", protect, deleteReply);
router.put("/replies/:id/upvote", protect, upvoteReply);
router.put("/:doubtId/replies/:replyId/accept", protect, acceptReply);

export default router;
