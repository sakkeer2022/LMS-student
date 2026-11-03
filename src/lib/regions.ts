import { api } from "@/lib/api/client";

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  defaultTimezone: string;
  guardianConsentAge: number;
}

export async function fetchCountries(): Promise<Country[]> {
  return (await api<Country[]>("/regions/countries")).data;
}

/** Spaces, dashes and brackets removed; a leading 00 becomes +. The result is not yet checked. */
export function normalizeMobile(input: string): string {
  const compact = input.replace(/[\s\-().]/g, "");
  return compact.startsWith("00") ? `+${compact.slice(2)}` : compact;
}

export const E164 = /^\+[1-9][0-9]{7,14}$/;

/** The served country whose dialling code starts the number (the longest code wins). */
export function countryOfMobile(
  e164: string,
  countries: readonly Country[],
): Country | undefined {
  if (!E164.test(e164)) return undefined;
  return [...countries]
    .sort((a, b) => b.dialCode.length - a.dialCode.length)
    .find((country) => e164.startsWith(country.dialCode));
}
