import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/validations";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;

    const { data, error } = await resend.emails.send({
      from: `Portfolio Contact <${process.env.RESEND_EMAIL_FROM}>`,
      to: [process.env.RESEND_EMAIL_TO!],
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
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
