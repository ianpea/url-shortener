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

## Requirements

Developed and tested with:

- Node.js 26.8.2
- npm 12.0.2

## Development

Install dependencies and start the API in watch mode:

```bash
npm install
npm run dev
```

API runs on `http://localhost:3000`.

## Type-check

Check the backend TypeScript without generating build files:

```bash
npm run typecheck
```

## Test

Run the backend test suite once:

```bash
npm test
```

Run tests in watch mode while developing:

```bash
npm run test:watch
```

## Production

Compile the TypeScript source into `dist/`:

```bash
npm run build
```

Run the compiled backend with Node.js:

```bash
npm start
```

`npm start` runs the compiled `dist/index.js` application.
