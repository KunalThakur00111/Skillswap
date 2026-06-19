import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { apiRequest } from "../api/api";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        
        if (userStr && token) {
            const user = JSON.parse(userStr);
            const newSocket = io(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "http://localhost:5000", {
                withCredentials: true,
            });

            newSocket.on("connect", () => {
                console.log("Socket connected:", newSocket.id);
                newSocket.emit("register", user.id);
            });

            newSocket.on("receive_notification", (notification) => {
                setNotifications((prev) => [notification, ...prev]);
                setUnreadCount((prev) => prev + 1);
            });

            setSocket(newSocket);

            // Fetch initial unread count
            const fetchUnreadCount = async () => {
                try {
                    const data = await apiRequest("/notifications/unread-count", {
                        token
                    });
                    if (data.success) {
                        setUnreadCount(data.count);
                    }
                } catch (error) {
                    console.error("Failed to fetch unread count", error);
                }
            };
            fetchUnreadCount();

            return () => {
                newSocket.disconnect();
            };
        }
    }, []);

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await apiRequest(`/notifications/${id}/read`, {
                method: "PUT",
                token
            });
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem("token");
            await apiRequest("/notifications/read-all", {
                method: "PUT",
                token
            });
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    return (
        <SocketContext.Provider value={{ 
            socket, 
            unreadCount, 
            setUnreadCount, 
            notifications, 
            setNotifications,
            markAsRead,
            markAllAsRead
        }}>
            {children}
        </SocketContext.Provider>
    );
};
