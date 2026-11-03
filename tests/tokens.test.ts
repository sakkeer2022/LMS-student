import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../src");

function files(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? files(full) : [full];
  });
}

describe("design tokens", () => {
  it("defines every CSS variable the screens use (an undefined one silently drops the style)", () => {
    const tokens = fs.readFileSync(
      path.join(root, "styles/tokens.css"),
      "utf8",
    );
    const defined = new Set(
      [...tokens.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((match) => match[1]),
    );
    // Set by Next's font loader and by react-day-picker, not by our tokens
    const external = /^--(font-manrope|rdp-)/;
    const missing = new Set<string>();
    for (const file of files(root).filter((name) =>
      /\.(css|tsx)$/.test(name),
    )) {
      const source = fs.readFileSync(file, "utf8");
      // A variable with a fallback, var(--x, value), may be intentionally undefined
      for (const match of source.matchAll(/var\((--[a-z0-9-]+)\s*\)/g)) {
        const name = match[1]!;
        const declaredLocally = new RegExp(`${name}\\s*:`).test(source);
        if (!defined.has(name) && !declaredLocally && !external.test(name)) {
          missing.add(`${name} (${path.relative(root, file)})`);
        }
      }
    }
    expect([...missing]).toEqual([]);
  });
});
