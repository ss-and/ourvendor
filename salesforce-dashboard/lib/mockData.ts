import type { ExecutionRecord, OrgStat, OrgHealth, ParsedIntentPreview, Preset } from "./types";

// ── Org 統計情報 ──────────────────────────────────────────
export const orgStats: OrgStat[] = [
  { label: "カスタム項目",     value: 248, delta: +12, unit: "個" },
  { label: "権限セット",       value:  34, delta:  +2, unit: "件" },
  { label: "入力規則",         value:  67, delta:  +5, unit: "件" },
  { label: "自動化実行 (今月)", value: 183, delta: +38, unit: "回" },
];

// ── Org ヘルス ────────────────────────────────────────────
export const orgHealthMetrics: OrgHealth[] = [
  { label: "API利用率",       percent: 23, status: "good",   description: "月間API上限の23%を使用中" },
  { label: "データ容量",      percent: 61, status: "warn",   description: "10GB中6.1GBを使用中" },
  { label: "ライセンス充足率", percent: 87, status: "good",   description: "保有ライセンスの87%を活用" },
  { label: "自動化カバレッジ", percent: 54, status: "warn",   description: "オブジェクトの54%に自動化設定済" },
];

// ── 実行履歴 ──────────────────────────────────────────────
export const executionHistory: ExecutionRecord[] = [
  {
    id: "exec-001",
    action: "ADD_FIELD",
    status: "success",
    instruction: "AccountにCustomer_Score__c数値項目を追加",
    target: "Account.Customer_Score__c",
    user: "田中 太郎",
    executedAt: new Date(Date.now() - 1000 * 60 * 12),
    details: "精度:5, 小数:0, 必須:false",
  },
  {
    id: "exec-002",
    action: "ADD_PERMISSION",
    status: "success",
    instruction: "Sales_Rep権限セットでLeadの作成・参照権限を付与",
    target: "Sales_Rep → Lead",
    user: "田中 太郎",
    executedAt: new Date(Date.now() - 1000 * 60 * 35),
    details: "allowCreate: true, allowRead: true",
  },
  {
    id: "exec-003",
    action: "CREATE_VALIDATION_RULE",
    status: "success",
    instruction: "商談のクローズ日が空ならエラーにする入力規則を作成",
    target: "Opportunity.Require_CloseDate",
    user: "佐藤 花子",
    executedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    details: "条件: ISBLANK(CloseDate) && ISPICKVAL(StageName,'Closed Won')",
  },
  {
    id: "exec-004",
    action: "TOGGLE_VALIDATION_RULE",
    status: "success",
    instruction: "Phone_Required入力規則を無効にして",
    target: "Contact.Phone_Required",
    user: "鈴木 一郎",
    executedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    details: "active: false",
  },
  {
    id: "exec-005",
    action: "MODIFY_FIELD",
    status: "failed",
    instruction: "AccountのBillingCountryを必須項目にする",
    target: "Account.BillingCountry",
    user: "田中 太郎",
    executedAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    details: "エラー: 標準項目の必須設定は管理者権限が必要です",
  },
  {
    id: "exec-006",
    action: "ADD_FIELD",
    status: "dry_run",
    instruction: "OpportunityにContract_Start_Date__c日付項目を追加",
    target: "Opportunity.Contract_Start_Date__c",
    user: "佐藤 花子",
    executedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    details: "DRY RUN: 実際の変更は行われていません",
  },
];

