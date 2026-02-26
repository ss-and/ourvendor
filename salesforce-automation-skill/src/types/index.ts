// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Salesforce Automation Skill — 共通型定義
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── 認証 ─────────────────────────────────────────────────────────────────────

export interface SalesforceAuthConfig {
  loginUrl: string;
  apiVersion: string;
  // JWT Bearer Flow
  jwtClientId?: string;
  jwtUsername?: string;
  jwtPrivateKeyPath?: string;
  // Username/Password Flow (fallback)
  username?: string;
  password?: string;
  securityToken?: string;
}

export interface SalesforceSession {
  accessToken: string;
  instanceUrl: string;
  orgId: string;
  expiresAt: Date;
}

// ── Salesforce Metadata API 型 ────────────────────────────────────────────────

export type FieldType =
  | "Text"
  | "Number"
  | "Date"
  | "DateTime"
  | "Checkbox"
  | "Picklist"
  | "Lookup"
  | "LongTextArea"
  | "Email"
  | "Phone"
  | "Url"
  | "Currency"
  | "Percent";

export interface CustomFieldDefinition {
  objectApiName: string;         // 例: "Account", "Opportunity__c"
  fieldApiName: string;          // 例: "Customer_Score__c"
  label: string;
  type: FieldType;
  required?: boolean;
  unique?: boolean;
  length?: number;               // Text/LongTextArea
  precision?: number;            // Number/Currency
  scale?: number;                // Number/Currency
  picklistValues?: string[];     // Picklist
  referenceTo?: string;          // Lookup
  description?: string;
  inlineHelpText?: string;
}

export interface PermissionSetChange {
  permissionSetName: string;
  objectPermissions?: ObjectPermission[];
  fieldPermissions?: FieldPermission[];
  userPermissions?: UserPermission[];
}

export interface ObjectPermission {
  objectApiName: string;
  allowCreate: boolean;
  allowRead: boolean;
  allowEdit: boolean;
  allowDelete: boolean;
  viewAllRecords: boolean;
  modifyAllRecords: boolean;
}

export interface FieldPermission {
  objectApiName: string;
  fieldApiName: string;
  readable: boolean;
  editable: boolean;
}

export interface UserPermission {
  name: string;  // 例: "ManageUsers", "ApiEnabled"
  enabled: boolean;
}

export interface ValidationRuleDefinition {
  objectApiName: string;
  ruleName: string;              // 例: "Require_Close_Date_for_Closed"
  active: boolean;
  errorConditionFormula: string; // Apex数式
  errorMessage: string;
  errorDisplayField?: string;    // エラーを表示するフィールドAPI名
  description?: string;
}

// ── Metadata Deploy 結果 ─────────────────────────────────────────────────────

export interface DeployResult {
  success: boolean;
  id: string;
  status: "Pending" | "InProgress" | "Succeeded" | "Failed" | "Canceled";
  numberComponentsDeployed: number;
  numberComponentErrors: number;
  componentFailures?: ComponentFailure[];
  details?: string;
}

export interface ComponentFailure {
  componentType: string;
  fileName: string;
  problemType: "Error" | "Warning";
  problem: string;
  lineNumber?: number;
  columnNumber?: number;
}

// ── NLP / Intent 解析 ────────────────────────────────────────────────────────

export type ActionType =
  | "ADD_FIELD"
  | "MODIFY_FIELD"
  | "DELETE_FIELD"
  | "ADD_PERMISSION"
  | "REVOKE_PERMISSION"
  | "CREATE_VALIDATION_RULE"
  | "TOGGLE_VALIDATION_RULE"
  | "CREATE_FLOW"
  | "DESCRIBE_OBJECT"
  | "UNKNOWN";

export interface ParsedIntent {
  action: ActionType;
  confidence: number;            // 0.0 〜 1.0
  parameters: Record<string, unknown>;
  rawInstruction: string;
  reasoning: string;             // AIの判断根拠
}

// ── スキル実行結果 ────────────────────────────────────────────────────────────

export interface SkillExecutionResult {
  success: boolean;
  action: ActionType;
  message: string;
  details?: Record<string, unknown>;
  dryRun: boolean;
  executedAt: Date;
}

// ── ログレベル ────────────────────────────────────────────────────────────────

export type LogLevel = "debug" | "info" | "warn" | "error";
