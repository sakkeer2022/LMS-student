import Image from "next/image";
import { Link, Text } from "@/components/ui";
import { companyLegalLine, footerColumns, legalLinks } from "./content";

export function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer__main">
        <div className="lp-footer__about">
          <Image src="/landing/logo-purple.svg" alt="Amentorz" width={150} height={22} />
          <Text>
            Managed 1:1 tuition for Indian school, university and entrance-exam learners. Verified tutors, recorded progress, transparent pricing.
          </Text>
        </div>
        <div className="lp-footer__columns">
          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={column.title} className="lp-footer__column">
              <Text className="lp-footer__heading">{column.title}</Text>
              <ul>
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
      <div className="lp-footer__legal">
        <Text>{companyLegalLine}</Text>
        <nav aria-label="Legal">
          {legalLinks.map(([label, href]) => (
            <Link key={label} href={href}>{label}</Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
