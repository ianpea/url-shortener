import path from "node:path";
import {defineConfig} from "vitest/config";

// End-to-end suite: boots the real Express app on a real port and drives the
// frontend's API layer against it over HTTP. Run with `npm run test:e2e`.
export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "../src"),
        },
    },
    test: {
        environment: "node",
        globals: true,
        include: ["e2e/**/*.e2e.test.ts"],
        // Keeps the backend on its throwaway in-memory database.
        env: {
            DB_PATH: ":memory:",
        },
        // The routes deliberately sleep, so give the slower flows room.
        testTimeout: 15_000,
        hookTimeout: 15_000,
    },
});
