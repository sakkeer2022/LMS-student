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

Built from Figma "Amentorz-webapp", node 1:948, in `src/features/landing`: header with the Log in menu (node 8:9644: Student login, Faculty login), hero search, categories, how it works, tutors, faculty call to action, statistics and footer. Foundations are Figma "Webapplication" node 35:2 (`src/app/globals.css`).

- **Data:** tutors, statistics and free-resource counts come from `getLandingData()` (`data.ts`). No public endpoint exists yet (backend `docs/PENDING_DECISIONS.md`, T9), so each section shows its empty state. There is no sample data.
- **Links:** `/login` (student login, next), `/signup` (student onboarding, to come), `/tutors`, `/library`, `/about`, `/pricing` and the other footer pages are not built yet and show the 404 page until they are.
- **Design copy kept as drawn:** the "18% GST" sentence in How it works is design copy; confirm it before launch (T9).

## Login (`/login`)

Built from Figma "Amentorz-webapp" "Screen/02 · Login", node 3:1137, in `src/features/auth` (form, zod schema), `src/components/auth` (controls) and `src/app/(auth)`. It signs in with `POST /auth/student/login` (with `rememberMe` from "Keep me signed in"), then returns to the `redirect` path or `/`. "Forgot password?" (`/recovery`) and "Create account" (`/signup`) are not built yet (LMS-99 and student onboarding). The proof figures in the brand panel come from `getLandingData().stats`; the testimonial card is not built because there is no testimonial data (T9).

## Forgot password (`/recovery`)

Forgot password (`/recovery`, Figma 427:4388, 427:4492, 427:29259) is one page with four steps: email, code, new password, done. It uses `POST /auth/recovery/requests`, `/verify` and `/reset`; the reset credential lives only in component state, never in a URL or storage. The code step has no frame yet (see the backend `docs/PENDING_DECISIONS.md`, P8).

## Sign up (`/signup`)

Student registration from Figma "Amentorz-webapp" screens 03a-03d (nodes 992:48063, 992:48106, 992:48156, 992:48186, 992:48209), in `src/features/signup`. Built so far: **step 1 (account)**, the **email verification popup** and the **guardian consent popup**; the learning profile (step 2) waits for the category module, and steps 3 and 4 follow.

Workflow (decided over the frames): step 1's button reads "Continue to verification" and opens a popup that emails a 6-digit code (`POST /auth/registration/email-otp/requests` and `/verify`); right after a successful verification a student below the country's consent age gets the signature popup (`POST /consent/guardian-signatures`, multipart PNG); an adult goes straight on. Step 3 (guardian contact) is optional for adults.

What the screens do not hard-code: the country comes from the mobile number's dialling code (`GET /regions/countries`, which also gives the consent age), the Student Terms title, version and effective date come from `GET /policies/current?country=`, and the preview is that PDF. The email and consent tokens live only in memory (never in a URL or storage), so a refresh starts again. Shared parts: `DatePicker` (typed `dd / mm / yyyy` or a calendar with month and year dropdowns, value `YYYY-MM-DD`; shadcn `Calendar` on `react-day-picker`), `AppDialog` (Radix dialog; not dismissible when a step must be finished), `OtpInput`, `SignaturePad` in `src/components/forms`.

## Layout

`src/app` routes · `src/features/<feature>` screens · `src/components/shadcn` shadcn/ui primitives (Tailwind v4) · `src/components/forms` the date picker, code input, signature pad and dialog · `src/components/auth` login, recovery and sign-up blocks · `src/components/data-table` TanStack Table `DataTable` · `src/lib/api` the API client (CSRF, refresh) · `src/lib/auth` session types · `public/landing` Figma assets (downloaded; the Figma URLs expire).

Read `AGENTS.md` for the rules and `SHARED.md` for what is shared with the other apps.
