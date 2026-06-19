import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doubtApi } from "../../api/doubtApi";

export const useDoubts = (params) => {
    return useQuery({
        queryKey: ["doubts", params],
        queryFn: () => doubtApi.getDoubts(params),
        keepPreviousData: true,
    });
};

export const useDoubt = (id) => {
    return useQuery({
        queryKey: ["doubt", id],
        queryFn: () => doubtApi.getDoubtById(id),
        enabled: !!id,
    });
};

export const useCreateDoubt = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => doubtApi.createDoubt(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["doubts"] });
        },
    });
};

export const useUpvoteDoubt = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => doubtApi.upvoteDoubt(id),
        onMutate: async (id) => {
            // Optimistic update
            await queryClient.cancelQueries({ queryKey: ["doubts"] });
            await queryClient.cancelQueries({ queryKey: ["doubt", id] });
            
            // Note: In a real app, you'd calculate the optimistic state here
            // and apply it using queryClient.setQueryData
        },
        onSettled: (data, error, id) => {
            queryClient.invalidateQueries({ queryKey: ["doubts"] });
            queryClient.invalidateQueries({ queryKey: ["doubt", id] });
        },
    });
};
