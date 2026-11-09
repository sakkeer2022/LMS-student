import { requireStudent } from "@/lib/auth/server";
import { Dashboard } from "@/features/dashboard/dashboard";

export const metadata = { title: "Dashboard" };

export default async function Page() {
  const { user } = await requireStudent();
  return <Dashboard fullName={user.fullName} timezone={user.timezone ?? undefined} />;
}
