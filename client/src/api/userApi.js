import axiosClient from "./axiosClient";

export const userApi = {
    getProfile: async () => {
        return await axiosClient.get("/users/profile");
    },
    
    updateProfile: async (data) => {
        return await axiosClient.put("/users/profile", data);
    },
    
    getCreditTransactions: async (params) => {
        return await axiosClient.get("/credits/transactions", { params });
    }
};
