# URL Shortener Backend

Node.js + Express API for the URL shortener assessment.

## Responsibilities

- Create 7-character short codes
- Normalize and validate submitted URLs
- Resolve short codes to original URLs
- Support optional expiry dates and tags
- List saved URLs with pagination
- Soft-delete saved URLs

## Tech Stack

- Node.js + Express + TypeScript
- SQLite with `better-sqlite3`
- Zod validation
- Vitest + Supertest

## Development

Install dependencies and run the backend directly from the TypeScript source with `tsx` watch mode:

```bash
npm install
npm run dev
```

The API runs on `http://localhost:3000` and restarts automatically when backend source files change.

## Type-check

Check the backend TypeScript without generating build files:

```bash
npm run typecheck
```

## Tests

Run the backend Vitest suite, including the Express/Supertest tests:

```bash
npm test
```

Use watch mode while developing tests:

```bash
npm run test:watch
```

## Production Build

Compile the TypeScript source into runnable JavaScript under `dist/`:

```bash
npm run build
```

Run the compiled backend with Node.js:

```bash
npm start
```

`npm start` runs `dist/index.js`. The API remains available at `http://localhost:3000`.
