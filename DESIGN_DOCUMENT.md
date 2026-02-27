# Salesforce Automation Dashboard — 包括的設計ドキュメント

**作成日**: 2026-02-27
**対象リポジトリ**: `/home/user/ourvendor`
**ステータス**: Phase 2a 完了 → Phase 2b 着手前

---

## クイックロードマップ

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   Salesforce Automation Dashboard                        │
│                          開発ロードマップ                                │
├──────────┬────────────────────────────────────────────────┬─────────────┤
│ フェーズ │ 内容                                           │ ステータス  │
├──────────┼────────────────────────────────────────────────┼─────────────┤
│ Phase 1  │ UI モック + スキル基盤                         │ ✅ 完了     │
│          │ · Next.js Dashboard UI (全ページ)              │             │
│          │ · salesforce-automation-skill (NLP+SF API)    │             │
├──────────┼────────────────────────────────────────────────┼─────────────┤
│ Phase 2a │ チャット → リアル Claude API 接続              │ ✅ 完了     │
│          │ · /api/chat/parse  (IntentParser → Claude)    │             │
│          │ · /api/chat/execute (DRY RUN モード)          │ ← 今ここ！  │
│          │ · ChatInterface モック完全撤廃                 │             │
│          │ · .env.example / 環境変数整備                  │             │
├──────────┼────────────────────────────────────────────────┼─────────────┤
│ Phase 2b │ 認証 + DB + 履歴永続化                         │ 🔜 次期     │
│          │ · NextAuth.js (Salesforce OAuth2)             │             │
│          │ · Supabase (users / orgs / execution_logs)    │             │
│          │ · /api/orgs CRUD + 接続テスト                  │             │
│          │ · /history ページのリアルデータ表示            │             │
├──────────┼────────────────────────────────────────────────┼─────────────┤
│ Phase 2c │ Salesforce リアル実行                          │ 🔲 未着手   │
│          │ · /api/chat/execute → MetadataAPI             │             │
│          │ · FieldManager / PermissionManager 接続       │             │
│          │ · Upstash QStash 非同期ジョブ化               │             │
│          │ · レート制限 / 監査ログ永続化                   │             │
├──────────┼────────────────────────────────────────────────┼─────────────┤
│ Phase 3  │ 高度機能                                       │ 🔲 未着手   │
│          │ · 仕様書自動生成 (/spec-generator)             │             │
│          │ · 業界パック → リアル SF 展開                   │             │
│          │ · RBAC (admin / developer / viewer)           │             │
│          │ · マルチテナント SaaS 化                       │             │
└──────────┴────────────────────────────────────────────────┴─────────────┘
```

### 直近のネクストアクション (Phase 2b)

```
優先度 高:
  □ Supabaseプロジェクト作成 + テーブル定義
      users, organizations, execution_logs, jobs
  □ NextAuth.js インストール・設定
  □ Salesforce OAuth2 カスタムプロバイダー実装
  □ セッション管理 (トークン暗号化)

優先度 中:
  □ /api/orgs CRUD 実装
  □ OrgContext をリアル DB に切り替え
  □ /history ページのリアルデータ表示
  □ ConnectOrgModal → リアル OAuth 接続

優先度 低（2b後半）:
  □ レート制限 (Upstash Redis)
  □ エラーハンドリング統一
  □ ロギング整備
