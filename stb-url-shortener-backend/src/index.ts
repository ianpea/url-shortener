import {app} from "./app";

const PORT = 3000;

// Skipped while running tests so importing `app` doesn't bind the port.
if(process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`Session started at http://localhost:${PORT}`);
    });
}

export {app} from "./app";
export {normalizeUrl} from "./utils/url";
