import { Router } from "express";
import {
    getAdminStats,
    getAllUsers,
    blockUser,
    unblockUser,
    makeUserAdmin,
    getAllSessionsForAdmin,
    resolveDispute
} from "../controllers/admin.controller.js";
import { protect, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/stats", protect, requireAdmin, getAdminStats);
router.get("/users", protect, requireAdmin, getAllUsers);
router.patch("/users/:id/block", protect, requireAdmin, blockUser);
router.patch("/users/:id/unblock", protect, requireAdmin, unblockUser);
router.patch("/users/:id/make-admin", protect, requireAdmin, makeUserAdmin);
router.get("/sessions", protect, requireAdmin, getAllSessionsForAdmin);
router.patch("/sessions/:id/resolve-dispute", protect, requireAdmin, resolveDispute);

export default router;