// ── プリセット ────────────────────────────────────────────
export const presets: Preset[] = [
  {
    id: "preset-001",
    title: "数値カスタム項目を追加",
    prompt: "AccountにCustomer_Score__c数値項目（精度5・小数0・必須なし）を追加して",
    category: "field",
    tags: ["Account", "Number"],
    usedCount: 42,
    createdAt: new Date("2024-10-01"),
  },
  {
    id: "preset-002",
    title: "日付項目を追加",
    prompt: "OpportunityにContract_Start_Date__c日付項目を追加して",
    category: "field",
    tags: ["Opportunity", "Date"],
    usedCount: 28,
    createdAt: new Date("2024-10-15"),
  },
  {
    id: "preset-003",
    title: "テキスト項目を追加",
    prompt: "ContactにNickname__cテキスト項目（文字数255）を追加して",
    category: "field",
    tags: ["Contact", "Text"],
    usedCount: 17,
    createdAt: new Date("2024-11-02"),
  },
  {
    id: "preset-004",
    title: "Sales_Rep 権限セットに Lead 権限を付与",
    prompt: "Sales_Rep権限セットでLeadの作成・参照・更新権限を付与して",
    category: "permission",
    tags: ["Sales_Rep", "Lead"],
    usedCount: 35,
    createdAt: new Date("2024-09-20"),
  },
  {
    id: "preset-005",
    title: "Manager 権限セットに Account 編集権限を付与",
    prompt: "Manager権限セットでAccountの参照・作成・更新権限を付与して",
    category: "permission",
    tags: ["Manager", "Account"],
    usedCount: 19,
    createdAt: new Date("2024-10-10"),
  },
  {
    id: "preset-006",
    title: "商談クローズ日の必須入力規則を作成",
    prompt: "商談のクローズ日が空のままステージを「Closed Won」にできない入力規則を作成して",
    category: "validation",
    tags: ["Opportunity", "CloseDate"],
    usedCount: 23,
    createdAt: new Date("2024-10-25"),
  },
  {
    id: "preset-007",
    title: "電話番号の必須入力規則を作成",
    prompt: "ContactのPhoneが空白のままレコードを保存できない入力規則を作成して",
    category: "validation",
    tags: ["Contact", "Phone"],
    usedCount: 11,
    createdAt: new Date("2024-11-05"),
  },
  {
    id: "preset-008",
    title: "Account フィールド一覧を確認",
    prompt: "Accountオブジェクトのカスタム項目一覧を見せて",
    category: "describe",
    tags: ["Account"],
    usedCount: 58,
    createdAt: new Date("2024-09-15"),
  },
  {
    id: "preset-009",
    title: "Opportunity フィールド一覧を確認",
    prompt: "Opportunityオブジェクトの項目一覧を見せて",
    category: "describe",
    tags: ["Opportunity"],
    usedCount: 44,
    createdAt: new Date("2024-09-18"),
  },
];

// ── チャット例文 ──────────────────────────────────────────
export const quickExamples = [
  "AccountにCustomer_Score__c数値項目を追加",
  "Sales_Rep権限セットでLeadの作成・参照権限を付与",
  "商談のクローズ日が空のままクローズできない入力規則を作成",
  "Contactオブジェクトの項目一覧を見せて",
];

// ── AI 応答シミュレーター ────────────────────────────────

interface SimulatedResponse {
  preview: ParsedIntentPreview;
  successMessage: string;
}

