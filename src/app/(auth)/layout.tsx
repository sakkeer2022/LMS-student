import type { ReactNode } from "react";
import Image from "next/image";
import { getLandingData } from "@/features/landing/data";
import "@/features/auth/login.css";

const ROW_ONE = [4, 1, 2, 3];
const ROW_TWO = [5, 6, 7, 8];

export default async function AuthLayout({ children }: { children: ReactNode }) {
  // The proof figures come from the backend like the landing page statistics; none exist yet, so none show.
  const { stats } = await getLandingData();
  return (
    <div className="login">
      <aside className="login-brand">
        <div className="login-brand-row" style={{ left: -115, top: 133, opacity: 0.14 }} aria-hidden>
          {ROW_ONE.map((n) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={n} src={`/auth/photo-${n}.png`} alt="" />
          ))}
        </div>
        <div className="login-brand-row" style={{ left: -211, top: 320, opacity: 0.1 }} aria-hidden>
          {ROW_TWO.map((n) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={n} src={`/auth/photo-${n}.png`} alt="" />
          ))}
        </div>
        <div className="login-brand-fade" style={{ left: -26, top: 446 }} aria-hidden />
        <div className="login-brand-fade" style={{ left: -98, top: 98 }} aria-hidden />
        <div className="login-brand-glow" style={{ left: -211, top: 700 }} aria-hidden>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/auth/glow.svg" alt="" />
          </div>
        </div>
        <div className="login-brand-glow" style={{ left: 287, top: -249 }} aria-hidden>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/auth/glow.svg" alt="" />
          </div>
        </div>
        <div className="login-brand-main">
          <div className="login-brand-top">
            <Image src="/auth/logo.svg" alt="Amentorz" width={122} height={18} priority unoptimized />
          </div>
          <div className="login-pitch">
            <p className="login-pitch-eyebrow">TUITION THAT FOLLOWS YOUR SYLLABUS</p>
            <p className="login-pitch-title">Learn from tutors who teach your exact board, subject and class.</p>
            <p className="login-pitch-copy">
              1:1 online sessions for CBSE, ICSE, State Board, university and JEE / NEET learners — with a free study
              library that opens before you pay anything.
            </p>
          </div>
        </div>
        {stats.length > 0 && (
          <div className="login-brand-foot">
            <dl className="login-proof">
              {stats.slice(0, 3).map((stat) => (
                <div key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </aside>
      <main id="main" className="login-panel">
        {children}
      </main>
    </div>
  );
}
