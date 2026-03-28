/**
 * IntentParser — Next.js 向け Claude API クライアント
 *
 * salesforce-automation-skill/src/nlp/IntentParser.ts をベースに
 * Next.js (App Router / Server Components) 環境向けに再実装。
 *
 * - `.js` 拡張子なし（Next.js bundler モジュール解決に対応）
 * - ParsedIntentPreview (frontend型) を直接返す
 * - ANTHROPIC_API_KEY は環境変数から自動取得
 */

import Anthropic from "@anthropic-ai/sdk";
import type { ParsedIntentPreview, ActionType } from "./types";

const MODEL = "claude-sonnet-4-6";

// ── Tool スキーマ（バックエンドスキルと同一） ────────────────────────────────

const PARSE_TOOL: Anthropic.Tool = {
  name: "parse_salesforce_intent",
  description:
    "ユーザーの自然言語指示を解析し、Salesforce操作に必要な構造化パラメータを返す",
  input_schema: {
    type: "object" as const,
    required: ["action", "confidence", "reasoning", "parameters"],
    properties: {
      action: {
        type: "string",
        enum: [
          "ADD_FIELD", "MODIFY_FIELD", "DELETE_FIELD",
          "ADD_PERMISSION", "REVOKE_PERMISSION",
          "CREATE_VALIDATION_RULE", "TOGGLE_VALIDATION_RULE",
          "DESCRIBE_OBJECT", "UNKNOWN",
        ],
        description: "特定されたSalesforce操作の種別",
      },
      confidence: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description: "解析の確信度 (0.0〜1.0)",
      },
      reasoning: {
        type: "string",
        description: "判断の根拠・解釈内容",
      },
      parameters: {
        type: "object",
        description: "操作に必要なパラメータ群",
        properties: {
          objectApiName:    { type: "string" },
          fieldApiName:     { type: "string" },
          label:            { type: "string" },
          fieldType: {
            type: "string",
            enum: ["Text","Number","Date","DateTime","Checkbox","Picklist","Lookup","LongTextArea","Email","Phone","Url","Currency","Percent"],
          },
          required:         { type: "boolean" },
          length:           { type: "number" },
          precision:        { type: "number" },
          scale:            { type: "number" },
          picklistValues:   { type: "array", items: { type: "string" } },
          referenceTo:      { type: "string" },
          description:      { type: "string" },
          permissionSetName:{ type: "string" },
          objectPermissions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                objectApiName: { type: "string" },
                allowCreate:   { type: "boolean" },
                allowRead:     { type: "boolean" },
                allowEdit:     { type: "boolean" },
                allowDelete:   { type: "boolean" },
                viewAllRecords:  { type: "boolean" },
                modifyAllRecords:{ type: "boolean" },
              },
            },
          },
          fieldPermissions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                objectApiName: { type: "string" },
                fieldApiName:  { type: "string" },
                readable:      { type: "boolean" },
                editable:      { type: "boolean" },
              },
            },
          },
          ruleName:               { type: "string" },
          active:                 { type: "boolean" },
          errorConditionFormula:  { type: "string" },
          errorMessage:           { type: "string" },
          errorDisplayField:      { type: "string" },
          clarification:          { type: "string" },
        },
      },
    },
  },
};

const SYSTEM_PROMPT = `あなたはSalesforceの専門家AIアシスタントです。
ユーザーの自然言語による指示を解析し、Salesforce Metadata APIで実行可能な
構造化されたパラメータに変換してください。

## 解析ルール

### オブジェクト名
- 標準オブジェクトはそのまま (Account, Contact, Lead, Opportunity, Case)
- カスタムオブジェクトは __c サフィックスを付ける
- 日本語名が来た場合は標準的なSalesforce APINameに変換
  例: 「取引先」→ Account, 「商談」→ Opportunity, 「リード」→ Lead, 「担当者」→ Contact

### 項目APIName
- スペースをアンダースコアに変換し、__c サフィックスを付ける
- 例: "Customer Score" → Customer_Score__c
- 既存APINameが指定された場合はそのまま使用

### 項目型の推論
- スコア、金額、数量 → Number または Currency
- 日付 → Date, 日時 → DateTime
- メモ、備考、詳細 → LongTextArea
- フラグ、有無 → Checkbox
- メールアドレス → Email
- URL → Url
- 選択肢一覧 → Picklist

### Validation Rule 数式
- 日本語で書かれた条件を Salesforce 数式に変換する
- 空チェック: ISBLANK(field)
- 選択リスト値: ISPICKVAL(field, 'value')
- 複合条件: AND(), OR(), NOT()

### 信頼度スコア
- 1.0: パラメータが完全に特定できた
- 0.7〜0.9: ほぼ特定できたが一部推測を含む
- 0.5〜0.7: 複数の解釈が可能
- 0.5未満: UNKNOWNとして clarification を返す

### セキュリティ注意事項
- 権限の削除・オブジェクトの削除は必ず confidence を下げて確認を促す
- 本番環境への影響が大きい操作は reasoning に警告を含める`;

// ── Raw Tool Output ─────────────────────────────────────────────────────────

