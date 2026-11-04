"use client";
import Link from "next/link";
import { useRef, useState, type PointerEvent } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { loginOptions } from "./content";

/**
 * The header's Log in menu. It opens on mouse hover (as the design does) and also on tap, Enter or Space,
 * with arrow-key navigation, Escape to close and focus returned to the button.
 */
export function LoginMenu() {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const button = useRef<HTMLButtonElement>(null);

  // Only a mouse hovers; a delay keeps the menu open while the pointer crosses from the button to the list
  const hover = (next: boolean) => (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    window.clearTimeout(timer.current);
    if (next) setOpen(true);
    else timer.current = window.setTimeout(() => setOpen(false), 120);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger
        asChild
        // A mouse click on a menu that hover already opened must not close it again
        onPointerDown={(event) => {
          if (event.pointerType === "mouse" && open) event.preventDefault();
        }}
      >
        <Button
          ref={button}
          variant="ghost"
          className="text-white hover:bg-white/12 hover:text-white data-[state=open]:bg-white/12"
          onPointerEnter={hover(true)}
          onPointerLeave={hover(false)}
        >
          Log in
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={0}
        // The same mouse press that hover already answered must not dismiss the menu as an outside click
        onInteractOutside={(event) => {
          const original = event.detail.originalEvent;
          if (
            "pointerType" in original &&
            original.pointerType === "mouse" &&
            button.current?.contains(event.target as Node)
          )
            event.preventDefault();
        }}
        className="w-[212px] rounded-card border border-[#ccc] bg-card px-5 py-2"
        onPointerEnter={hover(true)}
        onPointerLeave={hover(false)}
      >
        {loginOptions.map((option) => (
          <DropdownMenuItem
            key={option.label}
            asChild
            className="cursor-pointer rounded-none border-[rgba(110,110,110,0.1)] px-0 py-0 not-first:border-t focus:bg-transparent focus:text-accent-foreground"
          >
            <Link
              href={option.href}
              className="flex items-center justify-between py-3 text-base leading-6 font-medium tracking-[0.01em] text-[#282828]"
            >
              {option.label}
              <ChevronRight size={14} aria-hidden className="text-[#9a8c8c]" />
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
