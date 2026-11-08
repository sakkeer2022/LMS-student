import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/contracts";

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  defaultTimezone: string;
  guardianConsentAge: number;
}

/** Waits between attempts: a host that was idle can take a minute to answer the first request. */
export const RETRY_DELAYS_MS = [2000, 4000, 8000, 15000];

/**
 * The served countries, which the whole form needs. A network failure or a 5xx is tried again after each
 * delay, so a server that is still waking up does not show an error; a 4xx is returned at once.
 */
export async function fetchCountries(
  delays: readonly number[] = RETRY_DELAYS_MS,
): Promise<Country[]> {
  for (let attempt = 0; ; attempt++) {
    try {
      return (await api<Country[]>("/regions/countries")).data;
    } catch (error) {
      const retryable = !(error instanceof ApiError) || error.status >= 500;
      const delay = delays[attempt];
      if (!retryable || delay === undefined) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
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
