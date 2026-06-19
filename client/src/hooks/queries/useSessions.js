import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionApi } from "../../api/sessionApi";

export const useSessions = (params) => {
    return useQuery({
        queryKey: ["sessions", params],
        queryFn: () => sessionApi.getMySessions(params),
        keepPreviousData: true,
    });
};

export const useSession = (id) => {
    return useQuery({
        queryKey: ["session", id],
        queryFn: () => sessionApi.getSessionById(id),
        enabled: !!id,
    });
};

export const useAcceptSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => sessionApi.acceptSession(id),
        onSuccess: (data, id) => {
            queryClient.invalidateQueries({ queryKey: ["sessions"] });
            queryClient.invalidateQueries({ queryKey: ["session", id] });
        },
    });
};

export const useRequestSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => sessionApi.requestSession(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sessions"] });
        },
    });
};
