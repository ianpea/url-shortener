# URL Shortener

A simple full-stack URL shortener built with React, TypeScript, Express, and SQLite.

## Features

- Shorten long URLs into 7-character short codes
- Automatically normalizes URLs without a scheme
- Optional link expiry
- Redirects short URLs to their original destination
- URL history with pagination
- Copy and delete saved links
- Frontend, backend, and API flow tests

## Tech Stack

**Frontend**
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- TanStack Query
- React Router
- Zod

**Backend**
- Node.js + Express + TypeScript
- SQLite with `better-sqlite3`
- Zod validation

**Testing**
- Vitest
- Testing Library
- Supertest

## Getting Started

### Frontend

```bash
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

### Backend

```bash
cd stb-url-shortener-backend
npm install
npm run dev
```

The backend runs on `http://localhost:3000`.

## Tests

Frontend tests:

```bash
npm test
```

Backend tests:

```bash
cd stb-url-shortener-backend
npm test
```

API flow tests:

```bash
npm run test:e2e
```

## Build

Frontend:

```bash
npm run build
```

Backend:

```bash
cd stb-url-shortener-backend
npm run build
```
