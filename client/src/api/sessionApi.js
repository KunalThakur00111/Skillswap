import axiosClient from "./axiosClient";

export const sessionApi = {
    getMySessions: async (params) => {
        return await axiosClient.get("/sessions", { params });
    },
    
    getSessionById: async (id) => {
        return await axiosClient.get(`/sessions/${id}`);
    },
    
    requestSession: async (data) => {
        return await axiosClient.post("/sessions/request", data);
    },
    
    acceptSession: async (id) => {
        return await axiosClient.put(`/sessions/${id}/accept`);
    },
    
    rejectSession: async (id, reason) => {
        return await axiosClient.put(`/sessions/${id}/reject`, { reason });
    },
    
    scheduleSession: async (id, data) => {
        return await axiosClient.put(`/sessions/${id}/schedule`, data);
    },
    
    startSession: async (id) => {
        return await axiosClient.put(`/sessions/${id}/start`);
    },
    
    completeSession: async (id) => {
        return await axiosClient.put(`/sessions/${id}/complete`);
    },
    
    confirmSession: async (id) => {
        return await axiosClient.put(`/sessions/${id}/confirm`);
    },
    
    cancelSession: async (id, reason) => {
        return await axiosClient.put(`/sessions/${id}/cancel`, { reason });
    }
};