```

---

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [技術スタック](#2-技術スタック)
3. [ディレクトリ構造](#3-ディレクトリ構造)
4. [現在のアーキテクチャ（実装済み）](#4-現在のアーキテクチャ)
5. [フロントエンド詳細](#5-フロントエンド詳細)
6. [バックエンドスキル詳細](#6-バックエンドスキル詳細)
7. [データフローと型定義](#7-データフローと型定義)
8. [目標アーキテクチャ（完全版）](#8-目標アーキテクチャ)
9. [データベース設計](#9-データベース設計)
10. [認証・認可設計](#10-認証認可設計)
11. [APIルート設計](#11-apiルート設計)
12. [非同期処理設計](#12-非同期処理設計)
13. [セキュリティ設計](#13-セキュリティ設計)
14. [インフラ・デプロイ設計](#14-インフラデプロイ設計)
15. [環境変数リファレンス](#15-環境変数リファレンス)
16. [実装ロードマップ](#16-実装ロードマップ)
17. [テスト戦略](#17-テスト戦略)
18. [既知の課題・TODO](#18-既知の課題todo)

---

## 1. プロジェクト概要

### 1.1 目的

Salesforce管理者が自然言語（日本語）で指示するだけで、複雑なSalesforce設定変更（カスタム項目作成、権限設定、入力規則作成など）を自動実行できるWebアプリケーション。

### 1.2 解決する課題

| 課題 | 解決策 |
|------|--------|
| Salesforce設定変更は専門知識が必要 | Claude AIが自然言語を構造化パラメータに変換 |
| 設定ミスによる本番影響リスク | DRY RUNモード＋信頼度スコアによる確認ステップ |
| 変更履歴が追いにくい | ExecutionLogによる完全な監査証跡 |
| 複数環境（本番/SB/UAT）の管理が煩雑 | マルチOrg対応のOrganization管理 |

### 1.3 主要機能

- **チャット自動化**: 日本語の指示からSalesforce設定変更を自動実行
- **業界パック**: 業界別CRM設定テンプレートの一括展開
- **パワーアクション**: Lightningページ一括編集・数式自動生成・重複マージ
- **実行履歴**: 操作ログの確認・追跡
- **仕様書自動生成**: 業務フロー・要件書からSalesforce設定を自動構築（Phase 3）

---

## 2. 技術スタック

### 2.1 フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 14.2.5 | Reactフレームワーク（App Router） |
| React | 18.3.1 | UIライブラリ |
| TypeScript | 5.5.4 | 型安全 |
| Tailwind CSS | 3.4.10 | ユーティリティファーストCSS |
| lucide-react | 0.441.0 | アイコンセット |
| clsx | 2.1.1 | 条件付きクラス結合 |
| tailwind-merge | 2.5.2 | Tailwindクラスマージ |

### 2.2 バックエンドスキル

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Node.js | LTS | ランタイム |
| TypeScript | 5.4.0 | 型安全 |
| @anthropic-ai/sdk | 0.34.0 | Claude API（Intent解析） |
| axios | 1.7.0 | HTTP クライアント |
| jsonwebtoken | 9.0.2 | JWT生成（Salesforce認証） |
| jsforce | 1.11.1 | Salesforce SDK |
| zod | 3.23.0 | スキーマバリデーション |
| dotenv | 16.4.0 | 環境変数管理 |
| Jest | 29.7.0 | ユニットテスト |

### 2.3 今後追加予定（目標スタック）

| 技術 | 用途 |
|------|------|
| Supabase (PostgreSQL) | DBおよびセッション管理 |
| NextAuth.js v5 | 認証フレームワーク |
| Upstash QStash | サーバーレス対応ジョブキュー |
| Upstash Redis | キャッシュ・レート制限 |
| Vercel | デプロイ・Edge Functions |

---

## 3. ディレクトリ構造

```
/home/user/ourvendor/
│
├── salesforce-dashboard/                    ← フロントエンド (Next.js)
│   ├── app/
│   │   ├── layout.tsx                       ← ルートレイアウト（OrgProvider）
│   │   ├── globals.css                      ← グローバルスタイル
│   │   ├── page.tsx                         ← ホーム（組織セレクター + 機能ショートカット）
│   │   ├── chat/
│   │   │   ├── page.tsx                     ← チャット画面（2カラムレイアウト）
│   │   │   └── ChatSearchParamReader.tsx    ← URLクエリからinitialQuery読み取り
│   │   ├── dashboard/page.tsx               ← ダッシュボード（Org Health）
│   │   ├── automations/page.tsx             ← 自動化管理（UI実装済・未接続）
│   │   ├── objects/page.tsx                 ← オブジェクト管理（UI実装済・未接続）
│   │   ├── permissions/page.tsx             ← 権限管理（UI実装済・未接続）
│   │   ├── presets/page.tsx                 ← パワーアクション（UI実装済・未接続）
│   │   ├── industry-packs/page.tsx          ← 業界パック（UI実装済・未接続）
│   │   ├── history/page.tsx                 ← 実行履歴（UI実装済・未接続）
│   │   ├── spec-generator/page.tsx          ← 仕様書自動生成（Phase 3）
│   │   ├── help/page.tsx                    ← ヘルプ
│   │   ├── settings/page.tsx                ← 設定（UI実装済・未接続）
│   │   └── api/
│   │       └── feedback/route.ts            ← POST /api/feedback（唯一の実装済みAPI）
│   │
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx            ← チャットUI本体（モックデータ使用中）
│   │   │   ├── ConfirmModal.tsx             ← 実行確認モーダル（信頼度・詳細表示）
│   │   │   └── IntentPreviewCard.tsx        ← Intent解析結果プレビューカード
│   │   ├── dashboard/
│   │   │   └── OrgHealthRing.tsx            ← Org健全性リング表示
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx                  ← ナビゲーションサイドバー
│   │   │   ├── Header.tsx                   ← ページヘッダー（パンくず）
│   │   │   ├── DemoBanner.tsx               ← デモ環境バナー
│   │   │   └── FeedbackButton.tsx           ← フィードバック送信ボタン
│   │   └── ui/                              ← UI プリミティブ（Button, Input等）
│   │
│   ├── contexts/
│   │   └── OrgContext.tsx                   ← 組織選択状態（localStorage永続化）
│   │
│   └── lib/
│       ├── orgs.ts                          ← モック Organizations（3件: 本番・DEV・UAT）
│       ├── mockData.ts                      ← チャット用モックデータ（simulateIntentParse）
│       └── types.ts                         ← フロントエンド用型定義
│
└── salesforce-automation-skill/             ← バックエンドスキル (Node.js/TypeScript)
    ├── src/
    │   ├── index.ts                         ← CLI + Public API エクスポート
    │   ├── skill/
    │   │   ├── SalesforceSkill.ts           ← メインオーケストレーター
    │   │   └── SalesforceSkill.test.ts      ← ユニットテスト
    │   ├── nlp/
    │   │   └── IntentParser.ts              ← Claude API による意図解析
    │   ├── auth/
    │   │   └── SalesforceAuth.ts            ← OAuth 2.0（JWT + Password）
    │   ├── api/
    │   │   ├── MetadataAPI.ts               ← Salesforce Metadata REST API
    │   │   └── ToolingAPI.ts                ← Salesforce Tooling API
    │   ├── actions/
    │   │   ├── FieldManager.ts              ← 項目 CRUD + バリデーション
    │   │   ├── PermissionManager.ts         ← 権限セット管理
    │   │   └── ValidationRuleManager.ts     ← 入力規則管理
    │   └── types/
    │       └── index.ts                     ← 全型定義（共有型）
    ├── package.json
    ├── tsconfig.json
    ├── jest.config.js
    ├── .env.example
    └── ARCHITECTURE.md                      ← 既存アーキテクチャ設計書
```

---

## 4. 現在のアーキテクチャ

### 4.1 現状の全体図

```
ブラウザ
  │
  ▼
Next.js (salesforce-dashboard)
  ├── ページ: 全UI実装済み
  ├── 状態管理: OrgContext (localStorage)
  ├── データ: 全モック（lib/orgs.ts, lib/mockData.ts）
  └── API: /api/feedback のみ実装済み

※ salesforce-automation-skill とは未接続
※ Salesforce実Orgとの接続なし（UIのみ）
```

### 4.2 バックエンドスキルの処理フロー（独立実装済み）

```
自然言語の指示（日本語）
  │
  ▼
SalesforceSkill.execute(instruction)
  │
  ├── IntentParser.parse()
  │     ├── Claude API (claude-sonnet-4-6)
  │     ├── Tool Use: parse_salesforce_intent
  │     └── 返値: { action, confidence, parameters, reasoning }
  │
  ├── 信頼度チェック (threshold: 0.7)
  │     ├── >= 0.7 → 即実行
  │     └── < 0.7 → onConfirmRequired() → ユーザー確認
  │
  ├── dispatch(intent)
  │     ├── ADD_FIELD       → FieldManager.addField()
  │     ├── MODIFY_FIELD    → FieldManager.modifyField()
  │     ├── DELETE_FIELD    → FieldManager.deleteField()
  │     ├── ADD_PERMISSION  → PermissionManager.addPermission()
  │     ├── REVOKE_PERMISSION → PermissionManager.revokePermission()
  │     ├── CREATE_VALIDATION_RULE → ValidationRuleManager.createRule()
  │     ├── TOGGLE_VALIDATION_RULE → ValidationRuleManager.toggleRule()
  │     ├── DESCRIBE_OBJECT → MetadataAPI.describeObject()
  │     └── UNKNOWN         → エラーメッセージ返却
  │
  ├── MetadataAPI / ToolingAPI
  │     ├── SalesforceAuth.getSession() → JWT/Password認証
  │     └── Salesforce REST API呼び出し
  │
  └── ExecutionLog記録（メモリ内、最新100件）
```

### 4.3 Salesforce 認証フロー

```
JWT Bearer Token Flow（推奨・本番向け）
─────────────────────────────────────────
SalesforceAuth
  │
  ├── fs.readFileSync(jwtPrivateKeyPath)  ← server.key
  ├── jwt.sign(claim, privateKey, RS256)  ← JWTアサーション生成（5分有効）
  └── POST /services/oauth2/token
        grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer
        assertion={jwt}
          │
          ▼
        access_token (2時間有効)
        instance_url
        org_id


Username/Password Flow（開発・テスト用）
─────────────────────────────────────────
POST /services/oauth2/token
  grant_type=password
  client_id={SF_CLIENT_ID}
  client_secret={SF_CLIENT_SECRET}
  username={SF_USERNAME}
  password={SF_PASSWORD}{SF_SECURITY_TOKEN}  ← 結合が必要
