import axiosClient from "./axiosClient";

export const doubtApi = {
    getDoubts: async (params) => {
        return await axiosClient.get("/doubts", { params });
    },
    
    getDoubtById: async (id) => {
        return await axiosClient.get(`/doubts/${id}`);
    },
    
    createDoubt: async (data) => {
        return await axiosClient.post("/doubts", data);
    },
    
    upvoteDoubt: async (id) => {
        return await axiosClient.put(`/doubts/${id}/upvote`);
    },
    
    downvoteDoubt: async (id) => {
        return await axiosClient.put(`/doubts/${id}/downvote`);
    },
    
    addReply: async (doubtId, data) => {
        return await axiosClient.post(`/doubts/${doubtId}/reply`, data);
    },
    
    upvoteReply: async (replyId) => {
        return await axiosClient.put(`/doubts/replies/${replyId}/upvote`);
    },
    
    downvoteReply: async (replyId) => {
        return await axiosClient.put(`/doubts/replies/${replyId}/downvote`);
    },
    
    acceptAnswer: async (doubtId, replyId) => {
        return await axiosClient.put(`/doubts/${doubtId}/accept/${replyId}`);
    }
};
