# Admin (backoffice)

Next.js 16 (App Router) + Tailwind 4 + shadcn/ui admin dashboard, styled after the Rhombus template.
Nx project `admin` (tags `scope:admin`, `type:app`), served on port **3001**.

## Run

```bash
pnpm install
pnpm nx dev admin      # http://localhost:3001
pnpm nx build admin
pnpm nx start admin    # serve the production build
```

## Structure

- `src/app/(dashboard)` – layout (sidebar + header) and pages: Overview, Products, Orders, Customers, Settings.
- `src/components/ui` – shadcn/ui components (add more with `pnpm dlx shadcn@latest add <name>` inside `apps/admin`).
- `src/components/layout` and `src/components/dashboard` – app shell and dashboard widgets.
- `src/lib/mock-data.ts` – mocked data; `src/lib/api-client.ts` and `src/lib/auth.ts` are placeholders for the API client (NestJS, port 8100) and the auth guard.

Light/dark/system theme is available from the header toggle. No real auth or API calls yet.

## Authentication

- Sign-in posts to the API `POST /auth/sign-in` from a server action and stores the JWT in an httpOnly cookie (`admin_access_token`).
- `src/proxy.ts` redirects unauthenticated users (or non-admin tokens) to `/sign-in`; `requireAdmin()` in `src/lib/auth/session.ts` guards the dashboard layout.
- Only users with `role = admin` may enter. The API now stores a `role` on users, puts it in the JWT, and enforces it with `@Roles(Role.Admin)`.
- Set `API_URL` to override the API base URL (default `http://localhost:8100`).

Create the first admin (after running the API migration `pnpm nx run api:migration:run`):

```bash
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='<password>' pnpm nx run api:seed:admin
```
