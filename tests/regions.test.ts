import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../src/lib/api/contracts";
import { fetchCountries } from "../src/lib/regions";

const api = vi.hoisted(() => vi.fn());
vi.mock("../src/lib/api/client", () => ({ api }));

const countries = [
  {
    code: "IN",
    name: "India",
    dialCode: "+91",
    defaultTimezone: "Asia/Kolkata",
    guardianConsentAge: 18,
  },
];

/** The error a promise rejects with. */
async function failure(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    return error as ApiError;
  }
  throw new Error("expected the promise to reject");
}

describe("fetchCountries", () => {
  beforeEach(() => api.mockClear());

  it("returns the countries on the first try", async () => {
    api.mockResolvedValueOnce({ data: countries });
    await expect(fetchCountries([0])).resolves.toEqual(countries);
    expect(api).toHaveBeenCalledTimes(1);
  });

  it("tries again after a network failure or a server error, then succeeds", async () => {
    api
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockRejectedValueOnce(new ApiError(504, "Gateway Timeout"))
      .mockResolvedValueOnce({ data: countries });
    await expect(fetchCountries([0, 0, 0])).resolves.toEqual(countries);
    expect(api).toHaveBeenCalledTimes(3);
  });

  it("gives up with the last error once the attempts run out", async () => {
    for (let i = 0; i < 3; i++)
      api.mockRejectedValueOnce(new ApiError(502, "Bad Gateway"));
    const error = await failure(fetchCountries([0, 0]));
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(502);
    expect(api).toHaveBeenCalledTimes(3);
  });

  it("does not retry a client error", async () => {
    api.mockRejectedValueOnce(new ApiError(404, "Not found"));
    const error = await failure(fetchCountries([0, 0]));
    expect((error as ApiError).status).toBe(404);
    expect(api).toHaveBeenCalledTimes(1);
  });
});
