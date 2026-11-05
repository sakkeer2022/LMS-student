import Image from "next/image";
import { Search } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { SiteHeader } from "./site-header";

export function Hero() {
  return (
    <section className="relative min-h-[783px] overflow-hidden bg-[#0f0518] text-white">
      <Image src="/landing/hero-photo.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
      <Image src="/landing/hero-overlay.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(106.62deg,rgb(15,5,24)_28.866%,rgba(0,0,0,0)_58.806%)]"
      />
      <SiteHeader />
      <div className="relative px-20 pt-[125px] pb-[120px] max-[1100px]:px-5">
        <h1 className="max-w-[716px] text-4xl leading-11 font-extrabold tracking-[-0.7px] min-[641px]:text-[54.901px] min-[641px]:leading-[69.1px] min-[641px]:tracking-[-1.098px]">
          Find a tutor who teaches what you need, the way you need to learn it.
        </h1>
        <p className="mt-[21px] max-w-[607px] text-lg leading-7 text-disabled-foreground">
          Connect with tutors who teach your exact board, class and subject through focused 1:1 online sessions.
        </p>
        <form
          role="search"
          action="/tutors"
          className="mt-[47px] ml-0.5 flex max-w-[623px] items-center gap-3 rounded-card border border-border-subtle bg-card py-2.5 pr-2.5 pl-6 text-foreground shadow-[0_4px_12px_rgba(15,23,42,0.08)]"
        >
          <Search size={20} aria-hidden className="flex-none text-muted-foreground" />
          <Input
            name="q"
            type="search"
            placeholder="Class 10 Physics · ICSE...."
            aria-label="Search for a tutor"
            autoComplete="off"
            className="h-6 min-w-0 flex-1 border-0 bg-transparent p-0 text-base focus-visible:border-0 focus-visible:ring-0"
          />
          <Button type="submit" className="max-[640px]:px-3">
            Find a tutor
          </Button>
        </form>
      </div>
    </section>
  );
}
