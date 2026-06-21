import Notification from "../models/Notification.js";
import { invalidateCache } from "../config/redis.js";

// @desc    Get all notifications for the logged in user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const total = await Notification.countDocuments({ recipient: req.user._id });
        const totalPages = Math.ceil(total / limit);
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        res.json({
            success: true,
            data: notifications,
            meta: {
                total,
                page,
                limit,
                totalPages
            }
        });
    } catch (error) {
        console.error("Get notifications error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ 
            recipient: req.user._id, 
            isRead: false 
        });

        res.json({
            success: true,
            count
        });
    } catch (error) {
        console.error("Get unread count error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Mark a specific notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        await invalidateCache(`notifications:${req.user._id}:*`);

        res.json({
            success: true,
            notification
        });
    } catch (error) {
        console.error("Mark as read error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );

        await invalidateCache(`notifications:${req.user._id}:*`);

        res.json({
            success: true,
            message: "All notifications marked as read"
        });
    } catch (error) {
        console.error("Mark all as read error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
