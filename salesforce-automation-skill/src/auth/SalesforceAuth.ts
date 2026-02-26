/**
 * SalesforceAuth — OAuth 2.0 認証モジュール
 *
 * 対応フロー:
 *   1. JWT Bearer Token Flow  ← 推奨 (サーバー間・ユーザー操作不要)
 *      https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_jwt_flow.htm
 *   2. Username/Password Flow ← 開発・テスト用
 *      https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_username_password_flow.htm
 *
 * Salesforce 側での事前設定:
 *   1. 設定 > アプリケーションマネージャ > 新規接続アプリケーション
 *   2. OAuth設定を有効化、スコープ: api, refresh_token, offline_access
 *   3. JWT用: デジタル証明書を使用 にチェック → X.509証明書をアップロード
 *      $ openssl genrsa -out server.key 2048
 *      $ openssl req -new -x509 -key server.key -out server.crt -days 365
 */

import * as fs from "fs";
import axios from "axios";
import * as jwt from "jsonwebtoken";
import type { SalesforceAuthConfig, SalesforceSession } from "../types/index.js";

const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000; // 5分前に再取得

export class SalesforceAuth {
  private config: SalesforceAuthConfig;
  private session: SalesforceSession | null = null;

  constructor(config: SalesforceAuthConfig) {
    this.config = config;
  }

  /**
   * 有効なセッションを返す。期限切れなら自動再認証。
   */
  async getSession(): Promise<SalesforceSession> {
    if (this.session && this.isSessionValid(this.session)) {
      return this.session;
    }

    if (this.config.jwtClientId && this.config.jwtUsername && this.config.jwtPrivateKeyPath) {
      this.session = await this.authenticateWithJWT();
    } else if (this.config.username && this.config.password) {
      this.session = await this.authenticateWithPassword();
    } else {
      throw new Error(
        "認証情報が不足しています。JWT設定 または Username/Password を .env に設定してください。"
      );
    }

    return this.session;
  }

  // ── JWT Bearer Token Flow ────────────────────────────────────────────────

  private async authenticateWithJWT(): Promise<SalesforceSession> {
    const { jwtClientId, jwtUsername, jwtPrivateKeyPath, loginUrl } = this.config;

    if (!jwtClientId || !jwtUsername || !jwtPrivateKeyPath) {
      throw new Error("JWT認証に必要な設定が不足しています");
    }

    const privateKey = fs.readFileSync(jwtPrivateKeyPath, "utf8");

    // JWT クレームセット
    const claim = {
      iss: jwtClientId,          // Connected App の Consumer Key
      sub: jwtUsername,          // Salesforce ユーザー名
      aud: loginUrl,             // https://login.salesforce.com or test
      exp: Math.floor(Date.now() / 1000) + 300, // 5分後
    };

    const assertion = jwt.sign(claim, privateKey, { algorithm: "RS256" });

    const response = await axios.post(
      `${loginUrl}/services/oauth2/token`,
      new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return this.parseTokenResponse(response.data);
  }

  // ── Username/Password Flow ───────────────────────────────────────────────

  private async authenticateWithPassword(): Promise<SalesforceSession> {
    const { username, password, securityToken, loginUrl, jwtClientId, jwtPrivateKeyPath } =
      this.config;
    const clientSecret = process.env.SF_CLIENT_SECRET;

    if (!username || !password) {
      throw new Error("Username/Password 認証に必要な設定が不足しています");
    }

    // パスワード + セキュリティトークンを結合 (SF仕様)
    const fullPassword = securityToken ? `${password}${securityToken}` : password;

    const response = await axios.post(
      `${loginUrl}/services/oauth2/token`,
      new URLSearchParams({
        grant_type: "password",
        client_id: jwtClientId ?? "",
        client_secret: clientSecret ?? "",
        username,
        password: fullPassword,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return this.parseTokenResponse(response.data);
  }

  // ── ヘルパー ─────────────────────────────────────────────────────────────

  private parseTokenResponse(data: {
    access_token: string;
    instance_url: string;
    id: string;
    issued_at?: string;
  }): SalesforceSession {
    // instance_url 例: https://yourorg.my.salesforce.com
    // id 例: https://login.salesforce.com/id/00Dxx0000000001/005xx000000xxxxx
    const orgId = data.id.split("/")[data.id.split("/").length - 2];

    return {
      accessToken: data.access_token,
      instanceUrl: data.instance_url,
      orgId,
      // Salesforceのアクセストークンは通常2時間有効
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    };
  }

  private isSessionValid(session: SalesforceSession): boolean {
    return session.expiresAt.getTime() - Date.now() > TOKEN_EXPIRY_BUFFER_MS;
  }

  /**
   * Authorization ヘッダー文字列を返す
   */
  async getAuthHeader(): Promise<string> {
    const session = await this.getSession();
    return `Bearer ${session.accessToken}`;
  }

  /**
   * セッションを破棄 (ログアウト)
   */
  async revoke(): Promise<void> {
    if (!this.session) return;

    await axios
      .post(
        `${this.config.loginUrl}/services/oauth2/revoke`,
        new URLSearchParams({ token: this.session.accessToken }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      )
      .catch(() => {}); // ベストエフォート

    this.session = null;
  }
}

// ── ファクトリ関数 (環境変数から自動構築) ────────────────────────────────────

export function createAuthFromEnv(): SalesforceAuth {
  const config: SalesforceAuthConfig = {
    loginUrl: process.env.SF_LOGIN_URL ?? "https://login.salesforce.com",
    apiVersion: process.env.SF_API_VERSION ?? "v59.0",
    // JWT
    jwtClientId: process.env.SF_CLIENT_ID,
    jwtUsername: process.env.SF_JWT_USERNAME,
    jwtPrivateKeyPath: process.env.SF_JWT_PRIVATE_KEY_PATH,
    // Password fallback
    username: process.env.SF_USERNAME,
    password: process.env.SF_PASSWORD,
    securityToken: process.env.SF_SECURITY_TOKEN,
  };
  return new SalesforceAuth(config);
}
