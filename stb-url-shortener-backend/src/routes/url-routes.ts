import {Router} from "express";
import {countUrls, deleteUrlById, findUrlByShortCode, findUrls} from "../db/url.js";
import {
    deleteUrlRequestSchema,
    getUrlRequestSchema,
    paginationSchema,
    shortenUrlRequestSchema
} from "../schemas/url-schemas.js";
import {createShortUrl} from "../services/url-service.js";

export const urlRouter = Router();

urlRouter.post("/api/shorten", async (req, res) => {
    await simulateLatency();
    const result = shortenUrlRequestSchema.safeParse(req.body);
    if(!result.success) {
        return res.status(400).json({
            error: result.error.issues.map((issue) => issue.message).join(', '),
        });
    }

    const urlRecord = createShortUrl(result.data.url, result.data.expiryDate, result.data.tag);
    if(!urlRecord) {
        return res.status(400).json({
            error: "Unable to generate short url, please try again",
        });
    }

    res.status(201).json({shortCode: urlRecord.shortCode});
});

urlRouter.get("/api/urls", async (req, res) => {
    await simulateLatency();

    const parseResult = paginationSchema.safeParse(req.query);
    if(!parseResult.success) {
        return res.status(400).json({error: "Unable to retrieve history, please try again."});
    }

    const page = parseResult.data.page;
    const pageSize = parseResult.data.pageSize;
    const result = findUrls(page, pageSize);
    const total = countUrls();
    res.json({items: result, page, pageSize, total, totalPages: Math.ceil(total / pageSize)});
});

urlRouter.get("/api/urls/:shortCode", (req, res) => {
    const parseResult = getUrlRequestSchema.safeParse(req.params);

    if(!parseResult.success) {
        return res.status(400).json({
            error: "Invalid short code"
        });
    }
    const result = findUrlByShortCode(parseResult.data.shortCode);
    if(!result) {
        return res.status(400).json({
            error: "Short code not found"
        });
    }

    if(result.expiryDate && new Date(result.expiryDate) <= new Date()) {
        return res.status(400).json({expired: true, expiryDate: result.expiryDate, tag: result.tag});
    }

    res.json({url: result.originalUrl, expiryDate: result.expiryDate, tag: result.tag});
});

urlRouter.delete("/api/url", async (req, res) => {
    await simulateLatency();
    const parseResult = deleteUrlRequestSchema.safeParse(req.body);
    if(!parseResult.success) {
        return res.status(400).json({
            error: parseResult.error.issues.map(issue => issue.message).join(', ')
        });
    }

    const result = deleteUrlById(parseResult.data.id);
    if(result) {
        return res.status(201).send();
    } else {
        return res.status(400).json({error: "Unable to delete, please try again."});
    }
});

// Simulate network latency so loading states are observable during the demo.
async function simulateLatency(ms: number = 250): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
}
