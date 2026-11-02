import Image from "next/image";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ButtonLink, HoverMenu, Link } from "@/components/ui";
import { loginOptions, navLinks } from "./content";

export function SiteHeader() {
  return (
    <header className="lp-header">
      <Link href="/" aria-label="Amentorz home" className="lp-logo">
        <Image src="/landing/logo-white.svg" alt="Amentorz" width={107} height={16} priority />
      </Link>
      <nav aria-label="Main" className="lp-nav">
        {navLinks.map((item) => (
          <Link key={item.label} href={item.href} className="lp-nav__link">
            {item.label}
            {"menu" in item && <ChevronDown size={16} aria-hidden />}
          </Link>
        ))}
      </nav>
      <div className="lp-actions">
        <HoverMenu label="Log in" className="lp-login" triggerClassName="ui-button ui-button--ghost ui-button--md">
          <ul className="lp-login__list">
            {loginOptions.map((option) => (
              <li key={option.label}>
                <Link href={option.href} className="lp-login__item">
                  {option.label}
                  <ChevronRight size={14} aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </HoverMenu>
        <ButtonLink href="/signup" variant="primary">
          Sign up free
        </ButtonLink>
      </div>
    </header>
  );
}
