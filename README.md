# Armstat Admin

Admin panel for Armstat, built with [Next.js](https://nextjs.org) 16 (App Router, standalone output). It is a frontend-only app — all data is proxied to the Armstat backend.

## Requirements

- Node.js 20
- pnpm 9 (`corepack enable && corepack prepare pnpm@9.15.4 --activate`)
- A running Armstat backend reachable at `NEXT_PUBLIC_BASE_URL`

## Environment variables

Copy `.env.example` and adjust:

```bash
cp .env.example .env
```

| Variable               | Required | Description                                                                                 |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_BASE_URL` | yes      | Base URL of the Armstat backend. `/api/*` requests are rewritten to `${NEXT_PUBLIC_BASE_URL}/*`. |

Example:

```env
NEXT_PUBLIC_BASE_URL=https://armstat-backend.it.massiv.cc
```

> `NEXT_PUBLIC_BASE_URL` is inlined at **build time**. When running `pnpm build`, the value must already be set for the target environment.

## Local development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

The app listens on port `3000` by default (override with the `PORT` env var). Because `next.config.ts` uses `output: "standalone"`, you can alternatively run the self-contained server directly:

```bash
node .next/standalone/server.js
```

When running the standalone server outside of `pnpm start`, copy `.next/static` and `public/` next to `server.js`.


## Linting

```bash
pnpm lint
```