```

---

## 5. フロントエンド詳細

### 5.1 ページ一覧と実装状況

| ページ | パス | 実装状況 | 接続状況 |
|--------|------|---------|---------|
| ホーム | `/` | 完全実装 | モック（ORGS定数） |
| チャット自動化 | `/chat` | 完全実装 | モック（simulateIntentParse） |
| ダッシュボード | `/dashboard` | 部分実装 | モック |
| 自動化管理 | `/automations` | UI実装 | 未接続 |
| オブジェクト管理 | `/objects` | UI実装 | 未接続 |
| 権限管理 | `/permissions` | UI実装 | 未接続 |
| パワーアクション | `/presets` | UI実装 | 未接続 |
| 業界パック | `/industry-packs` | UI実装 | 未接続 |
| 実行履歴 | `/history` | UI実装 | 未接続 |
| 仕様書自動生成 | `/spec-generator` | Phase 3 | 未着手 |
| ヘルプ | `/help` | 完全実装 | 静的 |
| 設定 | `/settings` | UI実装 | 未接続 |

### 5.2 主要コンポーネント詳細

#### ChatInterface.tsx（最重要）

```typescript
// 現状: モックデータ使用
import { simulateIntentParse } from "@/lib/mockData";

// 変更が必要な箇所
const handleSend = async (text?: string) => {
  // 現在: simulateIntentParse() でモック
  // 変更後: POST /api/chat/parse にリクエスト
  const response = await fetch("/api/chat/parse", {
    method: "POST",
    body: JSON.stringify({ instruction, orgId: selectedOrg.id })
  });
};

const handleModalConfirm = async () => {
  // 現在: Math.random() で成否を決定
  // 変更後: POST /api/chat/execute にリクエスト
  const response = await fetch("/api/chat/execute", {
    method: "POST",
    body: JSON.stringify({ intent: modal.preview, orgId: selectedOrg.id })
  });
};
```

#### OrgContext.tsx（状態管理）

```typescript
// 現状: ORGS定数（lib/orgs.ts）から読み込み
// 変更後: APIから取得
const [orgs, setOrgs] = useState<SalesforceOrg[]>([]);

useEffect(() => {
  fetch("/api/orgs")
    .then(r => r.json())
    .then(data => setOrgs(data.orgs));
}, []);
```

#### ConnectOrgModal（ホームページ内）

```typescript
// 現状: handleOAuth/handleTest がモック（setTimeout）
// 変更後: 実際のOAuth認証フローに接続
const handleOAuth = () => {
  window.location.href = "/api/auth/signin/salesforce";
};
```

### 5.3 モックデータの実態

**`lib/orgs.ts`（現在）:**

```typescript
export const ORGS: SalesforceOrg[] = [
  { id: "prod", name: "本番環境", domain: "mycompany.my.salesforce.com", ... },
  { id: "dev",  name: "開発サンドボックス", domain: "mycompany--dev.sandbox...", ... },
  { id: "uat",  name: "テスト環境 (UAT)", domain: "mycompany--uat.sandbox...", ... },
];
```

**`lib/mockData.ts`（現在）:**
- `simulateIntentParse(instruction)`: 文字列パターンマッチでIntent生成
- `quickExamples`: チャット画面のサンプル指示リスト
- 実際のClaude API呼び出しは**なし**（バックエンドスキルに実装済み）

---

## 6. バックエンドスキル詳細

### 6.1 SalesforceSkill（オーケストレーター）

**ファイル**: `salesforce-automation-skill/src/skill/SalesforceSkill.ts`

```typescript
interface SalesforceSkillOptions {
  auth?: SalesforceAuth;           // 認証オブジェクト（省略時は環境変数から構築）
  apiVersion?: string;             // デフォルト: v59.0
  dryRun?: boolean;                // true = Salesforceへの書き込みなし
  confidenceThreshold?: number;    // デフォルト: 0.7（これ未満で確認プロンプト）
  onConfirmRequired?: (intent: ParsedIntent) => Promise<boolean>;
}
```

**重要な設計判断:**
- `dryRun: true` はSalesforce書き込みを完全スキップ（UIプレビューに使用）
- `confidenceThreshold` デフォルト0.7（低い場合は必ずユーザー確認を挟む）
- `executionLogs` はインスタンス変数（メモリ内・最大100件）→ DB永続化が必要

### 6.2 IntentParser（Claude API統合）

**ファイル**: `salesforce-automation-skill/src/nlp/IntentParser.ts`

```
使用モデル: claude-sonnet-4-6
max_tokens: 2048
API機能: Tool Use (Function Calling)
ツール名: parse_salesforce_intent
```

**システムプロンプトの主要ルール:**

| ルール | 内容 |
|--------|------|
| オブジェクト名正規化 | 「取引先」→ Account、「商談」→ Opportunity |
| 項目APIName生成 | スペース→アンダースコア、__cサフィックス付与 |
| 型推論 | 「スコア・金額」→ Number/Currency、「メモ」→ LongTextArea |
| 数式生成 | 日本語条件 → Salesforce Apex数式に変換 |
| セキュリティ | 削除・権限剥奪は必ずconfidenceを下げる |

**信頼度スコア基準:**

| スコア | 意味 | 動作 |
|--------|------|------|
| 1.0 | パラメータ完全特定 | 即実行 |
| 0.7 〜 0.9 | ほぼ特定（推測含む） | 即実行 |
| 0.5 〜 0.7 | 複数解釈可能 | 確認プロンプト |
| < 0.5 | UNKNOWN | 必ず確認・通常はキャンセル |

### 6.3 MetadataAPI（Salesforce Metadata REST API）

**ファイル**: `salesforce-automation-skill/src/api/MetadataAPI.ts`

**使用エンドポイント一覧:**

| 操作 | HTTPメソッド | エンドポイント |
|------|------------|--------------|
| カスタム項目作成 | POST | `/services/data/v59.0/metadata/CustomField` |
| カスタム項目更新 | PATCH | `/services/data/v59.0/metadata/CustomField/{Account.Field__c}` |
| カスタム項目削除 | DELETE | `/services/data/v59.0/metadata/CustomField/{Account.Field__c}` |
| 権限セット作成/更新 | POST | `/services/data/v59.0/metadata/PermissionSet` |
| 入力規則作成 | POST | `/services/data/v59.0/metadata/ValidationRule` |
| 入力規則更新 | PATCH | `/services/data/v59.0/metadata/ValidationRule/{Object.RuleName}` |
| オブジェクト情報取得 | GET | `/services/data/v59.0/sobjects/{ObjectName}/describe` |

**カスタム項目の型別必須パラメータ:**

| fieldType | 必須パラメータ |
|-----------|-------------|
| Text | length (デフォルト: 255) |
| LongTextArea | length (デフォルト: 32768), visibleLines: 5 |
| Number / Currency / Percent | precision (デフォルト: 18), scale (デフォルト: 0) |
| Picklist | valueSet.valueSetDefinition.value (配列) |
| Lookup | referenceTo, relationshipLabel, relationshipName |

### 6.4 ToolingAPI（Salesforce Tooling API）

**ファイル**: `salesforce-automation-skill/src/api/ToolingAPI.ts`

| メソッド | 用途 |
|---------|------|
| `executeAnonymous(apexCode)` | Apex匿名実行（既存データ一括更新等） |
| `listFlows(filter?)` | フロー定義一覧取得（processType, statusフィルタ） |
| `setFlowStatus(flowId, active)` | フローの有効化/無効化 |
| `listApexClasses()` | Apexクラス一覧 |
| `getRecentLogs(limit)` | デバッグログ取得 |
| `getLogBody(logId)` | ログ本文取得 |
| `query<T>(soql)` | Tooling SOQL実行 |

### 6.5 FieldManager（バリデーション仕様）

**バリデーションルール（validateField）:**

```typescript
// 必須チェック
if (!field.objectApiName) errors.push("objectApiName が必要です");
if (!field.fieldApiName) errors.push("fieldApiName が必要です");
if (!field.label) errors.push("label が必要です");
if (!field.type) errors.push("type が必要です");

