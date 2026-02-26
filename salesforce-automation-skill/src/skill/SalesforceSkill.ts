/**
 * SalesforceSkill — メインオーケストレーター
 *
 * 処理フロー:
 *   自然言語指示
 *     ↓ IntentParser (Claude API)
 *   構造化 Intent + 信頼度スコア
 *     ↓ (信頼度 < 0.7 なら確認プロンプト)
 *   アクションハンドラー (FieldManager / PermissionManager / ValidationRuleManager)
 *     ↓ MetadataAPI / ToolingAPI
 *   Salesforce Org
 *     ↓
 *   実行結果 + 監査ログ
 */

import "dotenv/config";
import { createAuthFromEnv, SalesforceAuth } from "../auth/SalesforceAuth.js";
import { MetadataAPI } from "../api/MetadataAPI.js";
import { ToolingAPI } from "../api/ToolingAPI.js";
import { IntentParser } from "../nlp/IntentParser.js";
import { FieldManager } from "../actions/FieldManager.js";
import { PermissionManager } from "../actions/PermissionManager.js";
import { ValidationRuleManager } from "../actions/ValidationRuleManager.js";
import type { SkillExecutionResult, ParsedIntent } from "../types/index.js";

export interface SalesforceSkillOptions {
  auth?: SalesforceAuth;
  apiVersion?: string;
  dryRun?: boolean;
  confidenceThreshold?: number;  // この値未満は実行前に確認 (デフォルト 0.7)
  onConfirmRequired?: (intent: ParsedIntent) => Promise<boolean>;
}

export interface ExecutionLog {
  instruction: string;
  intent: ParsedIntent;
  result: SkillExecutionResult;
  timestamp: Date;
}

export class SalesforceSkill {
  private auth: SalesforceAuth;
  private metaApi: MetadataAPI;
  private toolingApi: ToolingAPI;
  private intentParser: IntentParser;
  private fieldManager: FieldManager;
  private permissionManager: PermissionManager;
  private validationRuleManager: ValidationRuleManager;
  private dryRun: boolean;
  private confidenceThreshold: number;
  private onConfirmRequired: (intent: ParsedIntent) => Promise<boolean>;
  private executionLogs: ExecutionLog[] = [];

  constructor(options: SalesforceSkillOptions = {}) {
    this.auth = options.auth ?? createAuthFromEnv();
    const apiVersion = options.apiVersion ?? process.env.SF_API_VERSION ?? "v59.0";
    this.dryRun = options.dryRun ?? process.env.DRY_RUN === "true";
    this.confidenceThreshold = options.confidenceThreshold ?? 0.7;
    this.onConfirmRequired = options.onConfirmRequired ?? this.defaultConfirmHandler;

    this.metaApi = new MetadataAPI(this.auth, apiVersion);
    this.toolingApi = new ToolingAPI(this.auth, apiVersion);
    this.intentParser = new IntentParser();
    this.fieldManager = new FieldManager(this.metaApi, this.dryRun);
    this.permissionManager = new PermissionManager(this.metaApi, this.dryRun);
    this.validationRuleManager = new ValidationRuleManager(this.metaApi, this.dryRun);
  }

  // ── メインエントリーポイント ──────────────────────────────────────────────

  /**
   * 自然言語の指示を受け取り、Salesforceの設定変更を実行する
   *
   * @param instruction - ユーザーの自然言語指示
   * @param context - 追加コンテキスト (現在のOrg設定など)
   * @returns 実行結果
   *
   * @example
   * const skill = new SalesforceSkill({ dryRun: true });
   * const result = await skill.execute(
   *   "AccountオブジェクトにCustomer_Score__cという数値項目を追加して"
   * );
   * console.log(result.message);
   */
  async execute(instruction: string, context?: string): Promise<SkillExecutionResult> {
    this.log("info", `実行開始: "${instruction}"`);

    // Step 1: 自然言語を解析
    let intent: ParsedIntent;
    try {
      intent = await this.intentParser.parse(instruction, context);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return this.buildErrorResult(instruction, `Intent解析エラー: ${message}`);
    }

    this.log("info", `Intent: ${intent.action} (信頼度: ${intent.confidence.toFixed(2)})`);
    this.log("debug", `根拠: ${intent.reasoning}`);

    // Step 2: 信頼度チェック — 低い場合は確認を要求
    if (intent.confidence < this.confidenceThreshold) {
      const confirmed = await this.onConfirmRequired(intent);
      if (!confirmed) {
        const result: SkillExecutionResult = {
          success: false,
          action: intent.action,
          message: `実行をキャンセルしました。信頼度: ${intent.confidence.toFixed(2)}\n根拠: ${intent.reasoning}`,
          dryRun: this.dryRun,
          executedAt: new Date(),
        };
        this.recordLog(instruction, intent, result);
        return result;
      }
    }

    // Step 3: アクションを実行
    const result = await this.dispatch(intent);

    // Step 4: 監査ログに記録
    this.recordLog(instruction, intent, result);

    this.log("info", `実行完了: ${result.success ? "成功" : "失敗"} — ${result.message}`);
    return result;
  }

