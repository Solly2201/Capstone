import { beforeEach, describe, expect, it, vi } from "vitest";

// The mailer is exercised with a stubbed transport and a controlled env:
// no SMTP connection is ever opened in tests.
const { sendMailMock, createTransportMock } = vi.hoisted(() => {
  const sendMailMock = vi.fn();
  return {
    sendMailMock,
    createTransportMock: vi.fn(() => ({ sendMail: sendMailMock }))
  };
});

vi.mock("nodemailer", () => ({
  default: { createTransport: createTransportMock }
}));

const { envState } = vi.hoisted(() => ({ envState: {} as Record<string, unknown> }));
vi.mock("../config/env.js", () => ({ env: envState }));

import { isMailConfigured, resetMailerForTests, sendVerificationEmail } from "./mailer.js";

beforeEach(() => {
  vi.clearAllMocks();
  resetMailerForTests();
  for (const key of Object.keys(envState)) delete envState[key];
  envState.WEB_ORIGIN = "https://cap.example";
  envState.MAIL_FROM = "CAP <no-reply@cap.example>";
});

describe("mailer", () => {
  it("reports unconfigured without SMTP_URL and sends nothing", async () => {
    expect(isMailConfigured()).toBe(false);
    expect(await sendVerificationEmail("asha@example.com", "token123")).toBe(false);
    expect(createTransportMock).not.toHaveBeenCalled();
  });

  it("sends the verification link through the configured transport", async () => {
    envState.SMTP_URL = "smtp://user:pass@mail.example:587";
    sendMailMock.mockResolvedValue({});

    expect(isMailConfigured()).toBe(true);
    const sent = await sendVerificationEmail("asha@example.com", "abc123");

    expect(sent).toBe(true);
    expect(createTransportMock).toHaveBeenCalledWith("smtp://user:pass@mail.example:587");
    const message = sendMailMock.mock.calls[0][0];
    expect(message.to).toBe("asha@example.com");
    expect(message.from).toBe("CAP <no-reply@cap.example>");
    // The link targets the deployed web origin's verify page with the
    // same single-use token the development flow uses.
    expect(message.text).toContain("https://cap.example/verify-email?token=abc123");
  });

  it("degrades a transport failure to false instead of throwing", async () => {
    envState.SMTP_URL = "smtp://user:pass@mail.example:587";
    sendMailMock.mockRejectedValue(new Error("connection refused"));

    await expect(sendVerificationEmail("asha@example.com", "abc123")).resolves.toBe(false);
  });

  it("URL-encodes the token", async () => {
    envState.SMTP_URL = "smtp://user:pass@mail.example:587";
    sendMailMock.mockResolvedValue({});

    await sendVerificationEmail("asha@example.com", "a+b/c");

    expect(sendMailMock.mock.calls[0][0].text).toContain("token=a%2Bb%2Fc");
  });
});
