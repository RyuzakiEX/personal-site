import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema, spamCheckSchema } from "@/lib/validations";

const resend = new Resend(process.env.RESEND_API_KEY);

// The form token is issued per request, so the GET below must never be cached.
export const dynamic = "force-dynamic";

// Anything faster than this is a script, not a person typing.
const MIN_FILL_MS = 3000;
// Long enough for a visitor who leaves the tab open over lunch.
const MAX_TOKEN_AGE_MS = 24 * 60 * 60 * 1000;

// Best effort: each serverless instance keeps its own count, so this slows a
// single flood down rather than enforcing a hard global limit.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const recentRequests = new Map<string, number[]>();
let lastSweep = 0;

function isRateLimited(ip: string) {
  const now = Date.now();

  // Drop idle entries at most once per window so the map can't grow without
  // bound, without walking it on every request.
  if (now - lastSweep > RATE_WINDOW_MS) {
    lastSweep = now;
    recentRequests.forEach((times, key) => {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) recentRequests.delete(key);
    });
  }

  const timestamps = (recentRequests.get(ip) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS
  );
  // Stop recording once over the limit so a flood can't grow the list.
  if (timestamps.length > RATE_LIMIT) return true;
  timestamps.push(now);
  recentRequests.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT;
}

// Vercel sets these itself, so visitors can't spoof them. Without a proxy
// there is no trustworthy address, and the limit is skipped rather than
// putting every visitor in one shared bucket.
function clientIp(request: NextRequest) {
  return request.ip ?? request.headers.get("x-real-ip");
}

// The token is "<issuedAt>.<signature>", signed with the Resend key so no
// extra secret is needed. Both its issue and its check use the server's
// clock, so a visitor's wrong system clock can't affect the result.
function sign(issuedAt: string) {
  return createHmac("sha256", `contact-form:${process.env.RESEND_API_KEY ?? ""}`)
    .update(issuedAt)
    .digest("hex");
}

function tokenAge(token: string | undefined) {
  const [issuedAt, signature] = token?.split(".") ?? [];
  if (!issuedAt || !signature) return null;
  const expected = Buffer.from(sign(issuedAt));
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return null;
  }
  return Date.now() - Number(issuedAt);
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function GET() {
  const issuedAt = String(Date.now());
  return NextResponse.json(
    { token: `${issuedAt}.${sign(issuedAt)}` },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: NextRequest) {
  try {
    const ip = clientIp(request);
    if (ip && isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many messages. Please wait a few minutes and try again." },
        { status: 429 }
      );
    }

    const body = await request.json();

    const spamCheck = spamCheckSchema.safeParse(body);
    const { hp_check: honeypot, token } = spamCheck.success ? spamCheck.data : {};
    const age = tokenAge(token);

    // A missing or bad token is more likely a stale page than a bot, so say so
    // instead of failing silently.
    if (age === null || age > MAX_TOKEN_AGE_MS) {
      return NextResponse.json(
        { error: "This form has expired. Please refresh the page and try again." },
        { status: 400 }
      );
    }

    // Pretend bot submissions worked so they don't retry or adapt.
    if (honeypot || age < MIN_FILL_MS) {
      return NextResponse.json({ success: true });
    }

    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Escaped copies for the HTML body; the raw values only go in headers.
    const name = escapeHtml(parsed.data.name);
    const email = escapeHtml(parsed.data.email);
    const subject = escapeHtml(parsed.data.subject);
    const message = escapeHtml(parsed.data.message);

    const { data, error } = await resend.emails.send({
      from: `Portfolio Contact <${process.env.RESEND_EMAIL_FROM}>`,
      to: [process.env.RESEND_EMAIL_TO!],
      replyTo: parsed.data.email,
      subject: `[Portfolio] ${parsed.data.subject}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0f2c; border-radius: 12px; overflow: hidden; border: 1px solid #1a2a5e;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0d1b4b 0%, #1a2a5e 100%); padding: 32px 40px; border-bottom: 2px solid #00d4ff;">
            <p style="margin: 0 0 4px; font-size: 12px; letter-spacing: 2px; color: #00d4ff; text-transform: uppercase;">Portfolio Contact</p>
            <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #ffffff;">New Message Received</h1>
          </div>

          <!-- Body -->
          <div style="padding: 32px 40px;">
            <!-- Sender info -->
            <div style="background-color: #0d1b4b; border: 1px solid #1a2a5e; border-radius: 8px; padding: 20px 24px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; width: 80px; font-size: 12px; letter-spacing: 1px; color: #6b7db3; text-transform: uppercase; vertical-align: top;">From</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #e2e8f0; font-weight: 500;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 12px; letter-spacing: 1px; color: #6b7db3; text-transform: uppercase; vertical-align: top;">Email</td>
                  <td style="padding: 6px 0; font-size: 14px;"><a href="mailto:${email}" style="color: #00d4ff; text-decoration: none;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 12px; letter-spacing: 1px; color: #6b7db3; text-transform: uppercase; vertical-align: top;">Subject</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #e2e8f0;">${subject}</td>
                </tr>
              </table>
            </div>

            <!-- Message -->
            <p style="margin: 0 0 10px; font-size: 12px; letter-spacing: 1px; color: #6b7db3; text-transform: uppercase;">Message</p>
            <div style="background-color: #0d1b4b; border-left: 3px solid #00d4ff; border-radius: 0 8px 8px 0; padding: 20px 24px;">
              <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #cbd5e1; white-space: pre-wrap;">${message}</p>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 20px 40px; border-top: 1px solid #1a2a5e; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #3d5080;">Reply directly to this email to respond to ${name}</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("Contact route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
