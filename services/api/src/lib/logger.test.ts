import pino from "pino";
import { describe, expect, it } from "vitest";
import { logger, redactOptions } from "./logger.js";

/**
 * Redaction is a security control, so it is tested rather than assumed.
 *
 * The exported logger is silent under NODE_ENV=test, so these build a
 * probe from the same `redactOptions` the app uses and capture what it
 * serialises. Testing the shared options means the app cannot drift away
 * from what is asserted here.
 */
const probe = () => {
  const lines: string[] = [];
  const instance = pino(
    { level: "info", redact: redactOptions },
    { write: (line: string) => lines.push(line) } as never
  );
  return { instance, output: () => lines.join("") };
};

describe("logger redaction", () => {
  it("never writes a bearer token from a request header", () => {
    const { instance, output } = probe();

    instance.info(
      { req: { headers: { authorization: "Bearer super.secret.jwt", accept: "application/json" } } },
      "incoming"
    );

    expect(output()).not.toContain("super.secret.jwt");
    expect(output()).toContain("[redacted]");
    expect(output()).toContain("application/json");
  });

  it("never writes a raw password or its hash", () => {
    const { instance, output } = probe();

    instance.info(
      {
        body: { email: "citizen@example.com", password: "not-a-real-password-9f3a" },
        user: { passwordHash: "$2b$12$abcdefghijklmnop" }
      },
      "register"
    );

    expect(output()).not.toContain("not-a-real-password-9f3a");
    expect(output()).not.toContain("$2b$12$abcdefghijklmnop");
    expect(output()).toContain("citizen@example.com");
  });

  it("never writes a verification token or its hash", () => {
    const { instance, output } = probe();

    instance.info(
      { verification: { token: "raw-verification-token", tokenHash: "sha256-of-it" } },
      "verify"
    );

    expect(output()).not.toContain("raw-verification-token");
    expect(output()).not.toContain("sha256-of-it");
  });

  it("never writes a session cookie", () => {
    const { instance, output } = probe();

    instance.info({ req: { headers: { cookie: "session=do-not-log-me" } } }, "incoming");

    expect(output()).not.toContain("do-not-log-me");
  });

  it("stays silent in the test environment so suites are readable", () => {
    expect(logger.level).toBe("silent");
  });
});
