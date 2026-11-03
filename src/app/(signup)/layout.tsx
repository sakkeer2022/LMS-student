import type { ReactNode } from "react";
import { BrandPanel } from "@/features/auth/components/brand-panel";
import { getLandingData } from "@/features/landing/data";
import "@/features/auth/login.css";

export default async function SignupLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { stats } = await getLandingData();
  return (
    <div className="login">
      <BrandPanel
        eyebrow="CREATE YOUR ACCOUNT"
        title="The free library opens the moment you sign up."
        copy="Browse every board, subject and level straight away. Book a 1:1 session only when you want one — you pay per session, never a package."
        stats={stats}
      />
      <main id="main" className="login-panel signup-panel">
        {children}
      </main>
    </div>
  );
}
