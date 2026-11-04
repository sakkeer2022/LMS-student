import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { navLinks } from "./content";
import { LoginMenu } from "./login-menu";

export function SiteHeader() {
  return (
    <header className="relative z-[3] flex h-[72px] items-center justify-between border-b border-white/16 bg-[url('/landing/header-bg.png')] bg-cover bg-center px-20 text-white backdrop-blur-[11.85px] max-[1100px]:px-5">
      <Link href="/" aria-label="Amentorz home" className="block h-4 w-[107px]">
        <Image src="/landing/logo-white.svg" alt="Amentorz" width={107} height={16} priority />
      </Link>
      <nav aria-label="Main" className="flex items-center gap-8 max-[1100px]:hidden">
        {navLinks.map((item) => (
          <Link key={item.label} href={item.href} className="inline-flex items-center gap-1 text-sm leading-5">
            {item.label}
            {"menu" in item && <ChevronDown size={16} aria-hidden />}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <LoginMenu />
        <Button asChild>
          <Link href="/signup">Sign up free</Link>
        </Button>
      </div>
    </header>
  );
}