export function simulateIntentParse(instruction: string): SimulatedResponse {
  const lower = instruction.toLowerCase();

  // ADD_FIELD パターン
  if (lower.includes("項目") && (lower.includes("追加") || lower.includes("作成") || lower.includes("追加して"))) {
    const isNumber   = lower.includes("数値") || lower.includes("スコア") || lower.includes("金額");
    const isDate     = lower.includes("日付") || lower.includes("date");
    const isText     = lower.includes("テキスト") || lower.includes("text") || lower.includes("名前");
    const isCheck    = lower.includes("フラグ") || lower.includes("チェック") || lower.includes("boolean");
    const fieldType  = isNumber ? "Number" : isDate ? "Date" : isCheck ? "Checkbox" : isText ? "Text" : "Text";

    const objMatch   = instruction.match(/(Account|Contact|Opportunity|Lead|Case|取引先|商談|リード|担当者)/i);
    const fieldMatch = instruction.match(/([A-Za-z_]+__c)/);
    const object     = objMatch ? (
      objMatch[0] === "取引先" ? "Account" :
      objMatch[0] === "商談"   ? "Opportunity" :
      objMatch[0] === "リード"  ? "Lead" :
      objMatch[0] === "担当者"  ? "Contact" :
      objMatch[0]
    ) : "Account";
    const field      = fieldMatch ? fieldMatch[0] : "New_Field__c";

    return {
      preview: {
        action:        "ADD_FIELD",
        confidence:    0.94,
        objectApiName: object,
        fieldApiName:  field,
        label:         field.replace(/__c$/, "").replace(/_/g, " "),
        fieldType,
        description:   `${object} オブジェクトに ${field} (${fieldType}型) を作成します`,
        warnings:      fieldType === "Number" ? ["精度・小数点以下の桁数を確認してください"] : [],
      },
      successMessage: `✅ 項目 **${field}** を **${object}** に作成しました`,
    };
  }

  // ADD_PERMISSION パターン
  if (lower.includes("権限") || lower.includes("permission")) {
    const psMatch    = instruction.match(/([A-Za-z_]+(?:権限セット|_PS|_Permission)?)/i);
    const objMatch   = instruction.match(/(Account|Contact|Opportunity|Lead|Case|取引先|商談|リード)/i);
    const psName     = psMatch ? "Sales_Rep" : "SalesRep_PS";
    const object     = objMatch ? objMatch[0] : "Lead";

    return {
      preview: {
        action:           "ADD_PERMISSION",
        confidence:       0.91,
        permissionSetName: psName,
        objectApiName:    object,
        description:      `権限セット「${psName}」に ${object} オブジェクトへのアクセス権を付与します`,
        warnings:         ["modifyAllRecords は付与されません"],
      },
      successMessage: `✅ 権限セット **${psName}** に **${object}** の権限を付与しました`,
    };
  }

  // CREATE_VALIDATION_RULE パターン
  if (lower.includes("入力規則") || lower.includes("エラー") || lower.includes("validation")) {
    const objMatch = instruction.match(/(Account|Contact|Opportunity|Lead|Case|取引先|商談|リード|担当者)/i);
    const object   = objMatch ? (objMatch[0] === "商談" ? "Opportunity" : objMatch[0]) : "Opportunity";
    const ruleName = "Auto_Validation_Rule";

    return {
      preview: {
        action:        "CREATE_VALIDATION_RULE",
        confidence:    0.88,
        objectApiName: object,
        ruleName,
        errorMessage:  "この操作を実行するには必須項目を入力してください",
        formula:       "ISBLANK(CloseDate) && ISPICKVAL(StageName, 'Closed Won')",
        description:   `${object} オブジェクトに入力規則「${ruleName}」を作成します`,
        warnings:      ["数式を実際のフィールド名に合わせて確認してください"],
      },
      successMessage: `✅ 入力規則 **${ruleName}** を **${object}** に作成しました`,
    };
  }

  // DESCRIBE_OBJECT パターン
  if (lower.includes("一覧") || lower.includes("見せて") || lower.includes("describe") || lower.includes("確認")) {
    const objMatch = instruction.match(/(Account|Contact|Opportunity|Lead|Case|取引先|商談|リード|担当者)/i);
    const object   = objMatch ? (
      objMatch[0] === "取引先" ? "Account" :
      objMatch[0] === "商談"   ? "Opportunity" :
      objMatch[0]
    ) : "Account";

    return {
      preview: {
        action:        "DESCRIBE_OBJECT",
        confidence:    0.97,
        objectApiName: object,
        description:   `${object} オブジェクトのメタデータ情報を取得します`,
        warnings:      [],
      },
      successMessage: `📋 **${object}** オブジェクトの情報を取得しました（フィールド数: 58）`,
    };
  }

  // UNKNOWN
  return {
    preview: {
      action:      "UNKNOWN",
      confidence:  0.3,
      description: "指示の内容を解析できませんでした。より具体的な操作を教えてください。",
      warnings:    ["もう少し詳しく指示してください（例：項目追加、権限付与、入力規則の作成など）"],
    },
    successMessage: "",
  };
}
