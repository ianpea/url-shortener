import {deleteUrl} from "@/api/url-api";
import {useMutation, useQueryClient} from "@tanstack/react-query";

export function useDeleteUrl() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteUrl,
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: ["urls"]
            });
        }
    });
}