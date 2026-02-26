/**
 * ValidationRuleManager — 入力規則管理アクションハンドラー
 */

import type { MetadataAPI } from "../api/MetadataAPI.js";
import type { ValidationRuleDefinition, SkillExecutionResult } from "../types/index.js";

export class ValidationRuleManager {
  constructor(private api: MetadataAPI, private dryRun = false) {}

  async createRule(params: Record<string, unknown>): Promise<SkillExecutionResult> {
    const rule: ValidationRuleDefinition = {
      objectApiName: params.objectApiName as string,
      ruleName: params.ruleName as string,
      active: (params.active as boolean | undefined) ?? true,
      errorConditionFormula: params.errorConditionFormula as string,
      errorMessage: params.errorMessage as string,
      errorDisplayField: params.errorDisplayField as string | undefined,
      description: params.description as string | undefined,
    };

    const validation = this.validateRule(rule);
    if (!validation.valid) {
      return {
        success: false,
        action: "CREATE_VALIDATION_RULE",
        message: `パラメータエラー: ${validation.errors.join(", ")}`,
        dryRun: this.dryRun,
        executedAt: new Date(),
      };
    }

    if (this.dryRun) {
      return {
        success: true,
        action: "CREATE_VALIDATION_RULE",
        message: `[DRY RUN] 入力規則 ${rule.ruleName} を ${rule.objectApiName} に作成します`,
        details: { rule },
        dryRun: true,
        executedAt: new Date(),
      };
    }

    const result = await this.api.createValidationRule(rule);

    return {
      success: result.success,
      action: "CREATE_VALIDATION_RULE",
      message: result.success
        ? `入力規則 ${rule.ruleName} を作成しました`
        : `入力規則作成失敗: ${result.componentFailures?.[0]?.problem ?? "不明なエラー"}`,
      details: { rule, deployResult: result },
      dryRun: false,
      executedAt: new Date(),
    };
  }

  async toggleRule(params: Record<string, unknown>): Promise<SkillExecutionResult> {
    const objectApiName = params.objectApiName as string;
    const ruleName = params.ruleName as string;
    const active = params.active as boolean;

    if (!objectApiName || !ruleName || active === undefined) {
      return {
        success: false,
        action: "TOGGLE_VALIDATION_RULE",
        message: "objectApiName, ruleName, active が必要です",
        dryRun: this.dryRun,
        executedAt: new Date(),
      };
    }

    if (this.dryRun) {
      return {
        success: true,
        action: "TOGGLE_VALIDATION_RULE",
        message: `[DRY RUN] ${objectApiName}.${ruleName} を ${active ? "有効" : "無効"} にします`,
        dryRun: true,
        executedAt: new Date(),
      };
    }

    const result = await this.api.toggleValidationRule(objectApiName, ruleName, active);

    return {
      success: result.success,
      action: "TOGGLE_VALIDATION_RULE",
      message: result.success
        ? `入力規則 ${ruleName} を ${active ? "有効" : "無効"} にしました`
        : `切り替え失敗: ${result.componentFailures?.[0]?.problem ?? "不明なエラー"}`,
      details: { deployResult: result },
      dryRun: false,
      executedAt: new Date(),
    };
  }

  private validateRule(rule: ValidationRuleDefinition): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!rule.objectApiName) errors.push("objectApiName が必要です");
    if (!rule.ruleName) errors.push("ruleName が必要です");
    if (!rule.errorConditionFormula) errors.push("errorConditionFormula が必要です");
    if (!rule.errorMessage) errors.push("errorMessage が必要です");
    return { valid: errors.length === 0, errors };
  }
}
