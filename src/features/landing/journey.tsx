"use client";
import Image from "next/image";
import { useState } from "react";
import { Button, Heading, Text } from "@/components/ui";
import { journeySteps } from "./content";

export function Journey() {
  const [active, setActive] = useState(2);
  return (
    <section id="how-it-works" className="lp-section lp-journey">
      <Heading className="lp-section__title">Your learning journey, from the first session onward.</Heading>
      <Text className="lp-section__lead">
        Find the right tutor, learn through focused 1:1 sessions and build on your progress every time.
      </Text>
      <div className="lp-journey__body">
        <ol className="lp-steps">
          {journeySteps.map((step, index) => {
            const open = index === active;
            const body = "body" in step ? step.body : undefined;
            return (
              <li key={step.title} className="lp-step" data-open={open}>
                <Heading level={3} className="lp-step__title">
                  <Button
                    variant="ghost"
                    className="lp-step__trigger"
                    aria-expanded={open}
                    onClick={() => setActive(index)}
                  >
                    {step.title}
                  </Button>
                </Heading>
                {open && body && (
                  <>
                    <Text className="lp-step__body">{body}</Text>
                    <Image src="/landing/progress.svg" alt="" width={29} height={29} />
                  </>
                )}
              </li>
            );
          })}
        </ol>
        <div className="lp-journey__photo">
          <Image src="/landing/journey-photo.jpg" alt="A student in an online session with a tutor" fill sizes="(min-width: 1024px) 619px, 100vw" />
        </div>
      </div>
    </section>
  );
}
