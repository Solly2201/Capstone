import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

// Verification email delivery, active only when SMTP_URL is configured.
//
// No external provider is assumed or required: a deployment supplies its
// own SMTP endpoint (or none, and keeps the development flow). The
// transport is created lazily so an unconfigured or test process never
// opens a connection.

let transporter: Transporter | null = null;

export const isMailConfigured = (): boolean => Boolean(env.SMTP_URL);

const transport = (): Transporter => {
  if (!transporter) transporter = nodemailer.createTransport(env.SMTP_URL);
  return transporter;
};

/** Test seam: drop the cached transport so a new SMTP_URL takes effect. */
export const resetMailerForTests = (): void => {
  transporter = null;
};

/**
 * Sends the verification link. The token is the same single-use, hashed,
 * 24-hour challenge the development flow uses -- only the delivery
 * channel differs. Returns false (and logs) on failure rather than
 * throwing, so a mail outage degrades to "use resend later" instead of
 * failing the registration that already created the account.
 */
export const sendVerificationEmail = async (to: string, token: string): Promise<boolean> => {
  if (!isMailConfigured()) return false;

  const link = `${env.WEB_ORIGIN}/verify-email?token=${encodeURIComponent(token)}`;
  try {
    await transport().sendMail({
      from: env.MAIL_FROM,
      to,
      subject: "Confirm your email address for CAP",
      text:
        `Confirm your email address to activate your Citizen Assistance Technology account.\n\n` +
        `Open this link within 24 hours:\n${link}\n\n` +
        `If you did not create this account, ignore this message.`
    });
    return true;
  } catch (error) {
    logger.error({ err: error, to }, "verification email failed to send");
    return false;
  }
};
