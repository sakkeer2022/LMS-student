import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../src/components/data-table/data-table";
import { TablePagination } from "../src/components/data-table/table-pagination";
import { initialsOf } from "../src/components/layout/initials";
import { cn } from "../src/lib/utils";
import { SignaturePad } from "../src/components/forms/SignaturePad";
import { OtpInput } from "../src/components/forms/OtpInput";
import { DatePicker } from "../src/components/forms/DatePicker";
import { AppDialog } from "../src/components/forms/AppDialog";
import { Stepper } from "../src/features/signup/components/stepper";

type Row = { name: string; fee: number };
const columns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "fee", header: "Fee", meta: { align: "right" } },
];

describe("DataTable", () => {
  it("renders headers, rows and an accessible caption", () => {
    const html = renderToStaticMarkup(
      <DataTable caption="Fees" columns={columns} data={[{ name: "Aarav", fee: 1450 }]} />,
    );
    expect(html).toContain("<caption");
    expect(html).toContain("Fees");
    expect(html).toContain("Aarav");
    expect(html).toContain("1450");
    expect(html).toContain("text-right");
  });
  it("shows the empty message only when there are no rows", () => {
    const html = renderToStaticMarkup(
      <DataTable caption="Fees" columns={columns} data={[]} empty="Nothing here" />,
    );
    expect(html).toContain("Nothing here");
    expect(html).toContain('colSpan="2"');
  });
  it("shows placeholders instead of rows while loading", () => {
    const html = renderToStaticMarkup(
      <DataTable caption="Fees" columns={columns} data={[{ name: "Aarav", fee: 1 }]} loading loadingRows={2} />,
    );
    expect(html).not.toContain("Aarav");
    expect(html.match(/<tr/g)).toHaveLength(3);
  });
});

describe("TablePagination", () => {
  it("describes the visible range and disables the unavailable direction", () => {
    const html = renderToStaticMarkup(
      <TablePagination page={1} limit={6} total={214} noun="sessions" onPage={() => {}} />,
    );
    expect(html).toContain("Showing 1–6 of 214 sessions");
    expect(html).toMatch(/disabled="">Previous/);
    expect(html).not.toMatch(/disabled="">Next/);
  });
  it("reports an empty result as 0–0", () => {
    const html = renderToStaticMarkup(
      <TablePagination page={1} limit={6} total={0} noun="users" onPage={() => {}} />,
    );
    expect(html).toContain("Showing 0–0 of 0 users");
  });
});

describe("helpers", () => {
  it("builds initials from the first and last name, with a neutral mark before load", () => {
    expect(initialsOf("Priya Nair")).toBe("PN");
    expect(initialsOf("  priya  kumari  nair ")).toBe("PN");
    expect(initialsOf("Priya")).toBe("P");
    expect(initialsOf(undefined)).toBe("•");
  });
  it("lets the last Tailwind utility win when classes conflict", () => {
    expect(cn("px-2", "px-4", false && "hidden")).toBe("px-4");
  });
});

describe("signup controls keep the behaviour their logic depends on", () => {
  it("the signature canvas is a block that fills its box and stops the page scrolling under a finger", () => {
    const html = renderToStaticMarkup(<SignaturePad />);
    const canvas = html.match(/<canvas[^>]*>/)?.[0] ?? "";
    expect(canvas).toContain("touch-none");
    expect(canvas).toContain("block");
    expect(canvas).toContain("h-full");
    expect(canvas).toContain("w-full");
    expect(canvas).toContain('role="img"');
    expect(html).toContain("Draw your signature here");
  });
  it("the code input is six numeric boxes with the first marked for autofocus", () => {
    const html = renderToStaticMarkup(<OtpInput value="12" onChange={() => {}} autoFocus />);
    expect(html.match(/<input/g)).toHaveLength(6);
    expect(html).toContain('aria-label="Digit 1 of 6"');
    expect(html.match(/data-autofocus/g)).toHaveLength(1);
    expect(html).toContain('inputMode="numeric"');
  });
  it("the date field shows the typed value masked and a labelled calendar button", () => {
    const html = renderToStaticMarkup(<DatePicker id="dob" name="dob" value="2012-08-15" onChange={() => {}} />);
    expect(html).toContain('value="15 / 08 / 2012"');
    expect(html).toContain('aria-label="Change date, 15 / 08 / 2012"');
    expect(html).toContain('autoComplete="bday"');
    expect(html).not.toContain("Choose a date</");
  });
  it("a closed dialog renders nothing and the stepper marks done, current and optional steps", () => {
    expect(renderToStaticMarkup(<AppDialog open={false} onClose={() => {}} title="T">x</AppDialog>)).toBe("");
    const html = renderToStaticMarkup(<Stepper current={2} optional={[3]} />);
    expect(html).toContain('aria-current="step"');
    expect(html).toContain("(optional)");
    expect(html.match(/data-state="done"/g)).toHaveLength(1);
    expect(html.match(/data-state="todo"/g)).toHaveLength(2);
  });
});
