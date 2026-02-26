// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Dashboard UI — 型定義
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ActionType =
  | "ADD_FIELD"
  | "MODIFY_FIELD"
  | "DELETE_FIELD"
  | "ADD_PERMISSION"
  | "REVOKE_PERMISSION"
  | "CREATE_VALIDATION_RULE"
  | "TOGGLE_VALIDATION_RULE"
  | "DESCRIBE_OBJECT"
  | "UNKNOWN";

export type ActionStatus = "success" | "failed" | "pending" | "dry_run";

export interface ExecutionRecord {
  id: string;
  action: ActionType;
  status: ActionStatus;
  instruction: string;
  target: string;         // 例: "Account.Customer_Score__c"
  user: string;
  executedAt: Date;
  details?: string;
}

export interface OrgStat {
  label: string;
  value: number;
  delta?: number;         // 前週比
  unit?: string;
}

export interface OrgHealth {
  label: string;
  percent: number;        // 0-100
  status: "good" | "warn" | "danger";
  description: string;
}

// ── Chat 関連 ────────────────────────────────────────────

export type MessageRole = "user" | "assistant";
export type MessageType = "text" | "intent_preview" | "result" | "error";

export interface ParsedIntentPreview {
  action: ActionType;
  confidence: number;
  objectApiName?: string;
  fieldApiName?: string;
  label?: string;
  fieldType?: string;
  permissionSetName?: string;
  ruleName?: string;
  errorMessage?: string;
  formula?: string;
  description: string;  // 人間向け説明
  warnings: string[];
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  type: MessageType;
  text?: string;
  intentPreview?: ParsedIntentPreview;
  status?: ActionStatus;
  timestamp: Date;
}

// ── Preset ───────────────────────────────────────────────

export type PresetCategory =
  | "field"       // 項目操作
  | "permission"  // 権限管理
  | "validation"  // 入力規則
  | "describe"    // オブジェクト参照
  | "other";      // その他

export interface Preset {
  id: string;
  title: string;
  prompt: string;         // チャットに送るテキスト
  category: PresetCategory;
  tags: string[];
  usedCount: number;
  createdAt: Date;
}

// ── UI State ─────────────────────────────────────────────

export interface ConfirmModalState {
  open: boolean;
  preview: ParsedIntentPreview | null;
  messageId: string;
}

// ── 業界パック ────────────────────────────────────────────

export type PackItemType = "object" | "field" | "validation" | "permission";

export interface IndustryPackItem {
  type: PackItemType;
  name: string;
  target: string;       // 例: "Property__c", "Account.MRR__c"
  description: string;
}

export interface IndustryPack {
  id: string;
  name: string;
  tagline: string;
  accentBg: string;     // Tailwind bg class
  accentText: string;   // Tailwind text class
  stats: {
    objects: number;
    fields: number;
    validations: number;
    permissions: number;
  };
  items: IndustryPackItem[];
}
