import {shortenUrl} from "@/api/url-api";
import {useMutation} from "@tanstack/react-query";

export function useShortenUrl() {
    return useMutation({
        mutationFn: shortenUrl
    });
}