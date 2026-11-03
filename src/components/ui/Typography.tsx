import type { ComponentPropsWithoutRef, ElementType } from "react";

/** Heading and text elements live here so feature code never uses native h1-h6 (UI lint). */
type Level = 1 | 2 | 3 | 4;

export function Heading({
  level = 2,
  ...props
}: ComponentPropsWithoutRef<"h2"> & { level?: Level }) {
  const Tag = `h${level}` as ElementType;
  return <Tag {...props} />;
}

export function Text({
  as: Tag = "p",
  ...props
}: ComponentPropsWithoutRef<"p"> & { as?: "p" | "span" }) {
  return <Tag {...props} />;
}
