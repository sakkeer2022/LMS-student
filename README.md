# amentorz-student

The student web app and the public landing page (Next.js 15, React 19, Tailwind 4, TanStack Query, zod). Port **3002**. The faculty app (3003) and admin app (3001) are separate repos; the backend is `amentorz-backend`.

## Run

```
cp .env.example .env     # then set the values; never commit .env
npm install
npm run dev              # http://localhost:3002
```

| Script              | Purpose                                              |
| ------------------- | ---------------------------------------------------- |
| `npm run typecheck` | TypeScript, strict                                   |
| `npm run lint`      | UI lint: native controls and headings only in `components/ui` |
| `npm test`          | Vitest                                               |
| `npm run build`     | Production build                                     |

`/api/v1/*` is proxied to `BACKEND_ORIGIN`, so the auth cookies stay same-origin.

## Environment

| Variable                         | Purpose                                                                 |
| -------------------------------- | ----------------------------------------------------------------------- |
| `BACKEND_ORIGIN`                 | Backend API origin for the `/api/v1` rewrite                             |
| `NEXT_PUBLIC_FACULTY_URL`        | Faculty app origin. The "Faculty login" and "Become a tutor" links use it |
| `NEXT_PUBLIC_COMPANY_LEGAL_LINE` | Legal line in the landing footer (company, GSTIN, city)                  |

## Landing page (`/`)

Built from Figma "Amentorz-webapp", node 1:948, in `src/features/landing`: header with the Log in menu (node 8:9644: Student login, Faculty login), hero search, categories, how it works, tutors, faculty call to action, statistics and footer. Foundations are Figma "Webapplication" node 35:2 (`src/styles/tokens.css`).

- **Data:** tutors, statistics and free-resource counts come from `getLandingData()` (`data.ts`). No public endpoint exists yet (backend `docs/PENDING_DECISIONS.md`, T9), so each section shows its empty state. There is no sample data.
- **Links:** `/login` (student login, next), `/signup` (student onboarding, to come), `/tutors`, `/library`, `/about`, `/pricing` and the other footer pages are not built yet and show the 404 page until they are.
- **Design copy kept as drawn:** the "18% GST" sentence in How it works is design copy; confirm it before launch (T9).

## Layout

`src/app` routes · `src/features/<feature>` screens · `src/components/ui` the only place for native `button`, `input`, `form` and headings · `src/lib/api` the API client (CSRF, refresh) · `src/lib/auth` session types · `public/landing` Figma assets (downloaded; the Figma URLs expire).

Read `AGENTS.md` for the rules and `SHARED.md` for what is shared with the other apps.