interface RawParameters {
  objectApiName?: string;
  fieldApiName?: string;
  label?: string;
  fieldType?: string;
  required?: boolean;
  length?: number;
  precision?: number;
  scale?: number;
  picklistValues?: string[];
  referenceTo?: string;
  description?: string;
  permissionSetName?: string;
  objectPermissions?: Array<{
    objectApiName: string;
    allowCreate: boolean;
    allowRead: boolean;
    allowEdit: boolean;
    allowDelete: boolean;
  }>;
  ruleName?: string;
  active?: boolean;
  errorConditionFormula?: string;
  errorMessage?: string;
  clarification?: string;
}

interface RawIntentOutput {
  action: ActionType;
  confidence: number;
  reasoning: string;
  parameters: RawParameters;
}

// ── 変換: Raw → ParsedIntentPreview ─────────────────────────────────────────

function buildPreview(raw: RawIntentOutput): ParsedIntentPreview & { _raw: RawIntentOutput } {
  const { action, confidence, reasoning, parameters } = raw;
  const warnings: string[] = [];

  // 破壊的操作の警告
  if (action === "DELETE_FIELD" || action === "REVOKE_PERMISSION") {
    warnings.push("この操作は元に戻すことができません。実行前に必ずバックアップを確認してください。");
  }
  // 低信頼度の警告
  if (confidence < 0.85) {
    warnings.push(`AI解析の信頼度: ${Math.round(confidence * 100)}%。内容を慎重に確認してください。`);
  }
  // Number型の精度警告
  if (action === "ADD_FIELD" && parameters.fieldType === "Number") {
    warnings.push("精度・小数点以下の桁数を確認してください（デフォルト: 精度18・小数0）");
  }
  // Picklist値の確認
  if (action === "ADD_FIELD" && parameters.fieldType === "Picklist" && !parameters.picklistValues?.length) {
    warnings.push("選択リストの値が指定されていません。後から追加できます。");
  }

  // action別の人間向け説明文を生成
  let description = "";
  switch (action) {
    case "ADD_FIELD":
      description = `${parameters.objectApiName ?? "不明"} オブジェクトに ${parameters.fieldApiName ?? "不明"} (${parameters.fieldType ?? "不明"}型) を作成します`;
      break;
    case "MODIFY_FIELD":
      description = `${parameters.objectApiName ?? "不明"}.${parameters.fieldApiName ?? "不明"} の設定を更新します`;
      break;
    case "DELETE_FIELD":
      description = `${parameters.objectApiName ?? "不明"}.${parameters.fieldApiName ?? "不明"} を削除します`;
      break;
    case "ADD_PERMISSION":
      description = `権限セット「${parameters.permissionSetName ?? "不明"}」に ${parameters.objectApiName ?? "対象オブジェクト"} への権限を付与します`;
      break;
    case "REVOKE_PERMISSION":
      description = `権限セット「${parameters.permissionSetName ?? "不明"}」から ${parameters.objectApiName ?? "対象オブジェクト"} への権限を削除します`;
      break;
    case "CREATE_VALIDATION_RULE":
      description = `${parameters.objectApiName ?? "不明"} オブジェクトに入力規則「${parameters.ruleName ?? "新規ルール"}」を作成します`;
      break;
    case "TOGGLE_VALIDATION_RULE":
      description = `${parameters.objectApiName ?? "不明"}.${parameters.ruleName ?? "不明"} を ${parameters.active ? "有効" : "無効"} にします`;
      break;
    case "DESCRIBE_OBJECT":
      description = `${parameters.objectApiName ?? "不明"} オブジェクトのメタデータ情報を取得します`;
      break;
    default:
      description = parameters.clarification ?? reasoning ?? "指示の内容を解析できませんでした";
      warnings.push(parameters.clarification ?? "もう少し具体的な指示をお願いします（例：項目追加、権限付与、入力規則の作成など）");
  }

  return {
    action,
    confidence,
    objectApiName:    parameters.objectApiName,
    fieldApiName:     parameters.fieldApiName,
    label:            parameters.label,
    fieldType:        parameters.fieldType,
    permissionSetName:parameters.permissionSetName,
    ruleName:         parameters.ruleName,
    errorMessage:     parameters.errorMessage,
    formula:          parameters.errorConditionFormula,
    description,
    warnings,
    // 追加フィールド（実行に使用）
    _raw: {
      action,
      confidence,
      reasoning,
      parameters,
    },
  } as ParsedIntentPreview & { _raw: RawIntentOutput };
}

// ── メインパーサー関数 ───────────────────────────────────────────────────────

export async function parseIntent(
  instruction: string,
  context?: string
): Promise<ParsedIntentPreview & { _raw: RawIntentOutput }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY が設定されていません");
  }

  const client = new Anthropic({ apiKey });

  const userMessage = context
    ? `【Org情報】\n${context}\n\n【ユーザー指示】\n${instruction}`
    : instruction;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    tools: [PARSE_TOOL],
    tool_choice: { type: "any" },
    messages: [{ role: "user", content: userMessage }],
  });

  const toolUse = response.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    // フォールバック: UNKNOWNとして返す
    return buildPreview({
      action: "UNKNOWN",
      confidence: 0,
      reasoning: "Tool use response not found",
      parameters: { clarification: "指示を解析できませんでした。より具体的に教えてください。" },
    });
  }

  return buildPreview(toolUse.input as RawIntentOutput);
}
