# bmad-todo-app

A full-stack todo application built with React, Fastify, PostgreSQL, and Drizzle ORM.

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4 + TanStack Query v5
- **Backend:** Fastify 5.8 + TypeScript + Drizzle ORM
- **Database:** PostgreSQL 16
- **Testing:** Vitest + Playwright
- **Deployment:** Docker Compose

## Prerequisites

- Node.js 20+
- Docker & Docker Compose

## Quick Start (Docker)

```bash
cp .env.example .env
docker-compose up
```

The application will be available at `http://localhost:3000`.

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:3000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` with API proxy to the backend.

## Project Structure

```
bmad-todo-app/
├── frontend/          # React SPA (Vite + TypeScript)
├── backend/           # Fastify REST API (TypeScript)
├── e2e/               # Playwright end-to-end tests
├── docker-compose.yml # Full-stack Docker configuration
└── .env.example       # Environment variable template
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/todos | List all todos |
| POST | /api/todos | Create a todo |
| PATCH | /api/todos/:id | Update a todo |
| DELETE | /api/todos/:id | Delete a todo |

## Environment Variables

See `.env.example` for required configuration.
