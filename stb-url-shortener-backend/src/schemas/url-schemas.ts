import z from "zod";
import {normalizeUrl} from "../utils/url";

export const shortenUrlRequestSchema = z.object({
    url: z.string()
        .trim()
        .transform(normalizeUrl)
        .pipe(
            z.httpUrl()
        ),
    tag: z.string().trim().min(1).optional(),
    expiryDate: z.iso.datetime().refine((date) => new Date(date) > new Date(), {
        error: "Expiry date must be in the future"
    }).optional()
});

export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(5),
});

export const getUrlRequestSchema = z.object({
    shortCode: z.string().length(7)
});

export const deleteUrlRequestSchema = z.object({
    id: z.number()
});
