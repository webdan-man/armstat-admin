<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Two-domain routing (admin on a separate host)

The public site and the admin panel share this repo but can be served on separate domains via `src/proxy.ts` (Next 16 renamed `middleware` → `proxy`). When `ADMIN_HOST` is set, that host serves `src/app/admin/*` under clean, prefix-free URLs, and `/admin/*` returns `404` on every other host. See the "Two-domain setup" section in `README.md`.

- Admin routes live under `src/app/admin/`, but internal admin links must be written **without** the `/admin` prefix (e.g. `router.push("/users")`, `href="/home-page"`). Under the rewrite, a `/admin/...` link would resolve to `/admin/admin/...`.
- The admin domain is configurable: `ADMIN_HOST` is read at request time in `src/proxy.ts`.
