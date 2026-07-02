# Armstat Admin

Admin panel for Armstat, built with [Next.js](https://nextjs.org) 16 (App Router, standalone output). It is a frontend-only app — all data is proxied to the Armstat backend.

## Requirements

- Node.js 20
- pnpm 9 (`corepack enable && corepack prepare pnpm@9.15.4 --activate`)
- A running Armstat backend reachable at `NEXT_PUBLIC_BACKEND_URL`

## Environment variables

Copy `.env.example` and adjust:

```bash
cp .env.example .env
```

| Variable               | Required | Description                                                                                |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_BACKEND_URL` | yes      | Base URL of the Armstat backend. `/api/*` requests are rewritten to `${NEXT_PUBLIC_BACKEND_URL}/*`. |
| `ADMIN_HOST`           | yes      | Host that serves the admin panel (see [Two-domain setup](#two-domain-setup)). When unset, the admin panel stays at `/admin` on the same host. |

Example:

```env
NEXT_PUBLIC_BACKEND_URL=https://backend.armstat.am
ADMIN_HOST=admin.armstat.am
```

> `NEXT_PUBLIC_BACKEND_URL` is inlined at **build time**. When running `pnpm build`, the value must already be set for the target environment.
>
> `ADMIN_HOST` is read at **request time** by `src/proxy.ts`, so the admin domain can change per deployment without a rebuild.

## Two-domain setup

The public site and the admin panel live in one codebase but can be served on separate domains. `src/proxy.ts` (Next 16's renamed middleware) routes by `Host`:

- On `ADMIN_HOST`, requests are rewritten into `src/app/admin/*` and served under clean, prefix-free URLs — `admin.armstat.am/users` renders the `/admin/users` route with `/admin` hidden from the URL.
- On any other host, the admin section (`/admin/*`) returns `404`, so it is not reachable from the public domain.
- `/api/*` is untouched and still proxied to the backend on both domains.

Point both DNS records at the same deployment and forward the real `Host` header from your reverse proxy. No second build or repo is needed — one image serves both domains.

Internal admin links are therefore written **without** the `/admin` prefix (e.g. `router.push("/users")`). Keep it that way — a link that emits `/admin/...` would resolve to `/admin/admin/...` under the rewrite.

## Local development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

If `ADMIN_HOST` is set (e.g. `admin.localhost`), the admin panel is served on that host instead: open [http://admin.localhost:3000](http://admin.localhost:3000). `*.localhost` resolves to `127.0.0.1` in Chrome/Firefox with no hosts-file edit. Leave `ADMIN_HOST` unset to keep the admin panel at `/admin` on `localhost`.

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
