import type { ReactNode } from "react";
import { requireStudent } from "@/lib/auth/server";
import { StudentShell } from "@/components/layout/student-shell";

// Signed-in portal frame (sidebar and top bar). requireStudent checks the session with the backend.
export default async function Layout({ children }: { children: ReactNode }) {
  const { user } = await requireStudent();
  return <StudentShell account={{ name: user.fullName, subtitle: user.email }}>{children}</StudentShell>;
}
