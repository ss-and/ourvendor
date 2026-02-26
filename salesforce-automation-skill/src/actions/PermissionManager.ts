/**
 * PermissionManager — 権限セット管理アクションハンドラー
 */

import type { MetadataAPI } from "../api/MetadataAPI.js";
import type { PermissionSetChange, SkillExecutionResult } from "../types/index.js";

export class PermissionManager {
  constructor(private api: MetadataAPI, private dryRun = false) {}

  async addPermission(params: Record<string, unknown>): Promise<SkillExecutionResult> {
    return this.upsertPermission(params, "ADD_PERMISSION");
  }

  async revokePermission(params: Record<string, unknown>): Promise<SkillExecutionResult> {
    // 権限剥奪: 全フラグを false にして upsert
    const revokedParams = this.invertPermissions(params);
    return this.upsertPermission(revokedParams, "REVOKE_PERMISSION");
  }

  private async upsertPermission(
    params: Record<string, unknown>,
    action: "ADD_PERMISSION" | "REVOKE_PERMISSION"
  ): Promise<SkillExecutionResult> {
    const permissionSetName = params.permissionSetName as string;

    if (!permissionSetName) {
      return {
        success: false,
        action,
        message: "permissionSetName が必要です",
        dryRun: this.dryRun,
        executedAt: new Date(),
      };
    }

    const change: PermissionSetChange = {
      permissionSetName,
      objectPermissions: params.objectPermissions as PermissionSetChange["objectPermissions"],
      fieldPermissions: params.fieldPermissions as PermissionSetChange["fieldPermissions"],
      userPermissions: params.userPermissions as PermissionSetChange["userPermissions"],
    };

    if (this.dryRun) {
      return {
        success: true,
        action,
        message: `[DRY RUN] 権限セット ${permissionSetName} を更新します`,
        details: { change },
        dryRun: true,
        executedAt: new Date(),
      };
    }

    const result = await this.api.upsertPermissionSet(change);

    return {
      success: result.success,
      action,
      message: result.success
        ? `権限セット ${permissionSetName} を更新しました`
        : `権限更新失敗: ${result.componentFailures?.[0]?.problem ?? "不明なエラー"}`,
      details: { change, deployResult: result },
      dryRun: false,
      executedAt: new Date(),
    };
  }

  private invertPermissions(params: Record<string, unknown>): Record<string, unknown> {
    const cloned = JSON.parse(JSON.stringify(params)) as Record<string, unknown>;

    const objectPerms = cloned.objectPermissions as Array<Record<string, unknown>> | undefined;
    objectPerms?.forEach((op) => {
      op.allowCreate = false;
      op.allowRead = false;
      op.allowEdit = false;
      op.allowDelete = false;
      op.viewAllRecords = false;
      op.modifyAllRecords = false;
    });

    const fieldPerms = cloned.fieldPermissions as Array<Record<string, unknown>> | undefined;
    fieldPerms?.forEach((fp) => {
      fp.readable = false;
      fp.editable = false;
    });

    const userPerms = cloned.userPermissions as Array<Record<string, unknown>> | undefined;
    userPerms?.forEach((up) => {
      up.enabled = false;
    });

    return cloned;
  }
}
