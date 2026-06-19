import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "../../api/notificationApi";

export const useNotifications = (params) => {
    return useQuery({
        queryKey: ["notifications", params],
        queryFn: () => notificationApi.getNotifications(params),
        keepPreviousData: true,
    });
};

export const useUnreadCount = () => {
    return useQuery({
        queryKey: ["notifications", "unread"],
        queryFn: notificationApi.getUnreadCount,
        refetchInterval: 30000, // Refetch every 30 seconds
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => notificationApi.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};

export const useMarkAllAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: notificationApi.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};
