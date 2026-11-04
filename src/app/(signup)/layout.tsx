import type { ReactNode } from "react";
import { AuthPage } from "@/components/auth/auth-page";
import { BrandPanel } from "@/features/auth/components/brand-panel";
import { getLandingData } from "@/features/landing/data";

export default async function SignupLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { stats } = await getLandingData();
  return (
    <AuthPage
      brand={
        <BrandPanel
          eyebrow="CREATE YOUR ACCOUNT"
          title="The free library opens the moment you sign up."
          copy="Browse every board, subject and level straight away. Book a 1:1 session only when you want one — you pay per session, never a package."
          stats={stats}
        />
      }
      alignTop
    >
      {children}
    </AuthPage>
  );
}
