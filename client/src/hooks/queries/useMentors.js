import { useQuery } from "@tanstack/react-query";
import { mentorApi } from "../../api/mentorApi";

export const useMentors = (params) => {
    return useQuery({
        queryKey: ["mentors", params],
        queryFn: () => mentorApi.getMentors(params),
        keepPreviousData: true, // Useful for pagination
    });
};

export const useTopMentors = () => {
    return useQuery({
        queryKey: ["top-mentors"],
        queryFn: mentorApi.getTopMentors,
    });
};

export const useMentorProfile = (id) => {
    return useQuery({
        queryKey: ["mentor", id],
        queryFn: () => mentorApi.getMentorProfile(id),
        enabled: !!id,
    });
};
