# URL Shortener

Full-stack URL shortener built for the assessment using React, TypeScript, Express, and SQLite.

## Features

- Shorten valid URLs into 7-character short codes
- Normalize URLs without a scheme
- Optional expiry date and tags
- Redirect short links to the original URL
- History with pagination
- Copy and delete saved links
- Frontend, backend, and API flow tests

## Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, React Router  
**Backend:** Node.js, Express, TypeScript, SQLite, Zod  
**Testing:** Vitest, Testing Library, Supertest

## Development

Install and start the frontend development server from the repository root:

```bash
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

Start the backend in a second terminal:

```bash
cd url-shortener-backend
npm install
npm run dev
```

The API runs on `http://localhost:3000`.

## Tests

Run the frontend unit/component tests from the repository root:

```bash
npm test
```

Run the backend tests:

```bash
cd url-shortener-backend
npm test
```

Run the API flow tests from the repository root. These exercise the frontend API client against the real backend and test database:

```bash
npm run test:e2e
```

## Frontend Production Build

Create the optimized frontend production build:

```bash
npm run build
```

Vite outputs the production files to `dist/`.

Preview that built frontend locally:

```bash
npm run preview
```

## Backend Production Build

Build and run the backend separately:

```bash
cd url-shortener-backend
npm run build
npm start
```

The backend build compiles the TypeScript source to `url-shortener-backend/dist/`, and `npm start` runs the compiled application with Node.js.
