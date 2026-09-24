import express from "express";
import cors from "cors";
import z from "zod";
import {countUrls, deleteUrlById, findUrlByShortCode, findUrls} from "./db/url";
import {createShortUrl} from "./services/url-service";

export const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const shortenUrlRequestSchema = z.object({
    url: z.string()
        .trim()
        .transform(normalizeUrl)
        .pipe(
            z.httpUrl()
        ),
    expiryDate: z.iso.datetime().refine((date) => new Date(date) > new Date(), {
        error: "Expiry date must be in the future"
    }).optional()
});
app.post("/api/shorten", async (req, res) => {
    await sleep();
    const result = shortenUrlRequestSchema.safeParse(req.body);
    // console.log(normalizeUrl(req.body.url));
    if(!result.success) {
        return res.status(400).json({
            error: result.error.issues.map((issue) => issue.message).join(', '),
        });
    }

    const urlRecord = createShortUrl(result.data.url, result.data.expiryDate);
    if(!urlRecord) {
        return res.status(400).json({
            error: "Unable to generate short url, please try again",
        });
    }

    res.status(201).json({shortCode: urlRecord.shortCode});
});

const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(5),
});
app.get("/api/urls", async (req, res) => {
    await sleep(250);

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

const getUrlRequestSchema = z.object({
    shortCode: z.string().length(7)
});
app.get("/api/urls/:shortCode", (req, res) => {
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
        return res.status(400).json({expired: true, expiryDate: result.expiryDate});
    }

    res.json({url: result.originalUrl, expiryDate: result.expiryDate});
});

const deleteSchema = z.object({id: z.number()});
app.delete("/api/url", async (req, res) => {
    await sleep(1000);
    const parseResult = deleteSchema.safeParse(req.body);
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

// Skipped while running tests so importing `app` doesn't bind the port.
if(process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`Session started at http:;//localhost:${PORT}`);
    });
}

function sleep(ms: number = 250): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function normalizeUrl(url: string): string {
    if(url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    return `https://${url}`;
}