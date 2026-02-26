import type { ExecutionRecord, OrgStat, OrgHealth, ParsedIntentPreview, Preset, IndustryPack } from "./types";

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

// ── 業界パック ────────────────────────────────────────────
export const industryPacks: IndustryPack[] = [
  {
    id: "realestate",
    name: "不動産業界 CRM",
    tagline: "物件管理・内覧スケジュール・成約フローを一括構築",
    accentBg: "bg-orange-100",
    accentText: "text-orange-600",
    stats: { objects: 2, fields: 4, validations: 1, permissions: 1 },
    items: [
      {
        type: "object",
        name: "物件 (Property__c)",
        target: "Property__c",
        description: "物件情報（タイプ・価格・面積・ステータス）を一元管理するカスタムオブジェクト",
      },
      {
        type: "object",
        name: "内覧記録 (Viewing__c)",
        target: "Viewing__c",
        description: "内覧スケジュール・担当者・結果を記録するカスタムオブジェクト",
      },
      {
        type: "field",
        name: "物件タイプ (PropertyType__c)",
        target: "Property__c.PropertyType__c",
        description: "マンション／一戸建て／土地／収益物件の選択リスト項目",
      },
      {
        type: "field",
        name: "販売価格 (ListingPrice__c)",
        target: "Property__c.ListingPrice__c",
        description: "販売価格を管理する通貨型項目（精度15・小数0）",
      },
      {
        type: "field",
        name: "専有面積 (FloorArea__c)",
        target: "Property__c.FloorArea__c",
        description: "専有面積を管理する数値型項目（精度6・小数2、単位: ㎡）",
      },
      {
        type: "field",
        name: "販売ステータス (Status__c)",
        target: "Property__c.Status__c",
        description: "販売中／内覧済／商談中／成約済／取り下げ の選択リスト",
      },
      {
        type: "validation",
        name: "成約時価格必須",
        target: "Property__c",
        description: "ステータスが「成約済」の場合、販売価格の入力を必須化",
      },
      {
        type: "permission",
        name: "不動産エージェント権限セット",
        target: "RealEstate_Agent_PS",
        description: "物件・内覧記録・取引先の参照／作成／更新権限をセット",
      },
    ],
  },
  {
    id: "medical",
    name: "医療・クリニック CRM",
    tagline: "患者管理・予約スケジュール・診察記録の業務フローを構築",
    accentBg: "bg-emerald-100",
    accentText: "text-emerald-600",
    stats: { objects: 2, fields: 4, validations: 1, permissions: 1 },
    items: [
      {
        type: "object",
        name: "患者 (Patient__c)",
        target: "Patient__c",
        description: "患者番号・生年月日・保険情報を管理するカスタムオブジェクト",
      },
      {
        type: "object",
        name: "診察予約 (Appointment__c)",
        target: "Appointment__c",
        description: "予約日時・担当医・診察種別・診察結果を管理するカスタムオブジェクト",
      },
      {
        type: "field",
        name: "患者番号 (PatientNo__c)",
        target: "Patient__c.PatientNo__c",
        description: "院内管理用の患者ID（テキスト型・一意性制約あり・外部ID）",
      },
      {
        type: "field",
        name: "生年月日 (BirthDate__c)",
        target: "Patient__c.BirthDate__c",
        description: "患者の生年月日（日付型）。年齢算出の基準値として使用",
      },
      {
        type: "field",
        name: "診察種別 (AppointmentType__c)",
        target: "Appointment__c.AppointmentType__c",
        description: "初診／再診／検査／手術前 の選択リスト項目",
      },
      {
        type: "field",
        name: "保険証番号 (InsuranceNo__c)",
        target: "Patient__c.InsuranceNo__c",
        description: "健康保険証番号（テキスト型・暗号化フィールド）",
      },
      {
        type: "validation",
        name: "予約日は未来のみ",
        target: "Appointment__c",
        description: "予約日時に過去の日時が入力された場合はエラーを返す入力規則",
      },
      {
        type: "permission",
        name: "受付スタッフ権限セット",
        target: "Clinic_Reception_PS",
        description: "患者・予約の参照／作成／更新権限。削除権限は除外",
      },
    ],
  },
  {
    id: "manufacturing",
    name: "製造業 CRM",
    tagline: "製品管理・発注書・サプライヤー連携に対応した設定を構築",
    accentBg: "bg-blue-100",
    accentText: "text-blue-600",
    stats: { objects: 2, fields: 4, validations: 2, permissions: 1 },
    items: [
      {
        type: "object",
        name: "製品詳細 (ProductDetail__c)",
        target: "ProductDetail__c",
        description: "製品コード・LOT番号・在庫数・製造日を管理するカスタムオブジェクト",
      },
      {
        type: "object",
        name: "発注書 (PurchaseOrder__c)",
        target: "PurchaseOrder__c",
        description: "発注数・発注先・納品予定日・ステータスを管理するカスタムオブジェクト",
      },
      {
        type: "field",
        name: "製品コード (ProductCode__c)",
        target: "ProductDetail__c.ProductCode__c",
        description: "社内管理用の製品識別コード（テキスト型・一意性制約・外部ID）",
      },
      {
        type: "field",
        name: "LOT番号 (LotNumber__c)",
        target: "ProductDetail__c.LotNumber__c",
        description: "製造LOTを追跡するためのテキスト項目（トレーサビリティ対応）",
      },
      {
        type: "field",
        name: "在庫数量 (StockQuantity__c)",
        target: "ProductDetail__c.StockQuantity__c",
        description: "現在庫数を管理する数値型項目（精度10・小数0）",
      },
      {
        type: "field",
        name: "納品予定日 (DeliveryDate__c)",
        target: "PurchaseOrder__c.DeliveryDate__c",
        description: "仕入れ先からの納品予定日（日付型）",
      },
      {
        type: "validation",
        name: "在庫数は0以上",
        target: "ProductDetail__c",
        description: "在庫数量に負の値が入力された場合はエラーを返す入力規則",
      },
      {
        type: "validation",
        name: "納品日は発注日以降",
        target: "PurchaseOrder__c",
        description: "納品予定日が発注日より前の場合はエラーを返す入力規則",
      },
      {
        type: "permission",
        name: "製造担当者権限セット",
        target: "Manufacturing_Staff_PS",
        description: "製品詳細・発注書の参照／作成／更新権限をセット",
      },
    ],
  },
  {
    id: "saas",
    name: "SaaS / IT CRM",
    tagline: "サブスクリプション管理・MRR追跡・チャーン防止に最適化",
    accentBg: "bg-violet-100",
    accentText: "text-violet-600",
    stats: { objects: 0, fields: 6, validations: 2, permissions: 1 },
    items: [
      {
        type: "field",
        name: "月次定期収益 (MRR__c)",
        target: "Account.MRR__c",
        description: "取引先のMRR（Monthly Recurring Revenue）を管理する通貨型項目",
      },
      {
        type: "field",
        name: "契約プラン (ContractPlan__c)",
        target: "Account.ContractPlan__c",
        description: "Free／Starter／Pro／Enterprise の選択リスト項目",
      },
      {
        type: "field",
        name: "契約更新日 (RenewalDate__c)",
        target: "Account.RenewalDate__c",
        description: "サブスクリプション更新日（日付型）。更新アラートの基準値として使用",
      },
      {
        type: "field",
        name: "チャーンリスクスコア (ChurnRiskScore__c)",
        target: "Account.ChurnRiskScore__c",
        description: "チャーンリスクを0〜100で管理する数値型項目（CSチーム参照用）",
      },
      {
        type: "field",
        name: "アクティブユーザー数 (ActiveUserCount__c)",
        target: "Account.ActiveUserCount__c",
        description: "直近30日のアクティブユーザー数（数値型・整数）",
      },
      {
        type: "field",
        name: "導入複雑度 (ImplementationComplexity__c)",
        target: "Opportunity.ImplementationComplexity__c",
        description: "Low／Medium／High／Enterprise の選択リスト。工数見積もりに使用",
      },
      {
        type: "validation",
        name: "プラン設定時は更新日必須",
        target: "Account",
        description: "ContractPlanが設定されているにもかかわらずRenewalDateが空の場合はエラー",
      },
      {
        type: "validation",
        name: "MRRは正の値のみ",
        target: "Account",
        description: "MRRに負の値が入力された場合はエラーを返す入力規則",
      },
      {
        type: "permission",
        name: "カスタマーサクセス権限セット",
        target: "CustomerSuccess_PS",
        description: "取引先・商談・ケースの参照／更新権限。削除権限は除外",
      },
    ],
  },
  {
    id: "finance",
    name: "金融・保険 CRM",
    tagline: "顧客資産管理・保険契約・アドバイザー業務に対応した設定を構築",
    accentBg: "bg-yellow-100",
    accentText: "text-yellow-700",
    stats: { objects: 1, fields: 6, validations: 2, permissions: 1 },
    items: [
      {
        type: "object",
        name: "保険契約 (InsurancePolicy__c)",
        target: "InsurancePolicy__c",
        description: "証券番号・保険種別・保険料・満期日を管理するカスタムオブジェクト",
      },
      {
        type: "field",
        name: "運用資産残高 (AUM__c)",
        target: "Account.AUM__c",
        description: "顧客の運用資産残高を管理する通貨型項目（Assets Under Management）",
      },
      {
        type: "field",
        name: "顧客セグメント (CustomerSegment__c)",
        target: "Account.CustomerSegment__c",
        description: "一般／プレミアム／VIP／法人 の選択リスト項目",
      },
      {
        type: "field",
        name: "証券番号 (PolicyNo__c)",
        target: "InsurancePolicy__c.PolicyNo__c",
        description: "保険証券番号（テキスト型・一意性制約・外部ID）",
      },
      {
        type: "field",
        name: "月額保険料 (PremiumAmount__c)",
        target: "InsurancePolicy__c.PremiumAmount__c",
        description: "月額保険料を管理する通貨型項目",
      },
      {
        type: "field",
        name: "満期日 (ExpiryDate__c)",
        target: "InsurancePolicy__c.ExpiryDate__c",
        description: "保険契約の満期日（日付型）。更新アラートの起点として使用",
      },
      {
        type: "field",
        name: "保険種別 (PolicyType__c)",
        target: "InsurancePolicy__c.PolicyType__c",
        description: "生命保険／損害保険／医療保険／年金 の選択リスト",
      },
      {
        type: "validation",
        name: "満期日は未来のみ",
        target: "InsurancePolicy__c",
        description: "新規契約時、満期日に過去の日付が入力された場合はエラーを返す",
      },
      {
        type: "validation",
        name: "保険料は正の値のみ",
        target: "InsurancePolicy__c",
        description: "月額保険料に0以下の値が入力された場合はエラーを返す入力規則",
      },
      {
        type: "permission",
        name: "ファイナンシャルアドバイザー権限セット",
        target: "FinancialAdvisor_PS",
        description: "取引先・保険契約・商談の参照／更新権限。顧客情報の削除権限は除外",
      },
    ],
  },
  {
    id: "retail",
    name: "小売・EC CRM",
    tagline: "会員管理・購買履歴・LTV分析に必要なCRM設定を一括構築",
    accentBg: "bg-pink-100",
    accentText: "text-pink-600",
    stats: { objects: 1, fields: 5, validations: 1, permissions: 1 },
    items: [
      {
        type: "object",
        name: "会員カード (MemberCard__c)",
        target: "MemberCard__c",
        description: "会員番号・ランク・ポイント残高・有効期限を管理するカスタムオブジェクト",
      },
      {
        type: "field",
        name: "生涯顧客価値 (LTV__c)",
        target: "Contact.LTV__c",
        description: "累計購買金額（LTV: Life Time Value）を管理する通貨型項目",
      },
      {
        type: "field",
        name: "会員ランク (MemberRank__c)",
        target: "Contact.MemberRank__c",
        description: "Bronze／Silver／Gold／Platinum の選択リスト。購買額に応じて自動更新予定",
      },
      {
        type: "field",
        name: "最終購買日 (LastPurchaseDate__c)",
        target: "Contact.LastPurchaseDate__c",
        description: "直近の購買日（日付型）。休眠顧客分析の基準値として使用",
      },
      {
        type: "field",
        name: "累計購買回数 (PurchaseCount__c)",
        target: "Contact.PurchaseCount__c",
        description: "累計購買回数（数値型・整数）。ロイヤルティ分析に使用",
      },
      {
        type: "field",
        name: "ECサイト会員ID (ECMemberId__c)",
        target: "Contact.ECMemberId__c",
        description: "ECサイトとの顧客照合に使用する外部IDフィールド（テキスト型）",
      },
      {
        type: "validation",
        name: "LTVは0以上",
        target: "Contact",
        description: "LTVに負の値が入力された場合はエラーを返す入力規則",
      },
      {
        type: "permission",
        name: "店舗スタッフ権限セット",
        target: "RetailStaff_PS",
        description: "取引先責任者・会員カードの参照／更新権限。個人情報の削除権限は除外",
      },
    ],
  },
  {
    id: "education",
    name: "教育・スクール CRM",
    tagline: "受講生管理・コース運営・入学〜卒業フローを一括構築",
    accentBg: "bg-sky-100",
    accentText: "text-sky-600",
    stats: { objects: 2, fields: 4, validations: 1, permissions: 1 },
    items: [
      {
        type: "object",
        name: "受講生 (Student__c)",
        target: "Student__c",
        description: "入学日・卒業予定日・在籍ステータスを管理するカスタムオブジェクト",
      },
      {
        type: "object",
        name: "コース (Course__c)",
        target: "Course__c",
        description: "コース名・レベル・定員・開講期間を管理するカスタムオブジェクト",
      },
      {
        type: "field",
        name: "入学日 (EnrollmentDate__c)",
        target: "Student__c.EnrollmentDate__c",
        description: "受講生の入学・受講開始日（日付型）",
      },
      {
        type: "field",
        name: "卒業予定日 (GraduationDate__c)",
        target: "Student__c.GraduationDate__c",
        description: "卒業・修了予定日（日付型）。修了証発行の基準として使用",
      },
      {
        type: "field",
        name: "定員 (MaxCapacity__c)",
        target: "Course__c.MaxCapacity__c",
        description: "コースの最大受講人数（数値型・整数）",
      },
      {
        type: "field",
        name: "レベル (CourseLevel__c)",
        target: "Course__c.CourseLevel__c",
        description: "初級／中級／上級／マスター の選択リスト項目",
      },
      {
        type: "validation",
        name: "卒業予定日は入学日以降",
        target: "Student__c",
        description: "卒業予定日が入学日より前の日付の場合はエラーを返す入力規則",
      },
      {
        type: "permission",
        name: "講師権限セット",
        target: "Instructor_PS",
        description: "受講生・コースの参照／更新権限。財務情報へのアクセスは制限",
      },
    ],
  },
  {
    id: "construction",
    name: "建設・工務店 CRM",
    tagline: "工事案件・工程管理・請負金額の業務フローを一括構築",
    accentBg: "bg-stone-100",
    accentText: "text-stone-600",
    stats: { objects: 2, fields: 4, validations: 2, permissions: 1 },
    items: [
      {
        type: "object",
        name: "工事案件 (ConstructionProject__c)",
        target: "ConstructionProject__c",
        description: "現場名・工事種別・請負金額・完了予定日を管理するカスタムオブジェクト",
      },
      {
        type: "object",
        name: "工程管理 (WorkSchedule__c)",
        target: "WorkSchedule__c",
        description: "工程名・担当者・マイルストーン日・進捗率を管理するカスタムオブジェクト",
      },
      {
        type: "field",
        name: "請負金額 (ContractAmount__c)",
        target: "ConstructionProject__c.ContractAmount__c",
        description: "工事の請負金額を管理する通貨型項目（精度15・小数0）",
      },
      {
        type: "field",
        name: "完工予定日 (CompletionDate__c)",
        target: "ConstructionProject__c.CompletionDate__c",
        description: "工事完了予定日（日付型）。工程計画の終端として使用",
      },
      {
        type: "field",
        name: "工事種別 (ProjectType__c)",
        target: "ConstructionProject__c.ProjectType__c",
        description: "新築／リフォーム／解体／外構 の選択リスト項目",
      },
      {
        type: "field",
        name: "マイルストーン日 (MilestoneDate__c)",
        target: "WorkSchedule__c.MilestoneDate__c",
        description: "各工程のマイルストーン日（日付型）。遅延アラートの基準値として使用",
      },
      {
        type: "validation",
        name: "完工予定日は着工日以降",
        target: "ConstructionProject__c",
        description: "完工予定日が着工日より前の場合はエラーを返す入力規則",
      },
      {
        type: "validation",
        name: "請負金額は正の値のみ",
        target: "ConstructionProject__c",
        description: "請負金額に0以下の値が入力された場合はエラーを返す入力規則",
      },
      {
        type: "permission",
        name: "現場監督権限セット",
        target: "SiteManager_PS",
        description: "工事案件・工程管理の参照／作成／更新権限。請負金額の参照は制限",
      },
    ],
  },
  {
    id: "recruitment",
    name: "人材・採用 CRM",
    tagline: "求職者管理・求人案件・選考フローを一括構築",
    accentBg: "bg-teal-100",
    accentText: "text-teal-600",
    stats: { objects: 2, fields: 4, validations: 1, permissions: 1 },
    items: [
      {
        type: "object",
        name: "求職者 (Candidate__c)",
        target: "Candidate__c",
        description: "現職情報・希望条件・入社可能日・選考ステータスを管理するカスタムオブジェクト",
      },
      {
        type: "object",
        name: "求人案件 (JobOpening__c)",
        target: "JobOpening__c",
        description: "職種・募集人数・給与レンジ・求人掲載期限を管理するカスタムオブジェクト",
      },
      {
        type: "field",
        name: "現職年収 (CurrentSalary__c)",
        target: "Candidate__c.CurrentSalary__c",
        description: "求職者の現職での年収（通貨型）。マッチング精度向上に使用",
      },
      {
        type: "field",
        name: "希望年収 (ExpectedSalary__c)",
        target: "Candidate__c.ExpectedSalary__c",
        description: "求職者の希望年収（通貨型）。求人とのマッチング条件として使用",
      },
      {
        type: "field",
        name: "入社可能日 (AvailableDate__c)",
        target: "Candidate__c.AvailableDate__c",
        description: "最短入社可能日（日付型）。企業側のニーズとのマッチングに使用",
      },
      {
        type: "field",
        name: "募集人数 (HeadCount__c)",
        target: "JobOpening__c.HeadCount__c",
        description: "求人の募集人数（数値型・整数）。充足率管理に使用",
      },
      {
        type: "validation",
        name: "希望年収チェック",
        target: "Candidate__c",
        description: "希望年収が現職年収を大幅に下回る場合（50%以下）は確認メッセージを表示",
      },
      {
        type: "permission",
        name: "リクルーター権限セット",
        target: "Recruiter_PS",
        description: "求職者・求人案件・商談の参照／作成／更新権限。年収情報は閲覧のみ",
      },
    ],
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
