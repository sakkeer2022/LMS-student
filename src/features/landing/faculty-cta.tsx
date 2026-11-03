import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Heading, Link, Text } from "@/components/ui";
import { FACULTY_URL } from "./content";

export function FacultyCta() {
  return (
    <section className="lp-cta-wrap">
      <div className="lp-cta">
        <Image src="/landing/cta-rings.svg" alt="" width={681} height={681} className="lp-cta__rings" />
        <Image src="/landing/cta-arc.svg" alt="" width={1497} height={72} className="lp-cta__arc" />
        <div className="lp-cta__copy">
          <Heading className="lp-cta__title">Eager to empower others?</Heading>
          <Text className="lp-cta__lead">Teach the subject you love. Get paid for the sessions you actually run.</Text>
          <Link href={FACULTY_URL || "/become-a-tutor"} className="lp-cta__action">
            Become a tutor
            <ChevronRight size={20} aria-hidden />
          </Link>
        </div>
        <Image src="/landing/cta-person-2.png" alt="" width={225} height={318} className="lp-cta__person lp-cta__person--back" />
        <Image src="/landing/cta-person-1.png" alt="" width={233} height={280} className="lp-cta__person lp-cta__person--front" />
      </div>
    </section>
  );
}
