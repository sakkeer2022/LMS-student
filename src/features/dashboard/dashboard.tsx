import type { ReactNode } from "react";
import { Calendar, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/shadcn/button";

const card = "rounded-panel border bg-card shadow-card";

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={card}>
      <h2 className="px-5 pt-5 pb-4 text-lg leading-[26px] font-semibold">{title}</h2>
      <p className="px-5 pb-5 text-sm text-muted-foreground">{children}</p>
    </section>
  );
}

// The Figma dashboard (Screen/08) lays out sessions, homework, progress and payments. The backend has no
// service for those yet, so each block states that instead of showing sample figures; only the
// student's own name and today's date are real.
const stats = ["Sessions this month", "Hours learned", "Homework on time", "Spent this month"];

export function Dashboard({ fullName, timezone }: { fullName: string; timezone?: string }) {
  const today = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: timezone,
  }).format(new Date());
  const firstName = fullName.trim().split(/\s+/)[0] ?? "";

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`${today} · Welcome back, ${firstName}`}
        actions={
          <Button disabled>
            <Plus aria-hidden className="size-5" />
            Book a session
          </Button>
        }
      />

      <section className={`${card} flex flex-col gap-4 p-6`}>
        <p className="text-xs font-semibold tracking-[0.02em] text-muted-foreground uppercase">Next session</p>
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <Calendar aria-hidden className="size-4" />
          You have no upcoming sessions. Booking opens once tutors publish their availability.
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((label) => (
          <div key={label} className="flex flex-col gap-2 rounded-panel border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold tracking-[0.02em] text-text-secondary">{label}</p>
            <p className="text-[30px] leading-[38px] font-bold tracking-tight">—</p>
            <p className="text-xs text-muted-foreground">Appears after your first session</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_368px]">
        <Panel title="This week">No sessions this week.</Panel>
        <Panel title="Homework due">Nothing is due.</Panel>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_368px]">
        <Panel title="Latest progress report">Your first report is published after a full month of sessions.</Panel>
        <Panel title="Recent payments">No payments yet.</Panel>
      </div>
    </>
  );
}
