import Image from "next/image";
import { ChevronRight, Star } from "lucide-react";
import { Heading, Link, Text } from "@/components/ui";
import type { LandingData } from "./data";

export function Tutors({ tutors }: { tutors: LandingData["tutors"] }) {
  return (
    <section className="lp-section lp-tutors">
      <Heading className="lp-section__title">Learn with tutors students trust</Heading>
      <Text className="lp-section__lead">
        Every tutor is reviewed by students after completed sessions, helping you find experienced tutors with a track record of effective teaching.
      </Text>
      {tutors.length === 0 ? (
        <Text className="lp-empty">Our tutors will appear here soon.</Text>
      ) : (
        <ul className="lp-tutors__row">
          {tutors.map((tutor) => (
            <li key={tutor.id} className="lp-tutor">
              {tutor.photoUrl && <Image src={tutor.photoUrl} alt="" fill sizes="390px" className="lp-tutor__photo" />}
              <div className="lp-tutor__shade" aria-hidden />
              <div className="lp-tutor__head">
                <div>
                  <Heading level={3} className="lp-tutor__name">{tutor.name}</Heading>
                  <Text className="lp-tutor__headline">{tutor.headline}</Text>
                </div>
                <span className="lp-tutor__rating">
                  <Star size={16} fill="currentColor" aria-hidden />
                  {tutor.rating.toFixed(1)}
                </span>
              </div>
              <div className="lp-tutor__foot">
                <Text className="lp-tutor__price">
                  ₹{tutor.pricePerSession.toLocaleString("en-IN")} <Text as="span">/ session</Text>
                </Text>
                <Link href={`/tutors/${tutor.id}`} className="lp-tutor__action">
                  View profile
                  <ChevronRight size={20} aria-hidden />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
