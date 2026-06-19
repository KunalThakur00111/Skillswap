import axiosClient from "./axiosClient";

export const notificationApi = {
    getNotifications: async (params) => {
        return await axiosClient.get("/notifications", { params });
    },
    
    getUnreadCount: async () => {
        return await axiosClient.get("/notifications/unread-count");
    },
    
    markAsRead: async (id) => {
        return await axiosClient.put(`/notifications/${id}/read`);
    },
    
    markAllAsRead: async () => {
        return await axiosClient.put("/notifications/read-all");
    }
};
