# URL Shortener

Full-stack URL shortener built for the assessment using React, TypeScript, Express, and SQLite.

## Features

- Shorten valid URLs into 7-character short codes
- Normalize URLs without a scheme
- Optional expiry date
- Redirect short links to the original URL
- History with pagination
- Copy and delete saved links
- Frontend, backend, and API flow tests

## Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, React Router  
**Backend:** Node.js, Express, TypeScript, SQLite, Zod  
**Testing:** Vitest, Testing Library, Supertest

## Run

Frontend:

```bash
npm install
npm run dev
```

Backend:

```bash
cd stb-url-shortener-backend
npm install
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:3000`

## Tests

```bash
npm test
```

```bash
cd stb-url-shortener-backend
npm test
```

```bash
npm run test:e2e
```

## Build

```bash
npm run build
```

```bash
cd stb-url-shortener-backend
npm run build
```
