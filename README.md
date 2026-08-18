# Job Application Tracker

A personal job application tracker with AI-powered features: fit scoring,
interview prep, and a natural-language assistant.

## Stack

- **Client**: React + Vite + Tailwind CSS (`client/`)
- **Server**: Node.js + Express (`server/`)
- **Database**: MongoDB (Mongoose)
- **AI**: Local LLM via Ollama, with automatic mock fallback

## Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`) or via Docker
- Optional: [Ollama](https://ollama.com) + `ollama pull llama3.2` for the real LLM

## Getting started

### 1. Server

```bash
cd server
cp .env.example .env    # optional; defaults work
npm install
npm run seed            # load sample data
npm run dev             # http://localhost:5000
```

### 2. Client

```bash
cd client
npm install
npm run dev             # http://localhost:5173
```

Open http://localhost:5173. The Vite dev server proxies `/api` to the backend.