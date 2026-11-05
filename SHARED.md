# Shared with the other apps

`amentorz-admin`, `amentorz-student` and `amentorz-faculty` are separate repos on one stack. Code that is the same in all three is copied, not published as a package, so keep the copies in step.

| Area                                   | Where                                              | Origin                          |
| -------------------------------------- | -------------------------------------------------- | ------------------------------- |
| API client (CSRF, one shared refresh)  | `src/lib/api/client.ts`, `contracts.ts`            | amentorz-admin (identical)      |
| Session user type (`GET /auth/me`)     | `src/lib/auth/access.ts`                           | amentorz-admin, role changed    |
| `implement-screen` skill               | `.claude/skills/implement-screen`                  | amentorz-admin                  |
| Figma tokens (Tailwind `@theme`)       | `src/app/globals.css`                              | amentorz-admin (same palette), Figma "Webapplication" 35:2 |
| Login and recovery blocks, brand photos | `src/features/auth`, `src/components/auth`, `public/auth` | amentorz-admin; student copy, text and endpoint differ |
| `DatePicker`, `AppDialog`, `OtpInput`, `SignaturePad` | `src/components/forms` | new in the student app; copy to the other apps when they need a date, a popup, a code or a signature (the date picker is meant for reuse in later modules) |
| shadcn primitives, `cn`, `DataTable`, page helpers | `src/components/shadcn`, `src/lib/utils.ts`, `src/components/data-table`, `src/components/layout` | amentorz-admin (copied) |

Differences on purpose: this app has no login gate in `middleware.ts` yet (the landing page is public; the signed-in area will gate on `/auth/me` like the admin does), and its UI is built on the Figma tokens, not the admin's earlier theme.

Check `amentorz-backend/src/docs/SHARED_COMPONENTS.md` before writing a helper that the backend or another app may already have.
