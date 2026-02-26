# Salesforce Automation Skill — アーキテクチャ設計書

## システム全体図

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Salesforce Automation Skill                          │
│                                                                         │
│  ┌─────────────┐     ┌──────────────────┐     ┌─────────────────────┐  │
│  │   ユーザー   │────▶│  SalesforceSkill │────▶│  IntentParser       │  │
│  │(自然言語指示)│     │  (Orchestrator)  │     │  (Claude API)       │  │
│  └─────────────┘     └────────┬─────────┘     └──────────┬──────────┘  │
│                               │                          │             │
│                    ParsedIntent│◀─────────────────────────┘             │
│                               │                                         │
│                    ┌──────────▼──────────────────────────────────┐      │
│                    │          Action Dispatcher                   │      │
│                    │  ADD_FIELD  │  ADD_PERMISSION  │  CREATE_RULE│      │
│                    └──────┬─────┴────────┬──────────┴──────┬─────┘      │
│                           │              │                 │             │
│                    ┌──────▼──────┐ ┌─────▼─────┐ ┌────────▼──────┐     │
│                    │FieldManager │ │Permission  │ │Validation     │     │
│                    │             │ │Manager     │ │RuleManager    │     │
│                    └──────┬──────┘ └─────┬──────┘ └───────┬───────┘     │
│                           │              │                │             │
│                    ┌──────▼──────────────▼────────────────▼───────┐     │
│                    │              MetadataAPI                      │     │
│                    │   createCustomField / upsertPermissionSet     │     │
│                    │   createValidationRule / describeObject       │     │
│                    └──────────────────────┬────────────────────────┘     │
│                                          │                              │
│                    ┌─────────────────────▼──────────────┐              │
│                    │         ToolingAPI (補助)            │              │
│                    │  executeAnonymous / listFlows       │              │
│                    └──────────────────────┬─────────────┘              │
│                                          │                              │
└──────────────────────────────────────────┼──────────────────────────────┘
                                           │
                    ┌──────────────────────▼──────────────────────┐
                    │            Salesforce Org                    │
                    │                                              │
                    │  ┌────────────────┐  ┌────────────────────┐ │
                    │  │ Metadata API   │  │   Tooling API      │ │
                    │  │ REST v59.0     │  │   REST v59.0       │ │
                    │  └────────────────┘  └────────────────────┘ │
                    └──────────────────────────────────────────────┘
```

## 認証フロー

```
JWT Bearer Token Flow (推奨)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  App Server                 Salesforce
       │                          │
       │  1. JWT生成              │
       │   (RS256署名, 5分有効)   │
       │                          │
       │  2. POST /oauth2/token   │
       │   grant_type=jwt-bearer  │
       │   assertion={jwt}        │
       │─────────────────────────▶│
       │                          │ 3. JWT検証
       │                          │   (Connected App設定と照合)
       │  4. access_token         │
       │◀─────────────────────────│
       │                          │
       │  5. API呼び出し          │
       │   Bearer {access_token}  │
       │─────────────────────────▶│


Username/Password Flow (開発用 fallback)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  POST /services/oauth2/token
  grant_type=password
  client_id={consumer_key}
  client_secret={consumer_secret}
  username={username}
  password={password}{security_token}
```

## 主要APIエンドポイント

### Salesforce Metadata REST API (v59.0)

| 操作 | メソッド | エンドポイント |
|------|---------|--------------|
| カスタム項目作成 | POST | `/services/data/v59.0/metadata/CustomField` |
| カスタム項目更新 | PATCH | `/services/data/v59.0/metadata/CustomField/{fullName}` |
| カスタム項目削除 | DELETE | `/services/data/v59.0/metadata/CustomField/{fullName}` |
| 権限セット作成/更新 | POST | `/services/data/v59.0/metadata/PermissionSet` |
| 入力規則作成 | POST | `/services/data/v59.0/metadata/ValidationRule` |
| 入力規則更新 | PATCH | `/services/data/v59.0/metadata/ValidationRule/{fullName}` |
| オブジェクト情報取得 | GET | `/services/data/v59.0/sobjects/{objectName}/describe` |

### Salesforce Tooling API (v59.0)

| 操作 | メソッド | エンドポイント |
|------|---------|--------------|
| Apex匿名実行 | GET | `/services/data/v59.0/tooling/executeAnonymous?anonymousBody={code}` |
| フロー一覧 | GET | `/services/data/v59.0/tooling/query?q={soql}` |
| デバッグログ取得 | GET | `/services/data/v59.0/tooling/sobjects/ApexLog/{id}/Body` |

### OAuth 2.0

| 操作 | メソッド | エンドポイント |
|------|---------|--------------|
| JWT認証 | POST | `/services/oauth2/token` (grant_type=jwt-bearer) |
| Password認証 | POST | `/services/oauth2/token` (grant_type=password) |
| トークン失効 | POST | `/services/oauth2/revoke` |

## NLP処理フロー (Claude API)

```
自然言語入力
    │
    ▼
┌─────────────────────────────────────────┐
│ System Prompt                           │
│  - Salesforce専門家ロール               │
│  - オブジェクト名正規化ルール           │
│  - 信頼度スコア基準                     │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ Tool Use: parse_salesforce_intent       │
│  - action: ActionType                   │
│  - confidence: 0.0〜1.0                │
│  - reasoning: 判断根拠                  │
│  - parameters: {操作固有パラメータ}    │
└─────────────────────────────────────────┘
    │
    ├── confidence >= 0.7 → 即実行
    │
    └── confidence < 0.7 → onConfirmRequired() → ユーザー確認
```

## Salesforce Connected App 設定手順

1. **設定** → **アプリケーションマネージャ** → **新規接続アプリケーション**

2. **OAuth設定を有効化**
   - コールバックURL: `https://localhost/` (JWT用は任意)
   - 選択した OAuth 範囲:
     - `api` (API を使用した組織データへのアクセス)
     - `refresh_token, offline_access`
     - `full` (完全アクセス — 本番環境では最小権限に絞ること)

3. **JWT Bearer Flow 用**
   - 「デジタル証明書を使用」にチェック
   - X.509証明書 (.crt) をアップロード
   ```bash
   # 証明書生成
   mkdir certs && cd certs
   openssl genrsa -out server.key 2048
   openssl req -new -x509 -key server.key -out server.crt -days 365
   ```

4. **プロファイル/権限セットを割り当て**
   - Connected Appの管理 → プロファイルを管理 → 実行ユーザーのプロファイルを追加

## セキュリティ考慮事項

- **最小権限の原則**: Metadata API アクセスに必要な権限のみ付与
- **DRY_RUN**: 本番環境では必ず事前にDRY RUNで確認
- **秘密鍵管理**: `server.key` は .gitignore に追加、本番ではSecret Managerを使用
- **監査ログ**: 全操作は `getExecutionLogs()` で追跡可能
- **信頼度閾値**: `confidenceThreshold` でAI判断の自動実行基準を設定