// カスタム項目の __c サフィックスチェック
if (!field.fieldApiName.endsWith("__c")) {
  errors.push(`fieldApiName は __c で終わる必要があります`);
}

// Picklist値チェック
if (field.type === "Picklist" && !field.picklistValues?.length) {
  errors.push("Picklist型には picklistValues が必要です");
}

// Lookup先チェック
if (field.type === "Lookup" && !field.referenceTo) {
  errors.push("Lookup型には referenceTo が必要です");
}
```

---

## 7. データフローと型定義

### 7.1 コア型定義（`types/index.ts`）

```typescript
// ── 認証 ──────────────────────────────────────────────────
interface SalesforceSession {
  accessToken: string;
  instanceUrl: string;  // 例: https://myorg.my.salesforce.com
  orgId: string;        // 18桁のOrg ID
  expiresAt: Date;      // 2時間後（バッファ5分前に再取得）
}

// ── NLP Intent ────────────────────────────────────────────
type ActionType =
  | "ADD_FIELD" | "MODIFY_FIELD" | "DELETE_FIELD"
  | "ADD_PERMISSION" | "REVOKE_PERMISSION"
  | "CREATE_VALIDATION_RULE" | "TOGGLE_VALIDATION_RULE"
  | "CREATE_FLOW" | "DESCRIBE_OBJECT" | "UNKNOWN";

interface ParsedIntent {
  action: ActionType;
  confidence: number;           // 0.0 〜 1.0
  parameters: Record<string, unknown>;
  rawInstruction: string;
  reasoning: string;            // AIの判断根拠
}

// ── 実行結果 ───────────────────────────────────────────────
interface SkillExecutionResult {
  success: boolean;
  action: ActionType;
  message: string;
  details?: Record<string, unknown>;
  dryRun: boolean;
  executedAt: Date;
}

// ── 監査ログ ───────────────────────────────────────────────
interface ExecutionLog {
  instruction: string;          // ユーザーの元の指示
  intent: ParsedIntent;
  result: SkillExecutionResult;
  timestamp: Date;
}

// ── Salesforce デプロイ結果 ────────────────────────────────
interface DeployResult {
  success: boolean;
  id: string;
  status: "Pending" | "InProgress" | "Succeeded" | "Failed" | "Canceled";
  numberComponentsDeployed: number;
  numberComponentErrors: number;
  componentFailures?: ComponentFailure[];
}
```

### 7.2 フロントエンド固有型（`lib/types.ts`）

```typescript
// チャットメッセージ
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  type: "text" | "intent_preview" | "result";
  text?: string;
  intentPreview?: ParsedIntentPreview;
  status?: "success" | "failed";
  timestamp: Date;
}

// Intent確認モーダル用プレビュー
interface ParsedIntentPreview {
  action: ActionType;
  confidence: number;
  description: string;             // 人間が読める説明
  objectApiName?: string;
  fieldApiName?: string;
  label?: string;
  fieldType?: string;
  permissionSetName?: string;
  ruleName?: string;
  formula?: string;
  errorMessage?: string;
  warnings: string[];              // 低信頼度・破壊的操作の警告
}
```

### 7.3 エンドツーエンドのデータフロー（目標）

```
1. ユーザーが日本語で指示入力
   例: "AccountにCustomer_Score__c数値項目を追加して"
   └── ChatInterface.handleSend()

2. フロントエンド → Next.js API
   POST /api/chat/parse
   { instruction: "...", orgId: "prod", dryRun: false }
   └── Next.js API Route (route.ts)

3. Next.js API → salesforce-automation-skill
   const skill = new SalesforceSkill({ auth, dryRun: false })
   await skill.execute(instruction)
   └── IntentParser.parse() → Claude API

4. Claude API → ParsedIntent
   {
     action: "ADD_FIELD",
     confidence: 0.92,
     parameters: {
       objectApiName: "Account",
       fieldApiName: "Customer_Score__c",
       label: "顧客スコア",
       fieldType: "Number",
       precision: 18,
       scale: 0
     },
     reasoning: "スコアという単語からNumber型と判断"
   }

5. confidence >= 0.7 → フロントエンドに返却
   フロントエンドが確認モーダル表示

6. ユーザーが「実行する」クリック
   POST /api/chat/execute
   { intent: ParsedIntent, orgId: "prod" }

7. MetadataAPI.createCustomField()
   POST /services/data/v59.0/metadata/CustomField
   { fullName: "Account.Customer_Score__c", ... }

8. Salesforce Org → 成功レスポンス

9. ExecutionLog保存 → Supabase

10. フロントエンドに結果返却
    "項目 顧客スコア (Customer_Score__c) を Account に作成しました"
```

---

## 8. 目標アーキテクチャ

### 8.1 完全版システム構成図

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              ブラウザ                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────────────┐   │
│  │ チャット画面  │  │ 組織管理画面  │  │ 実行履歴 / 各管理画面        │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┬──────────────┘   │
└─────────┼─────────────────┼───────────────────────────┼─────────────────┘
          │                 │                           │
          ▼                 ▼                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   Next.js (Vercel) — App Router                         │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                         API Routes                                  │ │
│  │  POST /api/chat/parse     ← Intent解析（dryRun: true）             │ │
│  │  POST /api/chat/execute   ← 実行キュー投入                         │ │
│  │  GET  /api/jobs/:id       ← ジョブ進捗確認                         │ │
│  │  GET  /api/orgs           ← 組織一覧取得                           │ │
│  │  POST /api/orgs           ← 組織追加                               │ │
│  │  GET  /api/history        ← 実行履歴取得                           │ │
│  │  POST /api/auth/[...nextauth] ← NextAuth.js                       │ │
│  │  POST /api/feedback       ← フィードバック（実装済み）             │ │
│  └─────────────────────────────────┬──────────────────────────────────┘ │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │
              ┌─────────────────────┼──────────────────────┐
              │                     │                      │
              ▼                     ▼                      ▼
┌─────────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
│   Supabase           │  │  Upstash QStash  │  │  salesforce-          │
│   (PostgreSQL)       │  │  (Job Queue)     │  │  automation-skill     │
│                      │  │                  │  │                       │
│  users               │  │  ← execute job   │  │  SalesforceSkill      │
│  organizations       │  │  → worker callback│  │  IntentParser         │
│  execution_logs      │  │                  │  │  MetadataAPI          │
│  presets             │  └──────────────────┘  │  ToolingAPI           │
│  sessions            │                        └──────────┬────────────┘
└─────────────────────┘                                    │
                                                           ▼
                                          ┌────────────────────────────┐
                                          │      Salesforce Org         │
                                          │                             │
                                          │  Metadata REST API v59.0   │
                                          │  Tooling API v59.0         │
                                          │  OAuth 2.0                  │
                                          └────────────────────────────┘

                                          ┌────────────────────────────┐
                              + Claude API│  claude-sonnet-4-6          │
                                          │  Tool Use: parse_intent     │
                                          └────────────────────────────┘
```

