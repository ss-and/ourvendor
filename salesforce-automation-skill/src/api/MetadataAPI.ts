/**
 * MetadataAPI — Salesforce Metadata API クライアント
 *
 * 主要エンドポイント:
 *   POST /services/Soap/m/{version}           ← SOAP (標準)
 *   POST /services/data/{version}/metadata/   ← REST Metadata API (v38+)
 *
 * 本実装は REST Metadata API を使用 (SOAP より扱いやすく、JSONレスポンス)
 * ドキュメント: https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/
 *
 * 対応操作:
 *   - カスタム項目の作成・更新・削除
 *   - 権限セットの作成・更新
 *   - 入力規則の作成・更新
 *   - メタデータのデプロイ (非同期 + ポーリング)
 */

import axios, { AxiosInstance } from "axios";
import type { SalesforceAuth } from "../auth/SalesforceAuth.js";
import type {
  CustomFieldDefinition,
  DeployResult,
  PermissionSetChange,
  ValidationRuleDefinition,
} from "../types/index.js";

export class MetadataAPI {
  private auth: SalesforceAuth;
  private apiVersion: string;
  private client: AxiosInstance | null = null;

  constructor(auth: SalesforceAuth, apiVersion = "v59.0") {
    this.auth = auth;
    this.apiVersion = apiVersion;
  }

  // ── HTTP クライアント初期化 ───────────────────────────────────────────────

