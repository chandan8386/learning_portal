import { describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { loginSchema, registerSchema } from "@/lib/validation";

describe("validation", () => {
  it("accepts a valid kid registration and lowercases the username", () => {
    const parsed = registerSchema.parse({
      name: " Riya ",
      username: "Riya2019",
      avatar: "lion",
      classSlug: "class-1",
      pin: "0427",
    });
    expect(parsed.username).toBe("riya2019");
    expect(parsed.name).toBe("Riya");
  });

  it("rejects PINs that are not exactly 4 digits", () => {
    for (const pin of ["123", "12345", "12a4", ""]) {
      expect(loginSchema.safeParse({ username: "riya", pin }).success, pin).toBe(false);
    }
  });

  it("rejects unknown avatars and bad usernames", () => {
    const base = { name: "A", username: "abc", avatar: "lion", classSlug: "ukg", pin: "1111" };
    expect(registerSchema.safeParse({ ...base, avatar: "dragon" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, username: "a b" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, username: "ab" }).success).toBe(false);
  });
});

describe("rate limit", () => {
  it("blocks after the limit within the window and resets after it", () => {
    const key = "test-user";
    resetRateLimit(key);
    const now = 1_000_000;
    for (let i = 0; i < 5; i++) expect(checkRateLimit(key, 5, 60_000, now)).toBe(true);
    expect(checkRateLimit(key, 5, 60_000, now + 1)).toBe(false);
    expect(checkRateLimit(key, 5, 60_000, now + 60_001)).toBe(true);
  });
});