### 8.2 Vercelサーバーレス制約への対応

| 課題 | 解決策 |
|------|--------|
| 関数タイムアウト（デフォルト10s） | Upstash QStashで非同期化 |
| 長期接続不可 | Short-polling または Supabase Realtime |
| 複数インスタンス間の状態共有不可 | Supabase/Redis に外部化 |
| ファイルシステムへの書き込み不可 | 秘密鍵はDB暗号化保存 |

---

## 9. データベース設計

### 9.1 推奨: Supabase (PostgreSQL)

Vercelとの統合が優れ、PostgreSQL + リアルタイム + 組み込み認証を提供。

### 9.2 テーブル定義

#### users テーブル

```sql
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### organizations テーブル

現在の `lib/orgs.ts` のモックデータをDB化。

```sql
CREATE TABLE organizations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 表示情報（現状 lib/orgs.ts に相当）
  name              TEXT NOT NULL,                         -- 例: 本番環境
  type              TEXT NOT NULL,                         -- Production / Developer Sandbox / Full Sandbox
  domain            TEXT NOT NULL,                         -- 例: mycompany.my.salesforce.com

  -- Salesforce接続情報
  sf_org_id         TEXT,                                  -- Salesforce Org ID (18桁)
  sf_instance_url   TEXT,                                  -- 例: https://mycompany.my.salesforce.com
  sf_login_url      TEXT DEFAULT 'https://login.salesforce.com',
  sf_api_version    TEXT DEFAULT 'v59.0',

  -- 暗号化トークン（AES-256-GCM）
  sf_access_token_enc  TEXT,                               -- 暗号化されたアクセストークン
  sf_refresh_token_enc TEXT,                               -- 暗号化されたリフレッシュトークン
  sf_token_expires_at  TIMESTAMPTZ,

  -- Connected App設定（JWT用）
  sf_client_id      TEXT,                                  -- Consumer Key
  sf_client_secret_enc TEXT,                               -- 暗号化されたConsumer Secret

  -- メタデータ
  connected_at      TIMESTAMPTZ,
  last_used_at      TIMESTAMPTZ,
  user_count        INTEGER DEFAULT 0,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_user_id ON organizations(user_id);
```

#### execution_logs テーブル

現状インメモリの `ExecutionLog[]` をDB永続化。

```sql
CREATE TABLE execution_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 入力
  instruction     TEXT NOT NULL,                           -- ユーザーの自然言語指示

  -- Intent解析結果（types/index.ts の ParsedIntent に対応）
  intent_action   TEXT NOT NULL,                           -- ActionType
  intent_confidence DECIMAL(4,3) NOT NULL,                 -- 0.000 〜 1.000
  intent_parameters JSONB,                                  -- 構造化パラメータ
  intent_reasoning  TEXT,                                   -- AIの判断根拠

  -- 実行結果（types/index.ts の SkillExecutionResult に対応）
  result_success    BOOLEAN NOT NULL,
  result_message    TEXT NOT NULL,
  result_details    JSONB,
  dry_run           BOOLEAN NOT NULL DEFAULT FALSE,

  -- SF デプロイ情報
  sf_deploy_id      TEXT,                                  -- Salesforce側のデプロイID

  executed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_execution_logs_org_id ON execution_logs(org_id);
CREATE INDEX idx_execution_logs_user_id ON execution_logs(user_id);
CREATE INDEX idx_execution_logs_executed_at ON execution_logs(executed_at DESC);
CREATE INDEX idx_execution_logs_action ON execution_logs(intent_action);
```

#### presets テーブル

パワーアクション（よく使う指示の保存）。

```sql
CREATE TABLE presets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  instruction TEXT NOT NULL,                               -- 実行する指示テキスト
  category    TEXT,                                        -- fields / permissions / validation等
  icon        TEXT,                                        -- アイコン名
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### jobs テーブル

非同期実行ジョブのステータス管理。

```sql
CREATE TABLE jobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id),
  user_id       UUID NOT NULL REFERENCES users(id),

  instruction   TEXT NOT NULL,
  intent        JSONB,                                     -- ParsedIntentのJSON

  status        TEXT NOT NULL DEFAULT 'pending',           -- pending / processing / done / failed
  result        JSONB,                                     -- SkillExecutionResultのJSON
  error_message TEXT,

  created_at    TIMESTAMPTZ DEFAULT NOW(),
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ
);

CREATE INDEX idx_jobs_user_id_status ON jobs(user_id, status);
```

### 9.3 Row Level Security (RLS)

```sql
-- ユーザーは自分のデータのみ参照・更新可能
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can view own orgs"
  ON organizations FOR ALL
  USING (user_id = auth.uid());

ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can view own logs"
  ON execution_logs FOR ALL
  USING (user_id = auth.uid());
```

---

## 10. 認証・認可設計

### 10.1 認証フロー概要

```
Webユーザー認証（NextAuth.js）
──────────────────────────────────────────────────────────

1. ユーザーが「ログイン」をクリック
2. NextAuth → Salesforce OAuth2 Authorization URL にリダイレクト
3. Salesforceでログイン承認
4. コールバック: GET /api/auth/callback/salesforce
5. アクセストークン取得 → Supabaseに暗号化保存
6. NextAuthセッション確立（JWT or DB session）
7. 以降のAPIリクエストにセッションクッキー付与

Salesforce-to-App 認証（JWT Bearer Token）
──────────────────────────────────────────────────────────
サーバーサイドからSalesforce APIを呼び出す際:
1. Connected AppのConsumer KeyとRS256秘密鍵でJWT生成
2. POST /services/oauth2/token (grant_type=jwt-bearer)
3. アクセストークン取得（2時間有効）
4. Supabaseのorganizationsテーブルに暗号化保存
5. 期限切れ5分前に自動リフレッシュ
```

### 10.2 NextAuth.js 設定方針