  private async getClient(): Promise<AxiosInstance> {
    const session = await this.auth.getSession();
    this.client = axios.create({
      baseURL: `${session.instanceUrl}/services/data/${this.apiVersion}`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return this.client;
  }

  // ── カスタム項目 CRUD ────────────────────────────────────────────────────

  /**
   * カスタム項目を作成する
   *
   * REST Metadata API: POST /services/data/v59.0/metadata/CustomField
   *
   * @example
   * await api.createCustomField({
   *   objectApiName: "Account",
   *   fieldApiName: "Customer_Score__c",
   *   label: "顧客スコア",
   *   type: "Number",
   *   precision: 5,
   *   scale: 2,
   * });
   */
  async createCustomField(field: CustomFieldDefinition): Promise<DeployResult> {
    const client = await this.getClient();

    const metadata = this.buildCustomFieldMetadata(field);

    try {
      const response = await client.post("/metadata/CustomField", metadata);
      return {
        success: true,
        id: response.data.id ?? "sync",
        status: "Succeeded",
        numberComponentsDeployed: 1,
        numberComponentErrors: 0,
        details: `項目 ${field.fieldApiName} を ${field.objectApiName} に作成しました`,
      };
    } catch (err: unknown) {
      return this.buildErrorResult(err);
    }
  }

  /**
   * カスタム項目のメタデータを更新する
   */
  async updateCustomField(field: Partial<CustomFieldDefinition> & { objectApiName: string; fieldApiName: string }): Promise<DeployResult> {
    const client = await this.getClient();
    const fullName = `${field.objectApiName}.${field.fieldApiName}`;

    try {
      const response = await client.patch(`/metadata/CustomField/${encodeURIComponent(fullName)}`, field);
      return {
        success: true,
        id: response.data.id ?? "sync",
        status: "Succeeded",
        numberComponentsDeployed: 1,
        numberComponentErrors: 0,
        details: `項目 ${field.fieldApiName} を更新しました`,
      };
    } catch (err: unknown) {
      return this.buildErrorResult(err);
    }
  }

  /**
   * カスタム項目を削除する (注意: データも削除される)
   */
  async deleteCustomField(objectApiName: string, fieldApiName: string): Promise<DeployResult> {
    const client = await this.getClient();
    const fullName = `${objectApiName}.${fieldApiName}`;

    try {
      await client.delete(`/metadata/CustomField/${encodeURIComponent(fullName)}`);
      return {
        success: true,
        id: "delete",
        status: "Succeeded",
        numberComponentsDeployed: 1,
        numberComponentErrors: 0,
        details: `項目 ${fieldApiName} を削除しました`,
      };
    } catch (err: unknown) {
      return this.buildErrorResult(err);
    }
  }

  // ── 権限セット ───────────────────────────────────────────────────────────

  /**
   * 権限セットを作成または更新する
   *
   * REST Metadata API: POST /services/data/v59.0/metadata/PermissionSet
   */
  async upsertPermissionSet(change: PermissionSetChange): Promise<DeployResult> {
    const client = await this.getClient();

    const metadata = {
      fullName: change.permissionSetName,
      label: change.permissionSetName,
      objectPermissions: change.objectPermissions?.map((op) => ({
        object: op.objectApiName,
        allowCreate: op.allowCreate,
        allowRead: op.allowRead,
        allowEdit: op.allowEdit,
        allowDelete: op.allowDelete,
        viewAllRecords: op.viewAllRecords,
        modifyAllRecords: op.modifyAllRecords,
      })),
      fieldPermissions: change.fieldPermissions?.map((fp) => ({
        field: `${fp.objectApiName}.${fp.fieldApiName}`,
        readable: fp.readable,
        editable: fp.editable,
      })),
      userPermissions: change.userPermissions?.map((up) => ({
        name: up.name,
        enabled: up.enabled,
      })),
    };

    try {
      const response = await client.post("/metadata/PermissionSet", metadata);
      return {
        success: true,
        id: response.data.id ?? "sync",
        status: "Succeeded",
        numberComponentsDeployed: 1,
        numberComponentErrors: 0,
        details: `権限セット ${change.permissionSetName} を更新しました`,
      };
    } catch (err: unknown) {
      return this.buildErrorResult(err);
    }
  }

  // ── 入力規則 ─────────────────────────────────────────────────────────────

  /**
   * 入力規則を作成する
   *
   * @example
   * await api.createValidationRule({
   *   objectApiName: "Opportunity",
   *   ruleName: "Require_CloseDate_for_Closed",
   *   active: true,
   *   errorConditionFormula: "ISPICKVAL(StageName, 'Closed Won') && ISBLANK(CloseDate)",
   *   errorMessage: "クローズ済み案件には完了予定日が必要です",
   * });
   */
  async createValidationRule(rule: ValidationRuleDefinition): Promise<DeployResult> {
    const client = await this.getClient();

    const metadata = {
      fullName: `${rule.objectApiName}.${rule.ruleName}`,
      active: rule.active,
      errorConditionFormula: rule.errorConditionFormula,
      errorMessage: rule.errorMessage,
      errorDisplayField: rule.errorDisplayField,
      description: rule.description,
    };

    try {
      const response = await client.post("/metadata/ValidationRule", metadata);
      return {
        success: true,
        id: response.data.id ?? "sync",
        status: "Succeeded",
        numberComponentsDeployed: 1,
        numberComponentErrors: 0,
        details: `入力規則 ${rule.ruleName} を作成しました`,
      };
    } catch (err: unknown) {
      return this.buildErrorResult(err);
    }
  }

  /**
   * 入力規則の有効/無効を切り替える
   */
  async toggleValidationRule(
    objectApiName: string,
    ruleName: string,
    active: boolean
  ): Promise<DeployResult> {
    const client = await this.getClient();
    const fullName = `${objectApiName}.${ruleName}`;

    try {
      await client.patch(`/metadata/ValidationRule/${encodeURIComponent(fullName)}`, { active });
      return {
        success: true,
        id: "toggle",
        status: "Succeeded",
        numberComponentsDeployed: 1,
        numberComponentErrors: 0,
        details: `入力規則 ${ruleName} を ${active ? "有効" : "無効"} にしました`,
      };
    } catch (err: unknown) {
      return this.buildErrorResult(err);
    }
  }

  // ── オブジェクト情報取得 ────────────────────────────────────────────────

  /**
   * オブジェクトのメタデータ概要を取得
   * REST API: GET /services/data/v59.0/sobjects/{objectName}/describe
   */
  async describeObject(objectApiName: string): Promise<Record<string, unknown>> {
    const client = await this.getClient();

    try {
      const response = await client.get(`/sobjects/${objectApiName}/describe`);
      return {
        name: response.data.name,
        label: response.data.label,
        fields: response.data.fields?.map((f: Record<string, unknown>) => ({
          name: f.name,
          label: f.label,
          type: f.type,
          required: !f.nillable,
          length: f.length,
        })),
        recordTypeInfos: response.data.recordTypeInfos,
      };
    } catch (err: unknown) {
      throw new Error(`オブジェクト ${objectApiName} の取得に失敗しました: ${this.getErrorMessage(err)}`);
    }
  }

  // ── プライベートヘルパー ───────────────────────────────────────────────

  private buildCustomFieldMetadata(field: CustomFieldDefinition): Record<string, unknown> {
    const base: Record<string, unknown> = {
      fullName: `${field.objectApiName}.${field.fieldApiName}`,
      label: field.label,
      type: field.type,
      required: field.required ?? false,
      unique: field.unique ?? false,
      description: field.description,
      inlineHelpText: field.inlineHelpText,
    };

    // 型別の追加プロパティ
    switch (field.type) {
      case "Text":
        base.length = field.length ?? 255;
        break;
      case "LongTextArea":
        base.length = field.length ?? 32768;
        base.visibleLines = 5;
        break;
      case "Number":
      case "Currency":
      case "Percent":
        base.precision = field.precision ?? 18;
        base.scale = field.scale ?? 0;
        break;
      case "Picklist":
        base.valueSet = {
          valueSetDefinition: {
            sorted: false,
            value: (field.picklistValues ?? []).map((v) => ({
              fullName: v,
              label: v,
              default: false,
            })),
          },
        };
        break;
      case "Lookup":
        base.referenceTo = field.referenceTo;
        base.relationshipLabel = `${field.label}s`;
        base.relationshipName = field.fieldApiName.replace("__c", "");
        break;
    }

    return base;
  }

  private buildErrorResult(err: unknown): DeployResult {
    const message = this.getErrorMessage(err);
    return {
      success: false,
      id: "",
      status: "Failed",
      numberComponentsDeployed: 0,
      numberComponentErrors: 1,
      componentFailures: [
        {
          componentType: "Metadata",
          fileName: "",
          problemType: "Error",
          problem: message,
        },
      ],
    };
  }

  private getErrorMessage(err: unknown): string {
    if (axios.isAxiosError(err)) {
      const data = err.response?.data;
      if (Array.isArray(data) && data[0]?.message) return data[0].message;
      if (data?.message) return data.message;
      return err.message;
    }
    return err instanceof Error ? err.message : String(err);
  }
}
