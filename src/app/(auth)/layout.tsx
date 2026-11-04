import type { ReactNode } from "react";
import { AuthPage } from "@/components/auth/auth-page";
import { BrandPanel } from "@/features/auth/components/brand-panel";
import { getLandingData } from "@/features/landing/data";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { stats } = await getLandingData();
  return (
    <AuthPage
      brand={
        <BrandPanel
          eyebrow="TUITION THAT FOLLOWS YOUR SYLLABUS"
          title="Learn from tutors who teach your exact board, subject and class."
          copy="1:1 online sessions for CBSE, ICSE, State Board, university and JEE / NEET learners — with a free study library that opens before you pay anything."
          stats={stats}
        />
      }
    >
      {children}
    </AuthPage>
  );
}
