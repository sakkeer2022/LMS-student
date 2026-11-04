"use client";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/shadcn/button";
import { cn } from "@/lib/utils";
import { journeySteps } from "./content";
import { Section, SectionLead, SectionTitle } from "./section";

export function Journey() {
  const [active, setActive] = useState(2);
  return (
    <Section id="how-it-works" className="bg-[#fbfbfb]">
      <SectionTitle>Your learning journey, from the first session onward.</SectionTitle>
      <SectionLead>
        Find the right tutor, learn through focused 1:1 sessions and build on your progress every time.
      </SectionLead>
      <div className="mx-auto mt-[100px] grid max-w-[1210px] grid-cols-[514px_619px] items-center justify-between gap-8 text-left max-[1100px]:grid-cols-1">
        <ol className="m-0 list-none p-0">
          {journeySteps.map((step, index) => {
            const open = index === active;
            const body = "body" in step ? step.body : undefined;
            return (
              <li key={step.title} className="border-b border-border py-6 last:border-b-0" data-open={open}>
                <h3>
                  <Button
                    variant="ghost"
                    className={cn(
                      "h-auto justify-start p-0 text-left text-[21.709px] leading-[30.393px] font-semibold tracking-[-0.1085px] whitespace-normal text-muted-foreground hover:bg-transparent hover:text-muted-foreground",
                      open &&
                        "text-2xl leading-8 font-bold tracking-[-0.005em] text-foreground hover:text-foreground",
                    )}
                    aria-expanded={open}
                    onClick={() => setActive(index)}
                  >
                    {step.title}
                  </Button>
                </h3>
                {open && body && (
                  <>
                    <p className="mt-2 mb-4 max-w-[458px] text-lg leading-7 text-text-secondary">{body}</p>
                    <Image src="/landing/progress.svg" alt="" width={29} height={29} />
                  </>
                )}
              </li>
            );
          })}
        </ol>
        <div className="relative h-[528px] overflow-hidden rounded-card">
          <Image
            src="/landing/journey-photo.jpg"
            alt="A student in an online session with a tutor"
            fill
            sizes="(min-width: 1024px) 619px, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </Section>
  );
}
