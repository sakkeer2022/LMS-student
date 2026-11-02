# Shared with the other apps

`amentorz-admin`, `amentorz-student` and `amentorz-faculty` are separate repos on one stack. Code that is the same in all three is copied, not published as a package, so keep the copies in step.

| Area                                   | Where                                              | Origin                          |
| -------------------------------------- | -------------------------------------------------- | ------------------------------- |
| API client (CSRF, one shared refresh)  | `src/lib/api/client.ts`, `contracts.ts`            | amentorz-admin (identical)      |
| Session user type (`GET /auth/me`)     | `src/lib/auth/access.ts`                           | amentorz-admin, role changed    |
| UI lint                                | `scripts/check-ui.cjs`                             | amentorz-admin (identical)      |
| `implement-screen` skill               | `.claude/skills/implement-screen`                  | amentorz-admin                  |
| Figma tokens                           | `src/styles/tokens.css`                            | Figma "Webapplication" 35:2     |
| `Link`, `cx`                           | `src/components/ui`                                | amentorz-admin                  |

Differences on purpose: this app has no login gate in `middleware.ts` yet (the landing page is public; the signed-in area will gate on `/auth/me` like the admin does), and its UI is built on the Figma tokens, not the admin's earlier theme.

Check `amentorz-backend/src/docs/SHARED_COMPONENTS.md` before writing a helper that the backend or another app may already have.
