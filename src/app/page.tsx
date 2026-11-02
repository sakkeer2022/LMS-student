import { Categories } from "@/features/landing/categories";
import { getLandingData } from "@/features/landing/data";
import { FacultyCta } from "@/features/landing/faculty-cta";
import { Footer } from "@/features/landing/footer";
import { Hero } from "@/features/landing/hero";
import { Journey } from "@/features/landing/journey";
import { Stats } from "@/features/landing/stats";
import { Tutors } from "@/features/landing/tutors";

export default async function LandingPage() {
  const data = await getLandingData();
  return (
    <main id="main" className="lp">
      <Hero />
      <Categories counts={data.resourceCounts} />
      <Journey />
      <div className="lp-dark">
        <Tutors tutors={data.tutors} />
        <FacultyCta />
        <Stats stats={data.stats} />
      </div>
      <Footer />
    </main>
  );
}
