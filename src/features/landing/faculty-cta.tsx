import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { FACULTY_URL } from "./content";

export function FacultyCta() {
  return (
    <section className="px-[81px] pb-[149px] max-[1100px]:px-5 max-[1100px]:pb-20">
      <div className="relative mx-auto h-[233px] max-w-[1279px] overflow-hidden rounded-[14px] bg-[rgba(166,80,167,0.48)] shadow-[0_0_29.6px_rgba(225,129,229,0.36)] max-[640px]:h-auto">
        <Image
          src="/landing/cta-rings.svg"
          alt=""
          width={681}
          height={681}
          className="absolute top-[-80px] left-[610px] max-w-none -rotate-[27.71deg]"
        />
        <Image
          src="/landing/cta-arc.svg"
          alt=""
          width={1497}
          height={72}
          className="absolute top-[100px] left-[-200px] h-[472px] w-[1898px] max-w-none -rotate-[7.96deg]"
        />
        <div className="relative p-10">
          <h2 className="text-[34px] leading-[38px] font-bold tracking-[-0.01em]">Eager to empower others?</h2>
          <p className="mt-[7px] leading-7 text-[#cbd5e1]">
            Teach the subject you love. Get paid for the sessions you actually run.
          </p>
          <Link
            href={FACULTY_URL || "/become-a-tutor"}
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border bg-card px-5 text-sm leading-5 font-semibold text-accent-foreground"
          >
            Become a tutor
            <ChevronRight size={20} aria-hidden />
          </Link>
        </div>
        <Image
          src="/landing/cta-person-2.png"
          alt=""
          width={225}
          height={318}
          className="absolute top-px left-[806px] h-[318px] w-[225px] max-w-none scale-x-[-1] object-cover object-[7%_22%] max-[1100px]:hidden"
        />
        <Image
          src="/landing/cta-person-1.png"
          alt=""
          width={233}
          height={280}
          className="absolute top-[44px] left-[945px] h-[280px] w-[233px] max-w-none object-cover object-[33%_4%] max-[1100px]:hidden"
        />
      </div>
    </section>
  );
}
