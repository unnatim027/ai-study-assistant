# Study Assistant

An AI-powered study tool that transforms free-form notes into interactive flashcards and quizzes.

## Architecture

```
study-assistant/
├── client/          # React 19 + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and API client
│   │   ├── types/         # Frontend-specific types
│   │   ├── App.tsx        # Root application
│   │   └── main.tsx       # Entry point
│   └── ...
├── server/          # Express backend
│   └── src/
│       └── index.js       # API server + OpenRouter integration
└── shared/          # Zod schemas shared between client/server
    └── schemas.ts
```

## Setup

### Prerequisites
- Node.js 18+
- An [OpenRouter API key](https://openrouter.ai/)

### 1. Server

```bash
cd server
cp .env.example .env       # Add your OPENROUTER_API_KEY
npm install
npm run dev                 # Runs on http://localhost:3001
```

### 2. Client

```bash
cd client
npm install
npm run dev                 # Runs on http://localhost:5173
```

The Vite dev server proxies `/api` requests to the Express backend automatically.

## Environment Variables

### Server (`.env`)
| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENROUTER_API_KEY` | Yes | — | Your OpenRouter API key |
| `CLIENT_ORIGIN` | No | `http://localhost:5173` | CORS allowed origin |
| `PORT` | No | `3001` | Server port |

### Client
No environment variables needed — the client uses the Vite proxy in development.

## Prompt Engineering Strategy

The system prompt enforces strict JSON-only output from the LLM:

1. **Explicit schema** — The prompt includes the exact JSON structure the model must return, with field descriptions and constraints.
2. **Negative instructions** — Explicitly forbids markdown, code fences, and any surrounding text.
3. **Validation rules** — Requires `correctAnswer` to exactly match one of the four `options`, and sets minimum counts (5-10 flashcards, 5 quiz questions).
4. **Defensive cleaning** — Even with strict prompting, the server strips markdown fences (` ```json ... ``` `) if the LLM wraps the response anyway.
5. **Dual validation** — Both the server and client validate the response with Zod before rendering.

## AI Usage

- **Model**: Google Gemini 2.5 Flash via OpenRouter
- **Temperature**: 0.7 (balanced creativity/consistency)
- **Max tokens**: 4096 (sufficient for structured JSON with 10 flashcards + 5 quiz questions)
- **Frontend double-validation**: The client re-validates the response through Zod even though the server already validates, ensuring the contract is enforced at both layers.

## Failure Handling

| Failure Mode | Handling |
|---|---|
| **Malformed JSON** | Server catches `JSON.parse` error → returns 422 with "AI returned invalid structured data" |
| **Schema mismatch** | Zod validation catches unexpected fields/types → same 422 response |
| **Empty response** | Server checks for missing `content` → returns 502 |
| **Timeout** | Axios 60s timeout → client shows "Request timed out" message |
| **Network error** | Axios catches → client shows "Network error. Is the server running?" |
| **500 / 502 errors** | Server logs + returns structured error → client displays it |
| **Rate limiting** | express-rate-limit: 20 req/min per IP → 429 response |
| **Stale responses** | `AbortController` cancels in-flight requests; `requestIdRef` ensures older responses never overwrite newer ones |
| **API key missing** | Server checks at runtime → returns 500 with "Server configuration error" |

## Loading States

The app tracks a `LoadingPhase` through the pipeline:

1. **Idle** — Form ready for input
2. **Generating** — LLM API call in progress
3. **Parsing** — Validating response structure
4. **Rendering** — Building React components

## Time Spent

~2 hours — architecture design, implementation, and documentation.
