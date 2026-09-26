import {defineConfig} from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        globals: true,
        include: ["src/**/*.{test,spec}.ts"],
        // Every test file gets a throwaway database instead of the real urls.db.
        env: {
            DB_PATH: ":memory:",
        },
    },
});
