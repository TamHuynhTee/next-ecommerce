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
