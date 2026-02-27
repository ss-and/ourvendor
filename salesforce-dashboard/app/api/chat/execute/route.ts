import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/chat/execute
 *
 * 解析済みの Intent を実際の Salesforce Org に適用する。
 *
 * ── 現在の動作 ──────────────────────────────────────────
 *   SF環境変数が未設定 → DRY_RUN モードで応答
 *   SF環境変数が設定済み → 将来的にリアル実行（TODO）
 *
 * ── リクエスト ────────────────────────────────────────────
 *   { instruction, action, parameters, dryRun? }
 *
 * ── レスポンス ────────────────────────────────────────────
 *   { success, action, message, status, dryRun, sfConfigured, executedAt }
 */

interface ExecuteRequest {
  instruction: string;
  action: string;
  parameters: Record<string, unknown>;
  dryRun?: boolean;
}

interface ExecuteResponse {
  success: boolean;
  action: string;
  message: string;
  status: "success" | "failed" | "dry_run";
  dryRun: boolean;
  sfConfigured: boolean;
  executedAt: string;
}

function buildDryRunMessage(
  action: string,
  parameters: Record<string, unknown>
): string {
  const sfSetupGuide = "実際の実行には SF_CLIENT_ID と SF_PASSWORD (または JWT設定) が必要です。";

  switch (action) {
    case "ADD_FIELD":
      return (
        `[DRY RUN] ${parameters.objectApiName ?? "対象オブジェクト"} に ` +
        `${parameters.fieldApiName ?? "新規項目"} (${parameters.fieldType ?? "不明"}型) を追加する操作を確認しました。\n` +
        sfSetupGuide
      );
    case "MODIFY_FIELD":
      return (
        `[DRY RUN] ${parameters.objectApiName}.${parameters.fieldApiName} の更新を確認しました。\n` +
        sfSetupGuide
      );
    case "DELETE_FIELD":
      return (
        `[DRY RUN] ${parameters.objectApiName}.${parameters.fieldApiName} の削除を確認しました。\n` +
        `⚠️ この操作は元に戻せません。SF接続設定後に実行してください。\n` +
        sfSetupGuide
      );
    case "ADD_PERMISSION":
      return (
        `[DRY RUN] 権限セット「${parameters.permissionSetName ?? "対象"}」への権限付与を確認しました。\n` +
        sfSetupGuide
      );
    case "REVOKE_PERMISSION":
      return (
        `[DRY RUN] 権限セット「${parameters.permissionSetName ?? "対象"}」からの権限削除を確認しました。\n` +
        sfSetupGuide
      );
    case "CREATE_VALIDATION_RULE":
      return (
        `[DRY RUN] ${parameters.objectApiName ?? "対象"} に入力規則「${parameters.ruleName ?? "新規ルール"}」を作成する操作を確認しました。\n` +
        sfSetupGuide
      );
    case "TOGGLE_VALIDATION_RULE":
      return (
        `[DRY RUN] ${parameters.objectApiName}.${parameters.ruleName ?? "入力規則"} を ` +
        `${parameters.active ? "有効" : "無効"} にする操作を確認しました。\n` +
        sfSetupGuide
      );
    case "DESCRIBE_OBJECT":
      return (
        `[DRY RUN] ${parameters.objectApiName ?? "対象"} オブジェクトの情報取得を確認しました。\n` +
        sfSetupGuide
      );
    default:
      return `[DRY RUN] 操作を確認しました。\n${sfSetupGuide}`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ExecuteRequest;
    const { instruction, action, parameters, dryRun = false } = body;

    if (!instruction?.trim() || !action) {
      return NextResponse.json(
        { error: "instruction と action は必須です" },
        { status: 400 }
      );
    }

    // SF 環境変数の確認
    const sfConfigured = !!(
      process.env.SF_CLIENT_ID &&
      (process.env.SF_JWT_PRIVATE_KEY_PATH || process.env.SF_PASSWORD)
    );

    const shouldDryRun = dryRun || !sfConfigured;

    if (shouldDryRun) {
      const response: ExecuteResponse = {
        success: true,
        action,
        message: buildDryRunMessage(action, parameters ?? {}),
        status: "dry_run",
        dryRun: true,
        sfConfigured,
        executedAt: new Date().toISOString(),
      };
      return NextResponse.json(response);
    }

    // ── 将来: リアル Salesforce 実行 ─────────────────────────
    // SF環境変数が設定されたときにここを有効化する
    //
    // import { SalesforceSkill } from "@/lib/skill/SalesforceSkill";
    // const skill = new SalesforceSkill({ dryRun: false });
    // const result = await skill.execute(instruction);
    // return NextResponse.json({
    //   success: result.success,
    //   action: result.action,
    //   message: result.message,
    //   status: result.success ? "success" : "failed",
    //   dryRun: false,
    //   sfConfigured: true,
    //   executedAt: result.executedAt.toISOString(),
    // });

    // SF設定あり・実行未実装の暫定フォールバック
    const response: ExecuteResponse = {
      success: false,
      action,
      message:
        "Salesforce 接続設定は検出されましたが、実行エンジンは現在実装中です (Phase 2c)。",
      status: "failed",
      dryRun: false,
      sfConfigured: true,
      executedAt: new Date().toISOString(),
    };
    return NextResponse.json(response, { status: 501 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "内部エラー";
    console.error("[POST /api/chat/execute]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