```typescript
// app/api/auth/[...nextauth]/route.ts の設計

import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [
    // カスタムSalesforceプロバイダー
    {
      id: "salesforce",
      name: "Salesforce",
      type: "oauth",
      authorization: {
        url: "https://login.salesforce.com/services/oauth2/authorize",
        params: { scope: "api refresh_token offline_access" }
      },
      token: "https://login.salesforce.com/services/oauth2/token",
      userinfo: "https://login.salesforce.com/services/oauth2/userinfo",
      profile(profile) {
        return {
          id: profile.user_id,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account }) {
      // 初回ログイン時: Salesforceトークンをsupabaseに保存
      if (account) {
        await saveOrgTokenToSupabase({
          userId: token.sub,
          accessToken: account.access_token,      // 暗号化して保存
          refreshToken: account.refresh_token,
          instanceUrl: account.instance_url,      // Salesforceが返す
        });
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub;
      return session;
    },
  },
  session: { strategy: "jwt" },
};
```

### 10.3 トークン暗号化

SalesforceのアクセストークンはそのままDBに保存せず、**AES-256-GCM**で暗号化。

```typescript
// lib/crypto.ts の設計

import crypto from "crypto";

const ENCRYPTION_KEY = Buffer.from(
  process.env.ENCRYPTION_KEY!, "hex"  // 32バイト = 64文字の16進数
);

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // iv + authTag + encrypted を結合してBase64
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decrypt(encryptedBase64: string): string {
  const data = Buffer.from(encryptedBase64, "base64");
  const iv = data.subarray(0, 16);
  const authTag = data.subarray(16, 32);
  const encrypted = data.subarray(32);
  const decipher = crypto.createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted) + decipher.final("utf8");
}
```

### 10.4 認可モデル（将来のRBAC）

```
Role: admin
  - 全機能アクセス
  - 本番環境への書き込み
  - ユーザー管理

Role: developer
  - 読み取り: 全環境
  - 書き込み: sandbox/UAT のみ
  - 本番への書き込み: 承認必要

Role: viewer
  - 読み取りのみ
  - 実行履歴閲覧
  - チャット: DRY RUNのみ
```

---

## 11. APIルート設計

### 11.1 現在の実装済みAPI

| エンドポイント | メソッド | 状態 | 説明 |
|--------------|---------|------|------|
| `/api/feedback` | POST | 実装済み | Slack/Discord Webhook通知 |

### 11.2 追加実装が必要なAPIルート

#### チャット関連

```
POST /api/chat/parse
  Request:  { instruction: string, orgId: string }
  Response: { preview: ParsedIntentPreview }
  処理:
    1. セッション確認
    2. orgIdからSalesforce認証情報取得（Supabase）
    3. SalesforceSkill({ dryRun: true }).execute(instruction)
    4. ParsedIntentをフロントエンド向けに変換して返却
  注意: dryRun: trueなのでSalesforceへの書き込みは発生しない

POST /api/chat/execute
  Request:  { intent: ParsedIntent, orgId: string, dryRun: boolean }
  Response: { jobId: string }   ← 即座に返す（非同期）
  処理:
    1. セッション確認
    2. QStashにジョブを投入
    3. jobIdをDBに保存してレスポンス

GET /api/jobs/:jobId
  Response: { status: "pending"|"processing"|"done"|"failed", result?: SkillExecutionResult }
  処理: DBからjobsテーブルを参照
```

#### 組織管理

```
GET /api/orgs
  Response: { orgs: Organization[] }
  処理: Supabaseから認証ユーザーの組織一覧取得

POST /api/orgs
  Request:  { name, type, username, password, securityToken, ... }
  Response: { org: Organization }
  処理:
    1. Salesforce接続テスト
    2. 成功ならトークンを暗号化してSupabaseに保存

DELETE /api/orgs/:orgId
  処理: Supabaseから削除（RLS: 自分の組織のみ）

POST /api/orgs/:orgId/test
  処理: 接続テスト（SalesforceAuth.getSession()）
```

#### 実行履歴

```
GET /api/history
  Query:  ?orgId=xxx&limit=50&offset=0&action=ADD_FIELD
  Response: { logs: ExecutionLog[], total: number }
  処理: Supabaseのexecution_logsテーブルから取得

GET /api/history/:logId
  Response: { log: ExecutionLog }
```

#### ジョブワーカー（QStashからのコールバック）

```
POST /api/jobs/worker
  Request:  QStashからのコールバック（X-Qstash-Signature検証必須）
  処理:
    1. シグネチャ検証（改ざん防止）
    2. jobsテーブルをprocessingに更新
    3. SalesforceSkill.execute()
    4. execution_logsに保存
    5. jobsテーブルをdone/failedに更新
```

### 11.3 APIエラーレスポンス標準

```typescript
// 全APIルートで統一するエラー形式
interface ApiError {
  error: {
    code: string;      // 例: "UNAUTHORIZED", "INVALID_INTENT", "SF_API_ERROR"
    message: string;   // 人間が読める説明
    details?: unknown; // 追加情報（Salesforceエラー詳細等）
  };
}

// HTTPステータスコード方針
// 200: 成功
// 201: 作成成功
// 400: リクエスト不正（バリデーションエラー）
// 401: 未認証
// 403: 権限なし
// 404: リソースなし
// 429: レート制限
// 500: サーバーエラー
// 502: Salesforce APIエラー
```

---

## 12. 非同期処理設計

### 12.1 なぜ非同期が必要か

| 処理 | 所要時間 | Vercel制限 |
|------|---------|-----------|
| Salesforce Metadata API デプロイ | 5〜30秒 | デフォルト10秒 |
| Claude API Intent解析 | 1〜5秒 | 問題なし |
| Salesforce接続テスト | 1〜3秒 | 問題なし |

Vercel Pro/Enterpriseでは最大300秒まで延長可能だが、サーバーレスのベストプラクティスとして非同期化を推奨。

### 12.2 Upstash QStash を使った非同期フロー

```
1. ユーザーが「実行する」クリック
   POST /api/chat/execute
     └── QStash.publishJSON({ url: "/api/jobs/worker", body: { jobId, intent, orgId } })
     └── Supabase: jobs テーブルに status=pending で記録
     └── フロントエンドに { jobId } を即座に返す（< 1秒）

2. QStashが /api/jobs/worker を呼び出す（数秒後）
   POST /api/jobs/worker
     └── X-Qstash-Signature ヘッダーでシグネチャ検証
     └── Supabase: status = processing に更新
     └── SalesforceSkill.execute(intent)
     └── Supabase: execution_logs に保存
     └── Supabase: status = done/failed に更新

3. フロントエンドがポーリング
   GET /api/jobs/:jobId (2秒間隔)
   または
   Supabase Realtime で jobs テーブルのchange event をリッスン
```

### 12.3 QStashの利点

- **Vercel対応**: サーバーレス環境で確実に動作
- **リトライ**: 失敗時に自動リトライ（最大3回）
- **DLQ**: 失敗ジョブのデッドレターキュー
- **シグネチャ検証**: セキュリティ（なりすまし防止）
- **遅延実行**: 指定時間後に実行（スケジュール機能）

---

## 13. セキュリティ設計

### 13.1 セキュリティレイヤー一覧

