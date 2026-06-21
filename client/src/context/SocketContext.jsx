import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const queryClient = useQueryClient();

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
                // Invalidate react query cache for all notification-related queries
                // This triggers an immediate refetch for any active hooks like useUnreadCount
                queryClient.invalidateQueries({ queryKey: ["notifications"] });
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [queryClient]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
