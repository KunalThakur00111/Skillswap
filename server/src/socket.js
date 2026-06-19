import { Server } from "socket.io";
import Message from "./models/Message.js";
import Session from "./models/Session.js";

let io;
const userSockets = new Map(); // Map to store userId -> socketId

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        socket.on("register", (userId) => {
            if (userId) {
                userSockets.set(userId.toString(), socket.id);
                console.log(`User ${userId} registered with socket ${socket.id}`);
            }
        });

        // Chat Events
        socket.on("join_session_chat", (sessionId) => {
            socket.join(sessionId);
            console.log(`Socket ${socket.id} joined session room ${sessionId}`);
        });

        socket.on("leave_session_chat", (sessionId) => {
            socket.leave(sessionId);
        });

        socket.on("typing_start", ({ sessionId, userId }) => {
            socket.to(sessionId).emit("user_typing", { userId });
        });

        socket.on("typing_end", ({ sessionId, userId }) => {
            socket.to(sessionId).emit("user_stopped_typing", { userId });
        });

        socket.on("send_message", async (data) => {
            try {
                const { sessionId, senderId, content } = data;
                
                // Save to DB
                const newMessage = new Message({
                    session: sessionId,
                    sender: senderId,
                    content
                });
                await newMessage.save();

                const populatedMessage = await Message.findById(newMessage._id).populate("sender", "name avatar");

                // Broadcast to room
                io.to(sessionId).emit("receive_message", populatedMessage);

            } catch (error) {
                console.error("Error sending message via socket", error);
            }
        });

        socket.on("mark_as_read", async ({ sessionId, userId }) => {
            try {
                // Mark all unread messages in this session NOT sent by this user as read
                await Message.updateMany(
                    { session: sessionId, sender: { $ne: userId }, isRead: false },
                    { $set: { isRead: true } }
                );
                
                io.to(sessionId).emit("messages_read", { readBy: userId });
            } catch (error) {
                console.error("Error marking messages as read", error);
            }
        });

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id}`);
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    break;
                }
            }
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

export const getUserSocketId = (userId) => {
    return userSockets.get(userId.toString());
};