| レイヤー | 実装 | 状態 |
|---------|------|------|
| フロントエンド認証 | NextAuth.js | 未実装 |
| API認証 | セッション検証 | 未実装 |
| Salesforceトークン保護 | AES-256-GCM暗号化 | 未実装 |
| DRY RUNモード | SalesforceSkillオプション | 実装済み |
| 信頼度閾値 | confidenceThreshold | 実装済み |
| 監査ログ | ExecutionLog | メモリのみ（DB化必要） |
| RLS | Supabase Row Level Security | 未実装 |
| シグネチャ検証 | QStashコールバック | 未実装 |
| レート制限 | Upstash Redis | 未実装 |

### 13.2 秘密情報の管理方針

```
開発環境:
  .env.local          ← ローカルのみ、.gitignoreに必須
  certs/server.key    ← JWT秘密鍵、.gitignoreに必須

本番環境（Vercel）:
  ENCRYPTION_KEY      → Vercel環境変数（暗号化キー）
  ANTHROPIC_API_KEY   → Vercel環境変数
  NEXTAUTH_SECRET     → Vercel環境変数
  SUPABASE_SERVICE_KEY→ Vercel環境変数（サーバーサイドのみ）
  SF_CLIENT_ID        → Vercel環境変数
  SF_CLIENT_SECRET    → Vercel環境変数
  QSTASH_TOKEN        → Vercel環境変数

Salesforceトークン:
  per-org アクセストークン → Supabase（AES-256-GCM暗号化）
  per-org リフレッシュトークン → 同上
  JWT秘密鍵（オプション）→ Supabase（AES-256-GCM暗号化）
```

### 13.3 破壊的操作への追加安全策

現状のConfirmModal（フロントエンド）ですでに`isDestructive`チェックがあるが、バックエンドでも二重チェックが必要。

```typescript
// /api/chat/execute での追加チェック
const DESTRUCTIVE_ACTIONS = ["DELETE_FIELD", "REVOKE_PERMISSION"];

if (DESTRUCTIVE_ACTIONS.includes(intent.action)) {
  // 本番環境への破壊的操作は追加確認を必須化
  const org = await getOrg(orgId);
  if (org.type === "Production") {
    // confidence を強制的に引き下げ（0.5以下なら必ず確認済みのはず）
    if (intent.confidence > 0.5 && !body.explicitlyConfirmed) {
      return NextResponse.json(
        { error: { code: "REQUIRES_CONFIRMATION", message: "本番環境の削除操作には明示的な確認が必要です" } },
        { status: 400 }
      );
    }
  }
}
```

### 13.4 レート制限

```typescript
// lib/ratelimit.ts の設計（Upstash Redis使用）
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "60 s"),  // 10req/min per user
});

// /api/chat/execute で適用
const { success } = await ratelimit.limit(`user:${session.user.id}`);
if (!success) {
  return NextResponse.json(
    { error: { code: "RATE_LIMITED", message: "リクエストが多すぎます（10回/分まで）" } },
    { status: 429 }
  );
}
```

---

## 14. インフラ・デプロイ設計

### 14.1 本番インフラ構成

```
GitHub
  │ push to main
  ▼
Vercel (自動デプロイ)
  ├── salesforce-dashboard/  ← Next.js アプリ
  │     ├── /app/**          ← Server/Client Components
  │     └── /api/**          ← Serverless Functions
  │
  ├── 環境変数（Vercel Dashboard）
  └── Edge Network（Vercel CDN）

Supabase (managed PostgreSQL)
  ├── Database
  │     ├── users
  │     ├── organizations
  │     ├── execution_logs
  │     ├── presets
  │     └── jobs
  ├── Auth (NextAuth統合で使用しない)
  ├── Realtime (jobs テーブル変更通知)
  └── Storage (将来: 仕様書ファイル保存)

Upstash
  ├── QStash (ジョブキュー)
  └── Redis (レート制限・キャッシュ)
```

