# URL Shortener Backend

Node.js + Express API for the URL shortener assessment.

## Responsibilities

- Create 7-character short codes
- Normalize and validate submitted URLs
- Resolve short codes to original URLs
- Support optional expiry dates
- List saved URLs with pagination
- Soft-delete saved URLs

## Tech Stack

- Node.js + Express + TypeScript
- SQLite with `better-sqlite3`
- Zod validation
- Vitest + Supertest

## Development

```bash
npm install
npm run dev
```

API runs on `http://localhost:3000`.

## Type-check

```bash
npm run typecheck
```

## Test

```bash
npm test
```

## Production

```bash
npm run build
npm start
```

The build compiles the backend TypeScript source into `dist/`, and the start
command runs the compiled `dist/index.js` application with Node.js.
