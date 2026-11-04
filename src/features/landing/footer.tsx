import Image from "next/image";
import Link from "next/link";
import { companyLegalLine, footerColumns, legalLinks } from "./content";

export function Footer() {
  return (
    <footer className="bg-sunken">
      <div className="flex justify-between gap-8 pt-[86px] pr-20 pb-20 pl-[86px] max-[1100px]:flex-col max-[1100px]:px-5 max-[1100px]:py-14">
        <div className="flex w-[324px] flex-col gap-4">
          <Image src="/landing/logo-purple.svg" alt="Amentorz" width={150} height={22} />
          <p className="text-sm leading-[1.4] text-[#6e6e6e]">
            Managed 1:1 tuition for Indian school, university and entrance-exam learners. Verified tutors, recorded progress, transparent pricing.
          </p>
        </div>
        <div className="flex gap-6 max-[1100px]:flex-wrap">
          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="leading-[1.2] font-semibold text-[#6e6e6e]">{column.title}</p>
              <ul className="mt-10 flex list-none flex-col gap-3 p-0 text-lg leading-[1.4] text-[#3e4554]">
                {column.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="flex min-h-[83px] items-center justify-between gap-4 bg-card px-20 py-8 text-xs leading-4 font-semibold tracking-[0.02em] text-muted-foreground max-[1100px]:flex-col max-[1100px]:items-start max-[1100px]:p-5">
        <p>{companyLegalLine}</p>
        <nav aria-label="Legal" className="flex flex-wrap gap-[21px]">
          {legalLinks.map(([label, href]) => (
            <Link key={label} href={href}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
