import { Resend } from "resend";
import { render } from "@react-email/components";

import { ResetPasswordEmail } from "@/emails/reset-password";
import { WelcomeEmail } from "@/emails/welcome";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const from = process.env.EMAIL_FROM ?? "AI Job Tracker <no-reply@example.com>";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

async function send(payload: EmailPayload): Promise<boolean> {
  if (!resend) {
    console.info("[email] Resend not configured. Email would have been sent:", {
      to: payload.to,
      subject: payload.subject,
    });
    return false;
  }

  try {
    await resend.emails.send({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
    return true;
  } catch (error) {
    console.error("[email] Failed to send email:", error);
    return false;
  }
}

export async function sendResetPasswordEmail(to: string, name: string | null, resetUrl: string) {
  const html = await render(
    ResetPasswordEmail({ name: name ?? "there", resetUrl }),
  );
  return send({ to, subject: "Reset your password", html });
}

export async function sendWelcomeEmail(to: string, name: string | null) {
  const html = await render(WelcomeEmail({ name: name ?? "there" }));
  return send({ to, subject: "Welcome to AI Job Application Tracker", html });
}
