import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { categories } from "./content";
import type { LandingData } from "./data";
import { Section, SectionLead, SectionTitle } from "./section";

export function Categories({ counts }: { counts: LandingData["resourceCounts"] }) {
  return (
    <Section id="categories">
      <SectionTitle>Wherever you are in your learning journey, start here</SectionTitle>
      <SectionLead>Find the right resources, subjects and support for the path you&apos;re on.</SectionLead>
      <ul className="mx-auto mt-[86px] grid max-w-[1278px] list-none grid-cols-4 gap-[18px] p-0 text-left max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">
        {categories.map((category, index) => {
          const count = counts[category.key];
          return (
            <li
              key={category.key}
              className="flex min-h-[326px] flex-col rounded-panel border border-border-subtle bg-background p-6"
            >
              <span className="flex size-12 items-center justify-center rounded-md bg-accent">
                <Image src={`/landing/${category.icon}`} alt="" width={24} height={24} />
              </span>
              <h3 className="mt-[85px] text-2xl leading-8 font-bold tracking-[-0.005em]">{category.title}</h3>
              <p className="mt-2 mb-5">{category.summary}</p>
              <Link
                href={category.href}
                className={cn(
                  "mt-auto flex h-10 items-center justify-between rounded-md border border-border bg-card px-4 text-sm leading-5 font-semibold [&_svg]:text-primary",
                  index === 0 && "border-transparent bg-primary text-primary-foreground [&_svg]:text-neutral-100",
                )}
              >
                {count === undefined ? "Free resources" : `${count.toLocaleString("en-IN")} free resources`}
                <ChevronRight size={20} aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
