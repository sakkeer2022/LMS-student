"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bell,
  BookOpen,
  Calendar,
  CircleUser,
  FileText,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  Search,
  TrendingUp,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/shadcn/avatar";
import { Button } from "@/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { Input } from "@/components/shadcn/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/shadcn/sheet";
import { initialsOf } from "./initials";
import { isNavigationActive, studentNavigation, studentPages, type StudentIcon } from "./student-nav";

const icons: Record<StudentIcon, typeof Calendar> = {
  dashboard: LayoutDashboard,
  sessions: Calendar,
  library: BookOpen,
  homework: FileText,
  progress: TrendingUp,
  payments: IndianRupee,
  profile: CircleUser,
};

export type ShellAccount = { name?: string; subtitle?: string };

function Brand() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2 p-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <span
        aria-hidden
        className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground"
      >
        A
      </span>
      <span className="text-xl font-bold tracking-tight">Amentorz</span>
    </Link>
  );
}

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Student navigation" className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
      {studentNavigation.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="px-2 pt-4 pb-1 text-xs font-semibold tracking-[0.02em] text-muted-foreground uppercase">
            {group.label}
          </p>
          {group.items.map(([title, href, icon]) => {
            const active = isNavigationActive(pathname, href);
            const Icon = icons[icon];
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-text-secondary outline-none transition-colors hover:bg-sunken focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  active && "bg-accent text-accent-foreground hover:bg-accent",
                )}
              >
                {active && (
                  <span aria-hidden className="absolute top-3 -left-px h-5 w-[3px] rounded-[2px] bg-primary" />
                )}
                <Icon aria-hidden className="size-6 shrink-0" />
                <span className="flex-1 truncate">{title}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function Account({ account, onLogout, loggingOut }: { account: ShellAccount; onLogout: () => void; loggingOut: boolean }) {
  return (
    <div className="flex items-center gap-3 border-t border-border-subtle p-4">
      <Link
        href="/profile"
        aria-label="My profile"
        className="flex min-w-0 flex-1 items-center gap-3 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <Avatar className="size-8">
          <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
            {initialsOf(account.name)}
          </AvatarFallback>
        </Avatar>
        <span className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-sm leading-5 font-semibold">{account.name ?? "My profile"}</span>
          {account.subtitle && (
            <span className="truncate text-xs leading-4 text-muted-foreground">{account.subtitle}</span>
          )}
        </span>
      </Link>
      <Button variant="ghost" size="icon-sm" aria-label="Log out" disabled={loggingOut} onClick={onLogout}>
        <LogOut aria-hidden className="size-5" />
      </Button>
    </div>
  );
}

function NavigationSearch() {
  const [query, setQuery] = useState("");
  const matches = query ? studentPages.filter(([label]) => label.toLowerCase().includes(query.toLowerCase())) : [];
  return (
    <div className="relative hidden w-full max-w-[437px] sm:block">
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        aria-label="Search pages"
        placeholder="Search tutors, subjects, sessions"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && setQuery("")}
        className="h-9 border-transparent bg-sunken pl-10 placeholder:text-muted-foreground"
      />
      {query && (
        <div className="absolute top-full right-0 left-0 z-20 mt-1 rounded-md border bg-popover p-1 shadow-card">
          {matches.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              onClick={() => setQuery("")}
              className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              {label}
            </Link>
          ))}
          {!matches.length && <p className="px-3 py-2 text-sm text-muted-foreground">No matching pages</p>}
        </div>
      )}
    </div>
  );
}

/**
 * The signed-in student frame from the Figma dashboard: sidebar (drawer below lg), top bar and content.
 * It owns no data; the portal layout passes the account.
 */
export function StudentShell({ account, children }: { account: ShellAccount; children: ReactNode }) {
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => setDrawer(false), [pathname]);

  async function logout() {
    setLoggingOut(true);
    try {
      await api<null>("/auth/logout", { method: "POST" });
    } finally {
      window.location.assign("/login");
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-card lg:flex">
        <Brand />
        <Nav />
        <Account account={account} onLogout={logout} loggingOut={loggingOut} />
      </aside>
      <Sheet open={drawer} onOpenChange={setDrawer}>
        <SheetContent side="left" className="w-60 gap-0 p-0 lg:hidden" aria-describedby={undefined}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">Student portal navigation</SheetDescription>
          <Brand />
          <Nav onNavigate={() => setDrawer(false)} />
          <Account account={account} onLogout={logout} loggingOut={loggingOut} />
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 bg-card px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={() => setDrawer(true)}
          >
            <PanelLeft aria-hidden className="size-5" />
          </Button>
          <NavigationSearch />
          <div className="ml-auto flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <Bell aria-hidden className="size-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <p className="px-2 pb-2 text-sm text-muted-foreground">No notifications yet.</p>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="User menu"
                  className="rounded-pill outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
                      {initialsOf(account.name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile">My profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled={loggingOut} onSelect={logout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main id="main" className="flex flex-1 flex-col gap-8 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
