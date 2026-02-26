/**
 * IntentParser — 自然言語 → Salesforce操作 変換モジュール
 *
 * Claude API (claude-sonnet-4-6) を使用して、ユーザーの自然言語指示を
 * 構造化された Salesforce 操作パラメータに変換する。
 *
 * アーキテクチャ:
 *   1. システムプロンプトで Salesforce 専門家のロールを付与
 *   2. Tool Use (Function Calling) で型安全な出力を強制
 *   3. 信頼度スコアと根拠を必須フィールドに含める
 *
 * 対応する自然言語パターン例:
 *   「AccountオブジェクトにCustomer_Score__cという数値項目を追加して」
 *   「Sales_Rep権限セットでLeadオブジェクトの作成権限を付与」
 *   「商談のクローズ日が空のままクローズできないよう入力規則を追加」
 *   「Account.Industry の項目を参照させて、権限セットAdminに」
 */

import Anthropic from "@anthropic-ai/sdk";
import type {
  ActionType,
  CustomFieldDefinition,
  ParsedIntent,
  PermissionSetChange,
  ValidationRuleDefinition,
} from "../types/index.js";

// ── Intent Parser が返す構造化パラメータ ────────────────────────────────────

export type IntentParameters =
  | { action: "ADD_FIELD"; field: CustomFieldDefinition }
  | { action: "MODIFY_FIELD"; field: Partial<CustomFieldDefinition> & { objectApiName: string; fieldApiName: string } }
  | { action: "DELETE_FIELD"; objectApiName: string; fieldApiName: string }
  | { action: "ADD_PERMISSION" | "REVOKE_PERMISSION"; change: PermissionSetChange }
  | { action: "CREATE_VALIDATION_RULE"; rule: ValidationRuleDefinition }
  | { action: "TOGGLE_VALIDATION_RULE"; objectApiName: string; ruleName: string; active: boolean }
  | { action: "DESCRIBE_OBJECT"; objectApiName: string }
  | { action: "UNKNOWN"; clarification: string };

export class IntentParser {
  private client: Anthropic;
  private model: string;

  constructor(apiKey?: string, model = "claude-sonnet-4-6") {
    this.client = new Anthropic({ apiKey: apiKey ?? process.env.ANTHROPIC_API_KEY });
    this.model = model;
  }

  /**
   * 自然言語の指示を解析して構造化されたIntentを返す
   */
  async parse(instruction: string, context?: string): Promise<ParsedIntent> {
    const tools: Anthropic.Tool[] = [this.buildIntentTool()];

    const systemPrompt = this.buildSystemPrompt();
    const userMessage = context
      ? `【Org情報】\n${context}\n\n【ユーザー指示】\n${instruction}`
      : instruction;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      system: systemPrompt,
      tools,
      tool_choice: { type: "any" },
      messages: [{ role: "user", content: userMessage }],
    });

    // Tool Use レスポンスを抽出
    const toolUse = response.content.find((c) => c.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return {
        action: "UNKNOWN",
        confidence: 0,
        parameters: { clarification: "指示を解析できませんでした" },
        rawInstruction: instruction,
        reasoning: "Tool use response not found",
      };
    }

    const parsed = toolUse.input as {
      action: ActionType;
      confidence: number;
      reasoning: string;
      parameters: Record<string, unknown>;
    };

    return {
      action: parsed.action,
      confidence: parsed.confidence,
      parameters: parsed.parameters,
      rawInstruction: instruction,
      reasoning: parsed.reasoning,
    };
  }

  // ── Tool 定義 ─────────────────────────────────────────────────────────────

  private buildIntentTool(): Anthropic.Tool {
    return {
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
              "ADD_FIELD",
              "MODIFY_FIELD",
              "DELETE_FIELD",
              "ADD_PERMISSION",
              "REVOKE_PERMISSION",
              "CREATE_VALIDATION_RULE",
              "TOGGLE_VALIDATION_RULE",
              "DESCRIBE_OBJECT",
              "UNKNOWN",
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
              // ADD_FIELD / MODIFY_FIELD
              objectApiName: { type: "string", description: "例: Account, Opportunity__c" },
              fieldApiName: { type: "string", description: "例: Customer_Score__c" },
              label: { type: "string" },
              fieldType: {
                type: "string",
                enum: ["Text", "Number", "Date", "DateTime", "Checkbox", "Picklist", "Lookup", "LongTextArea", "Email", "Phone", "Url", "Currency", "Percent"],
              },
              required: { type: "boolean" },
              length: { type: "number" },
              precision: { type: "number" },
              scale: { type: "number" },
              picklistValues: { type: "array", items: { type: "string" } },
              referenceTo: { type: "string", description: "Lookup先オブジェクト" },
              description: { type: "string" },
              // ADD_PERMISSION / REVOKE_PERMISSION
              permissionSetName: { type: "string" },
              objectPermissions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    objectApiName: { type: "string" },
                    allowCreate: { type: "boolean" },
                    allowRead: { type: "boolean" },
                    allowEdit: { type: "boolean" },
                    allowDelete: { type: "boolean" },
                    viewAllRecords: { type: "boolean" },
                    modifyAllRecords: { type: "boolean" },
                  },
                },
              },
              fieldPermissions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    objectApiName: { type: "string" },
                    fieldApiName: { type: "string" },
                    readable: { type: "boolean" },
                    editable: { type: "boolean" },
                  },
                },
              },
              // CREATE_VALIDATION_RULE
              ruleName: { type: "string" },
              active: { type: "boolean" },
              errorConditionFormula: { type: "string", description: "Salesforce数式 (trueでエラー)" },
              errorMessage: { type: "string" },
              errorDisplayField: { type: "string" },
              // UNKNOWN
              clarification: { type: "string", description: "不明な場合のユーザーへの質問" },
            },
          },
        },
      },
    };
  }

  // ── システムプロンプト ────────────────────────────────────────────────────

  private buildSystemPrompt(): string {
    return `あなたはSalesforceの専門家AIアシスタントです。
ユーザーの自然言語による指示を解析し、Salesforce Metadata APIで実行可能な
構造化されたパラメータに変換してください。

## 解析ルール

### オブジェクト名
- 標準オブジェクトはそのまま (Account, Contact, Lead, Opportunity, Case)
- カスタムオブジェクトは __c サフィックスを付ける
- 日本語名が来た場合は標準的なSalesforce APINameに変換
  例: 「取引先」→ Account, 「商談」→ Opportunity, 「リード」→ Lead

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
- テキスト値: field = 'value'
- 複合条件: AND(), OR(), NOT()

### 信頼度スコア
- 1.0: パラメータが完全に特定できた
- 0.7〜0.9: ほぼ特定できたが一部推測を含む
- 0.5〜0.7: 複数の解釈が可能
- 0.5未満: UNKNOWNとして clarification を返す

### セキュリティ注意事項
- 権限の削除・オブジェクトの削除は必ず confidence を下げて確認を促す
- 本番環境への影響が大きい操作はreasoningに警告を含める`;
  }
}
