import { Resend } from "resend";

const TO_EMAIL = "sohomroy1504@gmail.com";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const idea = typeof body?.idea === "string" ? body.idea.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!idea) {
    return Response.json({ error: "Tell us what to build." }, { status: 400 });
  }
  if (idea.length > 4000) {
    return Response.json({ error: "That's a lot — try trimming it down." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured.");
    return Response.json(
      { error: "Email isn't configured yet. Try again shortly." },
      { status: 503 }
    );
  }

  const resend = new Resend(apiKey);
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const { error } = await resend.emails.send({
    from: "Elves <onboarding@resend.dev>",
    to: TO_EMAIL,
    replyTo: email || undefined,
    subject: "Someone summoned the Elves",
    text: `${idea}\n\n${email ? `From: ${email}` : "No reply email given."}`,
    html: `<p style="white-space:pre-wrap;font-family:sans-serif;font-size:15px;line-height:1.6;">${escape(idea)}</p>
      <p style="font-family:monospace;font-size:12px;color:#888;">${email ? `Reply to: ${escape(email)}` : "No reply email given."}</p>`,
  });

  if (error) {
    console.error("Resend error:", error);
    return Response.json({ error: "Couldn't send that. Try again." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
