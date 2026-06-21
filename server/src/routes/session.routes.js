import { Router } from "express";
import {
    requestSession,
    getMySessions,
    acceptSession,
    rejectSession,
    cancelSession,
    completeSession,
    scheduleSession,
    startSession,
    confirmSession,
    disputeSession,
    reportNoShow,
    getAllDisputes,
    resolveDispute
} from "../controllers/session.controller.js";
import { protect, requireAdmin } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
    requestSessionSchema,
    scheduleSessionSchema,
    sessionActionSchema,
    disputeSessionSchema
} from "../validations/session.validation.js";
import chatRoutes from "./chat.routes.js";

const router = Router();

router.post("/request", protect, validate(requestSessionSchema), requestSession);
router.get("/", protect, getMySessions);
router.patch("/:id/accept", protect, validate(sessionActionSchema), acceptSession);
router.patch("/:id/reject", protect, validate(sessionActionSchema), rejectSession);
router.patch("/:id/cancel", protect, validate(sessionActionSchema), cancelSession);
router.patch("/:id/schedule", protect, validate(scheduleSessionSchema), scheduleSession);
router.patch("/:id/start", protect, validate(sessionActionSchema), startSession);
router.patch("/:id/complete", protect, validate(sessionActionSchema), completeSession);
router.patch("/:id/confirm", protect, validate(sessionActionSchema), confirmSession);
router.patch("/:id/dispute", protect, validate(disputeSessionSchema), disputeSession);
router.patch("/:id/no-show", protect, validate(sessionActionSchema), reportNoShow);

router.use("/:id/chat", chatRoutes);

// Admin Routes
router.get("/disputes/all", protect, requireAdmin, getAllDisputes);
router.patch("/:id/resolve-dispute", protect, requireAdmin, resolveDispute);

// Emergency Fix
router.get("/fix-self", async (req, res) => {
    try {
        const mongoose = await import("mongoose");
        const Session = (await import("../models/Session.js")).default;
        const sessions = await Session.find({ status: "pending" });
        let count = 0;
        for (let s of sessions) {
            if (s.learner.toString() === s.mentor.toString()) {
                s.status = "rejected";
                await s.save();
                count++;
            }
        }
        res.json({ message: `Fixed ${count} self-sessions` });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;