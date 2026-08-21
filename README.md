# Job Application Tracker

A personal job application tracker with AI-powered features: fit scoring,
interview prep, and a natural-language assistant.

![Stack](https://img.shields.io/badge/stack-React%20%2B%20Express%20%2B%20MongoDB-blue)

## Features

- **Dashboard** — status cards, pipeline breakdown chart, top matches by AI fit
  score, upcoming actions
- **Applications** — filterable, sortable list (search, status, fit score);
  create / edit / delete with stage-history timeline
- **AI fit analysis** — scores each application against your profile and lists
  skill gaps
- **Interview prep** — generates tailored interview questions per application
- **AI assistant** — ask questions about your data in plain English
  ("How many interviews do I have?")
- **Profile** — your skills/experience feed the AI features

## Stack

| Layer    | Tech                                        |
| -------- | ------------------------------------------- |
| Client   | React 19 + Vite + Tailwind CSS v4           |
| Server   | Node.js + Express 5                         |
| Database | MongoDB (Mongoose)                          |
| AI       | Local LLM via Ollama, automatic mock fallback |

## Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`) or via Docker:

  ```bash
  docker run -d --rm --name jobtracker-mongo -p 27017:27017 mongo:7
  ```

- Optional (recommended): [Ollama](https://ollama.com) with a local model:

  ```bash
  ollama pull llama3.2
  ```

  Without Ollama the server automatically falls back to a mock provider, so
  every feature still works.

## Getting started

### 1. Server

```bash
cd server
cp .env.example .env    # optional; defaults work out of the box
npm install
npm run seed            # load realistic sample data + profile
npm run dev             # http://localhost:5000
```

### 2. Client

```bash
cd client
npm install
npm run dev             # http://localhost:5173
```

Open http://localhost:5173. The Vite dev server proxies `/api` to the backend.

## Scripts

| Location | Script          | Purpose                              |
| -------- | --------------- | ------------------------------------ |
| `server` | `npm run dev`   | Start API with auto-reload           |
| `server` | `npm start`     | Start API (production mode)          |
| `server` | `npm run seed`  | Reset DB and load sample data        |
| `client` | `npm run dev`   | Start Vite dev server                |
| `client` | `npm run build` | Production build to `dist/`          |
| `client` | `npm run lint`  | Lint client code                     |

## Configuration (`server/.env`)

| Variable          | Default                            | Notes                                |
| ----------------- | ---------------------------------- | ------------------------------------ |
| `PORT`            | `5000`                             | API port                             |
| `MONGODB_URI`     | `mongodb://localhost:27017/job_tracker` | MongoDB connection string       |
| `OLLAMA_BASE_URL` | `http://localhost:11434`           | Ollama endpoint                      |
| `OLLAMA_MODEL`    | `llama3.2`                         | Model used for AI features           |
| `AI_PROVIDER`     | `auto`                             | `auto` \| `ollama` \| `mock`         |

In `auto` mode the server probes Ollama on startup and falls back to the mock
provider if it is unreachable. The active provider is shown on the dashboard
("AI provider" pill).

## API overview

Base URL: `/api`

| Method | Path                            | Description                        |
| ------ | ------------------------------- | ---------------------------------- |
| GET    | `/applications`                 | List (supports `status`, `q`, `sort`, `order`) |
| POST   | `/applications`                 | Create                             |
| GET    | `/applications/:id`             | Detail                             |
| PUT    | `/applications/:id`             | Update (status changes append history) |
| DELETE | `/applications/:id`             | Delete                             |
| POST   | `/applications/:id/analyze`     | AI fit analysis                    |
| POST   | `/applications/:id/interview-prep` | AI interview questions          |
| GET    | `/profile` · PUT `/profile`     | Read / update profile              |
| GET    | `/stats`                        | Status counts, upcoming actions, active AI provider |
| POST   | `/assistant`                    | Natural-language question `{ message }` |

## Demo script (for recruiters)

1. `npm run seed` in `server/`, then start server + client.
2. **Dashboard** — pipeline at a glance: status counts, chart, top AI matches.
3. Open any application → **Run AI analysis** → fit score + missing skills appear.
4. **Generate interview questions** — tailored prep in one click.
5. Edit the application, change its status, add a note → see it appear in the
   stage-history timeline.
6. **AI Assistant** — ask *"How many interviews do I have?"* or *"What are my
   upcoming actions?"*
7. Resize the window — the applications table collapses into mobile cards.

## Screenshots

> Add screenshots here: `docs/screenshots/dashboard.png`,
> `assistant.png`, `detail.png`.

## Project structure

```
client/   React + Vite + Tailwind frontend
server/   Express REST API, Mongoose models, AI provider abstraction
docs/     Implementation plan and spec
```
