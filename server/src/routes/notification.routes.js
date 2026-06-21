import express from "express";
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
} from "../controllers/notification.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { cacheRoute } from "../middleware/cache.middleware.js";

const router = express.Router();

// All notification routes are protected
router.use(protect);

router.get("/", cacheRoute("notifications", 30), getNotifications);
router.get("/unread-count", cacheRoute("notifications", 30), getUnreadCount);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);

export default router;
