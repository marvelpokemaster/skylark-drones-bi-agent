# Skylark Intelligence

## Overview
Skylark Intelligence is a conversational Business Intelligence agent designed for founders and executives to query real-world, messy Monday.com data (Deals and Work Orders).

It features a premium, executive-grade dashboard, deterministic financial calculations, and an LLM-powered chat interface to extract insights, perform cross-board comparisons, and generate leadership updates.

## Architecture
Browser → Next.js UI → Server API Route (`/api/chat`) → Monday Data Layer (GraphQL) → Normalization Layer → Deterministic Analytics Engine → LLM Response Synthesis → Browser.

## Tech Stack
- Next.js 15 (App Router, React Server Components)
- TypeScript
- Tailwind CSS v4
- Vercel AI SDK
- Monday.com GraphQL API

## Monday.com Integration
- The app uses the `fetch` API directly server-side to query `api.monday.com/v2` using `items_page` cursor-based pagination.
- Caching is managed natively via Next.js Data Cache (`revalidate: 300`) with a manual refresh button that calls `revalidateTag()`.
- Boards are strictly read-only.

## Data Normalization
Because the real-world Monday boards contain messy text fields for numerical data (e.g., "5360 HA" for quantity, missing values, GMT date strings):
- A robust parsing layer extracts integers and floats from text strings.
- Currencies and probabilities are mapped (High=0.8, Medium=0.5, Low=0.2).
- Data quality is explicitly tracked (e.g. counting missing values) and exposed to the user in the UI and to the LLM.

## Analytics & AI Agent Behavior
- The LLM **does not** do math. All metrics (Pipeline, Weighted Pipeline, Billed, Collected, Receivables) are pre-calculated deterministically in TypeScript and passed to the LLM as context.
- The agent interprets intent, matches it with the correct pre-calculated metric, and explains it naturally.
- Capable of generating an executive Leadership Update.

## Local Setup
1. Clone the repository.
2. `npm install`
3. Create `.env.local` based on the variables below.
4. `npm run dev`

## Environment Variables
```env
MONDAY_API_TOKEN=your_token
MONDAY_DEALS_BOARD_ID=5030967513
MONDAY_WORK_ORDERS_BOARD_ID=5030967768
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
```

## Vercel Deployment
Simply connect the repository to Vercel. Ensure the environment variables are added in the Vercel project settings. The Next.js App Router architecture is perfectly optimized for Vercel serverless deployment.