  // ── アクションディスパッチャー ───────────────────────────────────────────

  private async dispatch(intent: ParsedIntent): Promise<SkillExecutionResult> {
    const { action, parameters } = intent;

    switch (action) {
      case "ADD_FIELD":
        return this.fieldManager.addField(parameters);

      case "MODIFY_FIELD":
        return this.fieldManager.modifyField(parameters);

      case "DELETE_FIELD":
        return this.fieldManager.deleteField(parameters);

      case "ADD_PERMISSION":
        return this.permissionManager.addPermission(parameters);

      case "REVOKE_PERMISSION":
        return this.permissionManager.revokePermission(parameters);

      case "CREATE_VALIDATION_RULE":
        return this.validationRuleManager.createRule(parameters);

      case "TOGGLE_VALIDATION_RULE":
        return this.validationRuleManager.toggleRule(parameters);

      case "DESCRIBE_OBJECT": {
        const objectName = parameters.objectApiName as string;
        try {
          const description = await this.metaApi.describeObject(objectName);
          return {
            success: true,
            action: "DESCRIBE_OBJECT",
            message: `${objectName} の情報を取得しました`,
            details: description,
            dryRun: this.dryRun,
            executedAt: new Date(),
          };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          return {
            success: false,
            action: "DESCRIBE_OBJECT",
            message,
            dryRun: this.dryRun,
            executedAt: new Date(),
          };
        }
      }

      case "UNKNOWN":
      default:
        return {
          success: false,
          action: "UNKNOWN",
          message: `指示を解釈できませんでした。\n${parameters.clarification ?? intent.reasoning}`,
          dryRun: this.dryRun,
          executedAt: new Date(),
        };
    }
  }

  // ── 便利メソッド ─────────────────────────────────────────────────────────

  /**
   * 認証テスト — Salesforce Org への接続確認
   */
  async testConnection(): Promise<{ success: boolean; orgId: string; instanceUrl: string }> {
    try {
      const session = await this.auth.getSession();
      return { success: true, orgId: session.orgId, instanceUrl: session.instanceUrl };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`接続テスト失敗: ${message}`);
    }
  }

  /**
   * 最近の実行ログを返す
   */
  getExecutionLogs(): ExecutionLog[] {
    return [...this.executionLogs];
  }

  /**
   * Tooling API への直接アクセス (高度な操作用)
   */
  getToolingAPI(): ToolingAPI {
    return this.toolingApi;
  }

  // ── プライベートヘルパー ───────────────────────────────────────────────

  private buildErrorResult(instruction: string, message: string): SkillExecutionResult {
    return {
      success: false,
      action: "UNKNOWN",
      message,
      dryRun: this.dryRun,
      executedAt: new Date(),
    };
  }

  private recordLog(instruction: string, intent: ParsedIntent, result: SkillExecutionResult): void {
    this.executionLogs.push({ instruction, intent, result, timestamp: new Date() });
    // 最新100件のみ保持
    if (this.executionLogs.length > 100) {
      this.executionLogs.shift();
    }
  }

  private defaultConfirmHandler = async (intent: ParsedIntent): Promise<boolean> => {
    // デフォルトは CLI での確認 (非インタラクティブ環境では false を返す)
    this.log(
      "warn",
      `⚠️  信頼度が低い操作です (${intent.confidence.toFixed(2)})\n` +
        `操作: ${intent.action}\n` +
        `根拠: ${intent.reasoning}\n` +
        `DRY_RUN=true を設定するか、onConfirmRequired を実装してください。`
    );
    return false; // 安全のためデフォルトは拒否
  };

  private log(level: string, message: string): void {
    const logLevel = process.env.LOG_LEVEL ?? "info";
    const levels = ["debug", "info", "warn", "error"];
    if (levels.indexOf(level) >= levels.indexOf(logLevel)) {
      const prefix = `[SalesforceSkill][${level.toUpperCase()}]`;
      console.log(`${prefix} ${message}`);
    }
  }
}
