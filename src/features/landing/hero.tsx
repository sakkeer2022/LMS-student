import Image from "next/image";
import { Search } from "lucide-react";
import { Button, Form, Heading, Input, Text } from "@/components/ui";
import { SiteHeader } from "./site-header";

export function Hero() {
  return (
    <section className="lp-hero">
      <Image src="/landing/hero-photo.jpg" alt="" fill priority sizes="100vw" className="lp-hero__photo" />
      <Image src="/landing/hero-overlay.jpg" alt="" fill priority sizes="100vw" className="lp-hero__photo" />
      <div className="lp-hero__shade" aria-hidden />
      <SiteHeader />
      <div className="lp-hero__body">
        <Heading level={1} className="lp-hero__title">
          Find a tutor who teaches what you need, the way you need to learn it.
        </Heading>
        <Text className="lp-hero__lead">
          Connect with tutors who teach your exact board, class and subject through focused 1:1 online sessions.
        </Text>
        <Form role="search" action="/tutors" className="lp-search">
          <Search size={20} aria-hidden className="lp-search__icon" />
          <Input name="q" type="search" placeholder="Class 10 Physics · ICSE...." aria-label="Search for a tutor" autoComplete="off" />
          <Button type="submit">Find a tutor</Button>
        </Form>
      </div>
    </section>
  );
}
