import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { getIO, getUserSocketId } from "../socket.js";
import { sendNotificationEmail } from "../utils/sendEmail.js";

// Types that trigger emails
const EMAIL_TRIGGERS = [
    "session_request",
    "session_accepted",
    "session_cancelled",
    "session_starting_soon"
];

export const createNotification = async ({
    recipient,
    type,
    title,
    message,
    relatedEntity = null,
    relatedEntityType = ""
}) => {
    try {
        // 1. Save to database
        const notification = await Notification.create({
            recipient,
            type,
            title,
            message,
            relatedEntity,
            relatedEntityType
        });

        // 2. Real-time emit if user is online
        try {
            const io = getIO();
            const socketId = getUserSocketId(recipient);
            
            if (socketId) {
                // emit the new notification to the specific user's socket
                io.to(socketId).emit("receive_notification", notification);
            }
        } catch (socketErr) {
            console.error("Socket error during notification:", socketErr);
        }

        // 3. Send email if it's a high priority trigger
        if (EMAIL_TRIGGERS.includes(type)) {
            const user = await User.findById(recipient);
            if (user && user.email) {
                // Background email sending
                sendNotificationEmail(user.email, title, message).catch(err => {
                    console.error("Failed to send notification email:", err);
                });
            }
        }

        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        // Do not crash the caller if notification fails, just log it.
        return null;
    }
};

export const broadcastNotification = async (
    senderId,
    type,
    title,
    message,
    relatedEntityType = "",
    relatedEntity = null
) => {
    try {
        // We will broadcast the notification to all connected users except the sender
        // To not overwhelm the DB with hundreds of notifications for a "new doubt" broadcast,
        // we might only emit via socket, or we could just skip saving it to the DB if it's a global feed item.
        // For now, we will just emit to all connected sockets.
        
        try {
            const io = getIO();
            
            // Broadcast to all clients
            io.emit("receive_notification", {
                recipient: "all",
                type,
                title,
                message,
                relatedEntity,
                relatedEntityType,
                createdAt: new Date(),
                isRead: false
            });
        } catch (socketErr) {
            console.error("Socket error during broadcast:", socketErr);
        }

        return true;
    } catch (error) {
        console.error("Error broadcasting notification:", error);
        return false;
    }
};