### 14.2 vercel.json 設定

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "app/api/jobs/worker/route.ts": {
      "maxDuration": 300
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

### 14.3 CI/CD パイプライン

```
開発フロー:
  1. feature ブランチで開発
  2. PR作成 → Vercel Preview Deploymentが自動生成
  3. テスト通過後 → main にマージ
  4. Vercel 本番デプロイ自動実行

環境:
  development → localhost:3000 (.env.local)
  preview     → pr-xxx.vercel.app (.env.preview)
  production  → salesforce-auto.vercel.app (.env.production)
```

### 14.4 モニタリング（推奨）

| ツール | 用途 |
|--------|------|
| Vercel Analytics | ページビュー・パフォーマンス |
| Vercel Logs | APIルートのリアルタイムログ |
| Supabase Dashboard | DB監視・クエリ分析 |
| Upstash Console | キュー状態・失敗ジョブ確認 |
| Sentry（将来） | エラートラッキング |

---

## 15. 環境変数リファレンス

### 15.1 フロントエンド（`salesforce-dashboard/.env.local`）

```bash
# ── 必須 ─────────────────────────────────────────────────

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # openssl rand -base64 32

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # サーバーサイドのみ

# Salesforce Connected App（全ユーザー共通）
SF_CLIENT_ID=3MVG9xxxxx
SF_CLIENT_SECRET=xxxxxxxxxxxx

# Claude API
ANTHROPIC_API_KEY=sk-ant-xxxxx

# トークン暗号化キー
ENCRYPTION_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # 64文字hex

# ── オプション ────────────────────────────────────────────

# Upstash QStash（非同期ジョブ）
QSTASH_TOKEN=xxxxx
QSTASH_CURRENT_SIGNING_KEY=sig_xxxxx
QSTASH_NEXT_SIGNING_KEY=sig_xxxxx

# Upstash Redis（レート制限）
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx

# フィードバックWebhook（実装済み）
FEEDBACK_WEBHOOK_URL=https://hooks.slack.com/...
```

### 15.2 バックエンドスキル（`salesforce-automation-skill/.env`）

スキルはライブラリとしてNext.jsから呼び出す形に移行するため、独立した環境変数ファイルは**廃止予定**。各設定値はNextAuth + Supabaseで管理。

```bash
# ── 開発・CLIテスト用（本番ではNext.js環境変数で管理）─────

# Salesforce接続
SF_CLIENT_ID=3MVG9xxxxx
SF_CLIENT_SECRET=xxxxxxxxxxxx
SF_JWT_PRIVATE_KEY_PATH=./certs/server.key
SF_JWT_USERNAME=admin@yourorg.salesforce.com
SF_LOGIN_URL=https://login.salesforce.com
SF_API_VERSION=v59.0

# Claude API
ANTHROPIC_API_KEY=sk-ant-xxxxx

# 動作設定
DRY_RUN=true       # CLI使用時の安全設定
LOG_LEVEL=info
```

---

## 16. 実装ロードマップ

### Phase 2a: 基盤構築（最優先・推定2週間）

#### 週1: DB + 認証

```
タスク:
  □ Supabaseプロジェクト作成
  □ テーブル作成（users, organizations, execution_logs, jobs）
  □ RLS設定
  □ NextAuth.js インストール・設定
  □ Salesforceカスタムプロバイダー実装
  □ ログイン/ログアウトUI追加
  □ トークン暗号化ライブラリ実装 (lib/crypto.ts)
  □ ConnectOrgModalをリアルOAuth接続に変更
```

#### 週2: チャット接続

```
タスク:
  □ /api/chat/parse 実装
      - salesforce-automation-skillをdependencyとして追加
      - dryRun: trueでParseOnly動作
  □ /api/chat/execute 実装（同期版・まず最短実装）
  □ ChatInterface.tsx のAPI接続切り替え
      - simulateIntentParse → fetch("/api/chat/parse")
      - Math.random() → fetch("/api/chat/execute")
  □ OrgContextをAPIから取得に変更
  □ /api/orgs CRUD実装
```

### Phase 2b: 機能完成（推定2週間）

#### 週3: 非同期化 + 履歴

```
タスク:
  □ Upstash QStashセットアップ
  □ /api/chat/executeを非同期化
  □ /api/jobs/worker実装（QStashコールバック）
  □ /api/jobs/:id ポーリングエンドポイント
  □ UIにジョブ進捗表示（スピナー→完了通知）
  □ /api/history実装
  □ /history ページにリアルデータ表示
```

#### 週4: セキュリティ + 残機能

```
タスク:
  □ レート制限（Upstash Redis）
  □ 破壊的操作の追加安全策
  □ /api/orgs/:id/test接続テスト
  □ /objects ページのSF連携（describeObject）
  □ /automations ページのSF連携（listFlows）
  □ エラーハンドリング統一
  □ ロギング整備
```

### Phase 3: 高度機能（推定1ヶ月）

```
タスク:
  □ /spec-generator 実装
      - 要件書ファイルアップロード（Supabase Storage）
      - Claude APIで要件解析 → 複数Intentに分解
      - バッチ実行キュー
  □ 業界パックのリアルSF展開
  □ Salesforce Platform Eventsリアルタイム通知
  □ RBAC実装（admin / developer / viewer）
  □ マルチテナント対応（SaaS化）
```

---

## 17. テスト戦略

### 17.1 現在のテスト状況

```
salesforce-automation-skill:
  ✅ SalesforceSkill.test.ts（ユニットテスト）
  ✅ Jest設定済み（カバレッジ70%以上必須）

salesforce-dashboard:
  ❌ テストなし（Next.jsプロジェクト）
```

### 17.2 テスト計画

#### バックエンドスキル（Jest）

```
ユニットテスト対象:
  ✅ SalesforceSkill.ts（既存）
  □ IntentParser.ts（Claude APIモック）
  □ FieldManager.ts（バリデーションロジック）
  □ PermissionManager.ts
  □ ValidationRuleManager.ts
  □ SalesforceAuth.ts（JWTフロー）
  □ MetadataAPI.ts（axiosモック）

テストコマンド:
  cd salesforce-automation-skill
  npm test -- --coverage
```

#### フロントエンド（Jest + React Testing Library）

```
追加予定:
  □ ChatInterface.tsx
  □ ConfirmModal.tsx
  □ OrgContext.tsx
  □ APIルート（/api/chat/parse等）

E2Eテスト（Playwright）:
  □ ログインフロー
  □ チャット送信 → 確認 → 実行フロー
  □ 組織接続フロー
```

#### インテグレーションテスト

```
Salesforce Sandbox を使ったE2E:
  □ 実際の項目作成・削除
  □ DRY RUNモード検証
  □ 権限エラーハンドリング
```

---

## 18. 既知の課題・TODO

### 18.1 即座に対応が必要なもの

| 優先度 | 課題 | 対応 |
|--------|------|------|
| 高 | ChatInterfaceがモックのみ | /api/chat/* 実装 |
| 高 | OrgContextがハードコード | /api/orgs 実装 + DB接続 |
| 高 | ExecutionLogがメモリのみ | Supabase移行 |
| 高 | 認証なし（誰でもアクセス可） | NextAuth.js実装 |
| 中 | ConnectOrgModalがモック | OAuth接続実装 |
| 中 | Vercel関数タイムアウトリスク | QStash非同期化 |

### 18.2 技術的負債

| 課題 | ファイル | 内容 |
|------|---------|------|
| `Math.random()` で成否決定 | `ChatInterface.tsx:215` | 必ずリアルAPIに置換 |
| `setTimeout` でモック | `app/page.tsx:37,43` | リアルOAuth実装 |
| ハードコードのユーザー名 | `app/page.tsx:259` | 「田中 太郎 さん」→ 動的取得 |
| トークンのセッション管理なし | `SalesforceAuth.ts` | マルチユーザー非対応 |
| `CREATE_FLOW` アクション未実装 | `SalesforceSkill.ts:128` | dispatchにケース追加必要 |

### 18.3 セキュリティリスク

| リスク | 深刻度 | 対応 |
|--------|--------|------|
| APIルートに認証なし | 高 | NextAuth + session check |
| Salesforceトークン平文保存の可能性 | 高 | AES-256-GCM暗号化 |
| `certs/server.key` の誤コミットリスク | 高 | .gitignore確認 + gitleaks導入 |
| CORS設定なし | 中 | next.config.mjs で設定 |
| レート制限なし | 中 | Upstash Redis実装 |

### 18.4 Salesforce API バージョン

現在 `v59.0` を使用。最新は `v63.0`（2025年冬リリース）。

```
推奨: SF_API_VERSION を環境変数で管理し、定期的に更新
```

---

## 付録: Salesforce Connected App 設定手順

### 本番接続に必要な事前作業

1. **Salesforce管理者アカウントで設定を開く**

2. **アプリケーションマネージャ → 新規接続アプリケーション**

3. **基本設定**
   - 接続アプリケーション名: `SF Automation Dashboard`
   - API参照名: `SF_Automation_Dashboard`
   - 取引先責任者メール: `admin@yourcompany.com`

4. **OAuth設定を有効化**
   - コールバックURL: `https://your-app.vercel.app/api/auth/callback/salesforce`
   - 選択したOAuthスコープ:
     - `api` (Salesforce API を使用して組織データにアクセス)
     - `refresh_token, offline_access`

5. **JWT用の証明書生成とアップロード**（サーバー間認証の場合）

   ```bash
   mkdir certs
   openssl genrsa -out certs/server.key 2048
   openssl req -new -x509 -key certs/server.key -out certs/server.crt -days 365
   # server.crt を Salesforce Connected App にアップロード
   # server.key は .gitignore に追加し、Supabase暗号化保存へ
   ```

6. **プロファイル割り当て**
   - Connected Appの管理 → プロファイルを管理
   - 実行ユーザーのプロファイルを追加

7. **Consumer KeyとConsumer Secretを取得**
   - Vercel環境変数 `SF_CLIENT_ID`, `SF_CLIENT_SECRET` に設定

---

*このドキュメントはコードベースの全ファイルを精読して自動生成されました。*
*最終更新: 2026-02-27*
