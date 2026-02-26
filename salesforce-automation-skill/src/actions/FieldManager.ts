/**
 * FieldManager — カスタム項目管理アクションハンドラー
 *
 * IntentParser から受け取ったパラメータを検証し、
 * MetadataAPI を通じて Salesforce に反映する。
 */

import type { MetadataAPI } from "../api/MetadataAPI.js";
import type { CustomFieldDefinition, DeployResult, SkillExecutionResult } from "../types/index.js";

export class FieldManager {
  constructor(private api: MetadataAPI, private dryRun = false) {}

  /**
   * カスタム項目を作成する
   */
  async addField(params: Record<string, unknown>): Promise<SkillExecutionResult> {
    const field = this.buildFieldDefinition(params);
    const validation = this.validateField(field);

    if (!validation.valid) {
      return {
        success: false,
        action: "ADD_FIELD",
        message: `パラメータエラー: ${validation.errors.join(", ")}`,
        dryRun: this.dryRun,
        executedAt: new Date(),
      };
    }

    if (this.dryRun) {
      return {
        success: true,
        action: "ADD_FIELD",
        message: `[DRY RUN] 項目 ${field.fieldApiName} を ${field.objectApiName} に追加します`,
        details: { field },
        dryRun: true,
        executedAt: new Date(),
      };
    }

    const result: DeployResult = await this.api.createCustomField(field);

    return {
      success: result.success,
      action: "ADD_FIELD",
      message: result.success
        ? `項目 ${field.label} (${field.fieldApiName}) を ${field.objectApiName} に作成しました`
        : `項目作成に失敗: ${result.componentFailures?.[0]?.problem ?? "不明なエラー"}`,
      details: { field, deployResult: result },
      dryRun: false,
      executedAt: new Date(),
    };
  }

  /**
   * カスタム項目を更新する
   */
  async modifyField(params: Record<string, unknown>): Promise<SkillExecutionResult> {
    const objectApiName = params.objectApiName as string;
    const fieldApiName = params.fieldApiName as string;

    if (!objectApiName || !fieldApiName) {
      return {
        success: false,
        action: "MODIFY_FIELD",
        message: "objectApiName と fieldApiName が必要です",
        dryRun: this.dryRun,
        executedAt: new Date(),
      };
    }

    if (this.dryRun) {
      return {
        success: true,
        action: "MODIFY_FIELD",
        message: `[DRY RUN] ${objectApiName}.${fieldApiName} を更新します`,
        details: { params },
        dryRun: true,
        executedAt: new Date(),
      };
    }

    const result = await this.api.updateCustomField({
      objectApiName,
      fieldApiName,
      label: params.label as string | undefined,
      required: params.required as boolean | undefined,
      description: params.description as string | undefined,
      inlineHelpText: params.inlineHelpText as string | undefined,
    });

    return {
      success: result.success,
      action: "MODIFY_FIELD",
      message: result.success
        ? `項目 ${fieldApiName} を更新しました`
        : `更新失敗: ${result.componentFailures?.[0]?.problem ?? "不明なエラー"}`,
      details: { deployResult: result },
      dryRun: false,
      executedAt: new Date(),
    };
  }

  /**
   * カスタム項目を削除する (破壊的操作 — dryRun を強く推奨)
   */
  async deleteField(params: Record<string, unknown>): Promise<SkillExecutionResult> {
    const objectApiName = params.objectApiName as string;
    const fieldApiName = params.fieldApiName as string;

    if (!objectApiName || !fieldApiName) {
      return {
        success: false,
        action: "DELETE_FIELD",
        message: "objectApiName と fieldApiName が必要です",
        dryRun: this.dryRun,
        executedAt: new Date(),
      };
    }

    if (this.dryRun) {
      return {
        success: true,
        action: "DELETE_FIELD",
        message: `[DRY RUN] ⚠️ 項目 ${objectApiName}.${fieldApiName} と全データを削除します`,
        dryRun: true,
        executedAt: new Date(),
      };
    }

    const result = await this.api.deleteCustomField(objectApiName, fieldApiName);

    return {
      success: result.success,
      action: "DELETE_FIELD",
      message: result.success
        ? `項目 ${fieldApiName} を削除しました`
        : `削除失敗: ${result.componentFailures?.[0]?.problem ?? "不明なエラー"}`,
      details: { deployResult: result },
      dryRun: false,
      executedAt: new Date(),
    };
  }

  // ── プライベートヘルパー ───────────────────────────────────────────────

  private buildFieldDefinition(params: Record<string, unknown>): CustomFieldDefinition {
    return {
      objectApiName: params.objectApiName as string,
      fieldApiName: params.fieldApiName as string,
      label: params.label as string,
      type: params.fieldType as CustomFieldDefinition["type"],
      required: params.required as boolean | undefined,
      unique: params.unique as boolean | undefined,
      length: params.length as number | undefined,
      precision: params.precision as number | undefined,
      scale: params.scale as number | undefined,
      picklistValues: params.picklistValues as string[] | undefined,
      referenceTo: params.referenceTo as string | undefined,
      description: params.description as string | undefined,
      inlineHelpText: params.inlineHelpText as string | undefined,
    };
  }

  private validateField(field: CustomFieldDefinition): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!field.objectApiName) errors.push("objectApiName が必要です");
    if (!field.fieldApiName) errors.push("fieldApiName が必要です");
    if (!field.label) errors.push("label が必要です");
    if (!field.type) errors.push("type が必要です");

    // __c サフィックスチェック (カスタム項目の場合)
    if (field.fieldApiName && !field.fieldApiName.endsWith("__c")) {
      errors.push(`fieldApiName は __c で終わる必要があります (例: ${field.fieldApiName}__c)`);
    }

    // Picklist値チェック
    if (field.type === "Picklist" && (!field.picklistValues || field.picklistValues.length === 0)) {
      errors.push("Picklist型には picklistValues が必要です");
    }

    // Lookup先チェック
    if (field.type === "Lookup" && !field.referenceTo) {
      errors.push("Lookup型には referenceTo が必要です");
    }

    return { valid: errors.length === 0, errors };
  }
}
