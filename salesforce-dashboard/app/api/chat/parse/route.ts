import { NextRequest, NextResponse } from "next/server";
import { parseIntent } from "@/lib/intentParser";

/**
 * POST /api/chat/parse
 *
 * 自然言語の指示を Claude API で解析し、ParsedIntentPreview を返す。
 * ANTHROPIC_API_KEY が未設定の場合は 503 を返す。
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { instruction, context } = body as {
      instruction?: string;
      context?: string;
    };

    if (!instruction?.trim()) {
      return NextResponse.json(
        { error: "instruction は必須です" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error:
            "ANTHROPIC_API_KEY が設定されていません。.env.local に ANTHROPIC_API_KEY を追加してください。",
          code: "NO_API_KEY",
        },
        { status: 503 }
      );
    }

    const preview = await parseIntent(instruction.trim(), context);
    return NextResponse.json(preview);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "内部エラー";
    console.error("[POST /api/chat/parse]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
