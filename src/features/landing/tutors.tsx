import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import type { LandingData } from "./data";
import { Section, SectionLead, SectionTitle } from "./section";

export function Tutors({ tutors }: { tutors: LandingData["tutors"] }) {
  return (
    <Section className="pt-[94px] pb-[129px]">
      <SectionTitle>Learn with tutors students trust</SectionTitle>
      <SectionLead className="mt-[26px] max-w-[563px] text-[#b5beca]">
        Every tutor is reviewed by students after completed sessions, helping you find experienced tutors with a track record of effective teaching.
      </SectionLead>
      {tutors.length === 0 ? (
        <p className="mt-[93px] text-[#b5beca]">Our tutors will appear here soon.</p>
      ) : (
        <ul className="mt-[93px] flex list-none gap-[22px] overflow-x-auto px-20 pb-2 text-left max-[1100px]:px-5">
          {tutors.map((tutor) => (
            <li key={tutor.id} className="relative h-[527px] w-[390px] flex-none overflow-hidden rounded-[34px] bg-[#1e2232]">
              {tutor.photoUrl && <Image src={tutor.photoUrl} alt="" fill sizes="390px" className="object-cover" />}
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_30.266%,rgba(30,34,50,0.99)_79.965%)]"
              />
              <div className="absolute top-[350px] right-[29px] left-[29px] flex items-start justify-between gap-[23px]">
                <div>
                  <h3 className="text-2xl leading-8 font-bold tracking-[-0.005em]">{tutor.name}</h3>
                  <p className="mt-1 text-[#9a9da1]">{tutor.headline}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-[15.707px] bg-white/14 p-[9px] font-semibold backdrop-blur-[3.7px]">
                  <Star size={16} fill="currentColor" aria-hidden className="text-warning-border" />
                  {tutor.rating.toFixed(1)}
                </span>
              </div>
              <div className="absolute right-0 bottom-0 left-0 flex h-[95px] items-center justify-between border-t border-white/3 bg-[#1e2232] px-[29px]">
                <p className="text-[30px] leading-[38px] font-bold tracking-[-0.01em]">
                  ₹{tutor.pricePerSession.toLocaleString("en-IN")}{" "}
                  <span className="text-sm leading-5 font-normal tracking-normal text-white/52">/ session</span>
                </p>
                <Link
                  href={`/tutors/${tutor.id}`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-neutral-700 bg-neutral-800 px-5 text-sm leading-5 font-semibold text-neutral-50"
                >
                  View profile
                  <ChevronRight size={20} aria-hidden />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
