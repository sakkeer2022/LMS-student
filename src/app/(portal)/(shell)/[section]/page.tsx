import { notFound } from "next/navigation";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { studentPages } from "@/components/layout/student-nav";

// Sidebar sections without a screen yet, as amentorz-faculty src/app/(portal)/(shell)/[section]/page.tsx
const sections = new Map(
  studentPages.filter(([, href]) => href !== "/dashboard").map(([title, href]) => [href.slice(1), title]),
);

export function generateMetadata({ params }: { params: Promise<{ section: string }> }) {
  return params.then(({ section }) => ({ title: sections.get(section) ?? "Page not found" }));
}

export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const title = sections.get(section);
  if (!title) notFound();
  return (
    <>
      <PageHeader title={title} />
      <EmptyState
        title="Not available yet"
        description="This part of the student portal is still being built."
      />
    </>
  );
}
