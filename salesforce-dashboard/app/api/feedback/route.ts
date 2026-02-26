import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const webhookUrl = process.env.FEEDBACK_WEBHOOK_URL;
  if (webhookUrl) {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `[Feedback] ${message.trim()}` }),
    });
  } else {
    console.log("[feedback]", message.trim());
  }

  return NextResponse.json({ ok: true });
}
