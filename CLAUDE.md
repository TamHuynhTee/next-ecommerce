<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax


<!-- nx configuration end-->

# Project Overview

`next-ecommerce` is an e-commerce platform in an Nx + pnpm monorepo (`apps/*`, `packages/*`; `packages/` is currently empty). It was assembled by merging a storefront template and a NestJS API into one repo, then adding an admin backoffice.

| Project | Path | Stack | Port |
| --- | --- | --- | --- |
| `web` | `apps/web` | Next.js 16 storefront (App Router, React 19, Tailwind 4, Redux Toolkit) | 3000 |
| `admin` | `apps/admin` | Next.js 16 backoffice (Tailwind 4, shadcn/ui, react-hook-form, Recharts) | 3001 |
| `api` | `apps/api` | NestJS 10 REST API (TypeORM, PostgreSQL, Passport JWT) | 8100 (`APP_PORT`) |

Both Next.js apps talk to the API server-side only, through `API_URL` (default `http://localhost:8100`). The browser never calls the API directly.

## Commands

Always run through Nx with `pnpm` (see the guidelines above). Project names are `web`, `admin` and `api`.

- Dev servers: `pnpm dev:api`, `pnpm dev:web`, `pnpm nx dev admin`. `.claude/launch.json` defines the same three.
- Build / test / lint everything: `pnpm build`, `pnpm test`, `pnpm lint`.
- API only: `pnpm nx run api:test`, `api:test:e2e`, `api:migration:generate`, `api:migration:run`, `api:migration:revert`, `api:seed:admin`, `api:seed:products`. Check `apps/api/package.json` for the exact script arguments before running.
- `pnpm nx lint web` is broken: `web` still runs `next lint`, which Next 16 removed. Do not treat that failure as caused by your change.
- The API needs PostgreSQL. Copy `apps/api/.env.example` to `apps/api/.env.local` (variables: `NODE_ENV`, `APP_PORT`, `DB_*`, `JWT_SECRET`, `JWT_EXPIRE_IN`, `JWT_REFRESH_EXPIRE_DAYS`), then run the migrations. `apps/web/.env.example` only needs `API_URL`. Never read `.env*` files other than `.env.example`.

## apps/api (NestJS)

- Feature modules in `src/modules/`: `auth`, `users`, `products` (products, categories, sub-categories), `cart`, `order`. Shared code lives in `src/common/` (guards, decorators, enums, interfaces) and `src/entities/` (base entities).
- Global `JwtAuthGuard` and `RolesGuard`: every route requires a JWT unless marked `@Public()`; restrict by role with `@Roles(Role.Admin)`. Roles are `user` and `admin`.
- Global `ValidationPipe` with `whitelist` and `forbidNonWhitelisted`, so DTOs must declare every accepted property (class-validator).
- Auth: `POST /auth/sign-up` and `/auth/sign-in` both return `{ access_token, refresh_token }`, so sign-up logs the user in immediately. `/auth/refresh` rotates refresh tokens (reuse detection with a short grace window, tokens stored hashed). `/auth/sign-out` revokes the token family. `GET /auth/me` returns the current user and `GET /auth/admin/me` is admin-only.
- Schema changes need a TypeORM migration in `src/database/migrations/` (generate it, never hand-edit the schema in place).
- Cart and order endpoints exist, but the storefront does not use them yet.

## apps/web (storefront)

- Based on the NextMerce free template. Most pages (shop, blogs, cart, wishlist, contact) still use static data (for example `components/Shop/shopData.ts`) and Redux slices in `src/redux/features/`. Only authentication is wired to the API. `next-auth`, `next-sanity`, `sanity` and `nodemailer` are installed but unused.
- Uses Cache Components (`cacheComponents` and `partialPrefetching` in `next.config.js`). Anything that reads request data (cookies, `useSearchParams`) or the current time must sit under `<Suspense>`, and session-derived data uses `"use cache: private"`. Each route must still pass the instant-navigation validation in `next dev`.
- Auth lives in `src/lib/auth/` (server code imports `server-only`):
  - The access and refresh tokens are httpOnly cookies set by the Next route handlers in `src/app/api/auth/{signin,signup,signout}`, which proxy to the API.
  - `src/proxy.ts` (Next 16's replacement for `middleware.ts`) does the optimistic check: protected paths (`/my-account`, `/checkout`) redirect to `/signin?redirect=<path>`, and `/signin` and `/signup` redirect away when already signed in. The sign-in route is `/signin`, not `/login`.
  - The real verification is `getCurrentUser()` behind the `withProtectedRoute` HOC (`components/Auth/withProtectedRoute.tsx`). `getSafeRedirect` blocks open redirects.
- Layout split: `app/(site)/layout.tsx` is a server layout, and `AppShell.tsx` is the client shell holding the providers, with server pieces (footer, header auth) passed in as props.

## apps/admin (backoffice)

- Next.js 16 and shadcn/ui, styled after the Rhombus template. Components in `src/components/ui` come from shadcn (`components.json`, new-york style). Add more with `pnpm dlx shadcn@latest add <name>` inside `apps/admin`.
- `apps/admin/AGENTS.md` warns that this Next.js version has breaking changes. Read `node_modules/next/dist/docs/` before writing Next.js code.
- Real pages: sign-in, products (list, new, edit), categories. Overview, orders, customers and settings are still mock data (`src/lib/mock-data.ts`) or placeholders.
- Auth is separate from the storefront: cookies are `admin_access_token` and a refresh cookie, `src/proxy.ts` renews tokens and only lets `role = admin` users in, and `requireAdmin()` guards the dashboard layout. Mutations are server actions (`actions.ts` next to each page) calling the API through `src/lib/api-client.ts` and `src/lib/api/`.
- Create the first admin with `ADMIN_EMAIL=... ADMIN_PASSWORD=... pnpm nx run api:seed:admin` after running the migrations.

# Project Conventions

## Code comments

- Write all code comments in English only (including JSDoc, `TODO`s and inline comments), regardless of the language used in chat.

## Git workflow

- Always create a new branch before starting work. Never work or commit directly on `main`.
- Only commit when the user explicitly asks for it.
- Keep each commit focused: it must contain only related changes. Split unrelated changes into separate commits.