import axiosClient from "./axiosClient";

export const mentorApi = {
    getMentors: async (params) => {
        // params: { page, limit, search, skill, sort, minRating }
        return await axiosClient.get("/users/mentors", { params });
    },
    
    getTopMentors: async () => {
        return await axiosClient.get("/public/mentors/top");
    },
    
    getMentorProfile: async (id) => {
        return await axiosClient.get(`/public/mentors/${id}`);
    }
};
