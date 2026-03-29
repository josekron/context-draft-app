## Description

**Context Draft** that transforms technical screenshots into structured, product-aware Obsidian Markdown notes.

## Screenshots

![Dark Mode](public/screenshot_1_dark_mode.png)

![Light Mode](public/screenshot_1_light_mode.png)

## Setup

1. Create a .env.local file in the root of the project
2. Add the following variables to the .env.local file:
```
GOOGLE_GENERATIVE_AI_API_KEY=your-google-generative-ai-api-key
GEMINI_MODEL=gemini-3.1-flash-lite-preview
```
3. Deploy to Vercel: create a new project and connect to your github repository. 

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technologies

- Next.js 16
- Tailwind CSS
- AI SDK
- Google Generative AI