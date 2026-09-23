import {getUrls} from "@/api/url-api";
import {useQuery} from "@tanstack/react-query";

export function useUrls(page: number, pageSize: number = 10) {
    return useQuery({
        queryKey: ['urls', page, pageSize],
        queryFn: () => getUrls(page, pageSize),
        staleTime: 0
    });
}