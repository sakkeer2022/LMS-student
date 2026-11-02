import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Heading, Link, Text } from "@/components/ui";
import { categories } from "./content";
import type { LandingData } from "./data";

export function Categories({ counts }: { counts: LandingData["resourceCounts"] }) {
  return (
    <section id="categories" className="lp-section lp-categories">
      <Heading className="lp-section__title">Wherever you are in your learning journey, start here</Heading>
      <Text className="lp-section__lead">Find the right resources, subjects and support for the path you&apos;re on.</Text>
      <ul className="lp-categories__grid">
        {categories.map((category, index) => {
          const count = counts[category.key];
          return (
            <li key={category.key} className="lp-category">
              <span className="lp-category__icon">
                <Image src={`/landing/${category.icon}`} alt="" width={24} height={24} />
              </span>
              <Heading level={3} className="lp-category__title">{category.title}</Heading>
              <Text className="lp-category__summary">{category.summary}</Text>
              <Link
                href={category.href}
                className={`lp-category__action${index === 0 ? " lp-category__action--primary" : ""}`}
              >
                {count === undefined ? "Free resources" : `${count.toLocaleString("en-IN")} free resources`}
                <ChevronRight size={20} aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
