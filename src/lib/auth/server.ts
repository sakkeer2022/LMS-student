import 'server-only';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { STUDENT_HOME, isStudent, sessionUserSchema } from './access';

const backend = () => `${process.env.BACKEND_ORIGIN ?? 'http://127.0.0.1:3000'}/api/v1`;

// Same approach as amentorz-faculty src/lib/auth/server.ts: the backend decides who is signed in
// (GET /auth/me), so no signing secret is shared with this app.
export async function requireStudent() {
  const path = (await headers()).get('x-pathname') ?? STUDENT_HOME;
  const toLogin = `/login?redirect=${encodeURIComponent(path)}`;
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) redirect(toLogin);

  const me = await fetch(`${backend()}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });
  if (me.status === 401) redirect(toLogin);
  if (!me.ok) throw new Error('Unable to verify session');
  const body = await me.json();
  const user = sessionUserSchema.safeParse(body?.data);
  if (!body?.success || !user.success || !isStudent(user.data)) redirect(toLogin);
  return { user: user.data };
}
