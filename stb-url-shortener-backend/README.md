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

## Run

```bash
npm install
npm run dev
```

API runs on `http://localhost:3000`.

## Test

```bash
npm test
```

## Build

```bash
npm run build
```
