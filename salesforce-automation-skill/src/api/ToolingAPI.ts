/**
 * ToolingAPI — Salesforce Tooling API クライアント
 *
 * 用途:
 *   - Apexクラス・トリガーの取得・実行
 *   - フロー定義の読み取り・有効化
 *   - デバッグログの取得
 *   - Apex匿名実行 (executeAnonymous) ← 設定変更の緊急対応に便利
 *
 * エンドポイント: /services/data/{version}/tooling/
 * ドキュメント: https://developer.salesforce.com/docs/atlas.en-us.api_tooling.meta/api_tooling/
 */

import axios, { AxiosInstance } from "axios";
import type { SalesforceAuth } from "../auth/SalesforceAuth.js";

export interface ApexExecutionResult {
  success: boolean;
  compiled: boolean;
  compileProblem: string | null;
  exceptionMessage: string | null;
  exceptionStackTrace: string | null;
  line: number;
  column: number;
  logs: string;
}

export interface FlowDefinition {
  id: string;
  fullName: string;
  label: string;
  status: "Active" | "Draft" | "Obsolete" | "InvalidDraft";
  processType: string;
  description?: string;
}

export interface ApexClass {
  id: string;
  name: string;
  body: string;
  status: "Active" | "Deleted";
  isValid: boolean;
}

export class ToolingAPI {
  private auth: SalesforceAuth;
  private apiVersion: string;

  constructor(auth: SalesforceAuth, apiVersion = "v59.0") {
    this.auth = auth;
    this.apiVersion = apiVersion;
  }

  private async getClient(): Promise<AxiosInstance> {
    const session = await this.auth.getSession();
    return axios.create({
      baseURL: `${session.instanceUrl}/services/data/${this.apiVersion}/tooling`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  // ── Apex 匿名実行 ────────────────────────────────────────────────────────

  /**
   * Apex コードを匿名で実行する
   *
   * 用途例:
   *   - 既存レコードへの項目値一括更新
   *   - カスタム設定の変更
   *   - テストデータ作成
   *
   * エンドポイント: GET /services/data/v59.0/tooling/executeAnonymous
   *
   * @example
   * await tooling.executeAnonymous(`
   *   List<Account> accounts = [SELECT Id FROM Account WHERE Type = null LIMIT 1000];
   *   for (Account a : accounts) { a.Type = 'Customer'; }
   *   update accounts;
   * `);
   */
  async executeAnonymous(apexCode: string): Promise<ApexExecutionResult> {
    const client = await this.getClient();

    try {
      const response = await client.get("/executeAnonymous", {
        params: { anonymousBody: apexCode },
      });

      const data = response.data;

      return {
        success: data.success === true,
        compiled: data.compiled === true,
        compileProblem: data.compileProblem ?? null,
        exceptionMessage: data.exceptionMessage ?? null,
        exceptionStackTrace: data.exceptionStackTrace ?? null,
        line: data.line ?? -1,
        column: data.column ?? -1,
        logs: "", // デバッグログは別途 getDebugLogs() で取得
      };
    } catch (err: unknown) {
      throw new Error(`Apex実行エラー: ${this.getErrorMessage(err)}`);
    }
  }

  // ── フロー ──────────────────────────────────────────────────────────────

  /**
   * Org 内のフロー定義一覧を取得
   */
  async listFlows(filter?: { processType?: string; status?: string }): Promise<FlowDefinition[]> {
    const client = await this.getClient();

    let query = "SELECT Id, FullName, MasterLabel, Status, ProcessType, Description FROM Flow";
    const conditions: string[] = [];
    if (filter?.processType) conditions.push(`ProcessType = '${filter.processType}'`);
    if (filter?.status) conditions.push(`Status = '${filter.status}'`);
    if (conditions.length > 0) query += ` WHERE ${conditions.join(" AND ")}`;
    query += " ORDER BY MasterLabel";

    try {
      const response = await client.get("/query", { params: { q: query } });
      return (response.data.records ?? []).map((r: Record<string, string>) => ({
        id: r.Id,
        fullName: r.FullName,
        label: r.MasterLabel,
        status: r.Status,
        processType: r.ProcessType,
        description: r.Description,
      }));
    } catch (err: unknown) {
      throw new Error(`フロー一覧取得エラー: ${this.getErrorMessage(err)}`);
    }
  }

  /**
   * フローを有効化 / 非活性化
   */
  async setFlowStatus(flowId: string, active: boolean): Promise<void> {
    const client = await this.getClient();

    try {
      await client.patch(`/sobjects/Flow/${flowId}`, {
        Status: active ? "Active" : "Draft",
      });
    } catch (err: unknown) {
      throw new Error(`フロー状態変更エラー: ${this.getErrorMessage(err)}`);
    }
  }

  // ── Apex クラス ─────────────────────────────────────────────────────────

  /**
   * Apex クラスの一覧を取得
   */
  async listApexClasses(): Promise<ApexClass[]> {
    const client = await this.getClient();

    const query = "SELECT Id, Name, Body, Status, IsValid FROM ApexClass ORDER BY Name";

    try {
      const response = await client.get("/query", { params: { q: query } });
      return (response.data.records ?? []).map((r: Record<string, unknown>) => ({
        id: r.Id as string,
        name: r.Name as string,
        body: r.Body as string,
        status: r.Status as "Active" | "Deleted",
        isValid: r.IsValid as boolean,
      }));
    } catch (err: unknown) {
      throw new Error(`Apexクラス一覧取得エラー: ${this.getErrorMessage(err)}`);
    }
  }

  /**
   * デバッグログの最新エントリを取得 (エラー調査用)
   */
  async getRecentLogs(limit = 10): Promise<Array<{ id: string; operation: string; status: string; logLength: number; startTime: string }>> {
    const client = await this.getClient();

    const query = `SELECT Id, Operation, Status, LogLength, StartTime FROM ApexLog ORDER BY StartTime DESC LIMIT ${limit}`;

    try {
      const response = await client.get("/query", { params: { q: query } });
      return (response.data.records ?? []).map((r: Record<string, unknown>) => ({
        id: r.Id as string,
        operation: r.Operation as string,
        status: r.Status as string,
        logLength: r.LogLength as number,
        startTime: r.StartTime as string,
      }));
    } catch (err: unknown) {
      throw new Error(`ログ取得エラー: ${this.getErrorMessage(err)}`);
    }
  }

  /**
   * 特定ログの本文を取得
   */
  async getLogBody(logId: string): Promise<string> {
    const client = await this.getClient();
    const session = await this.auth.getSession();

    try {
      // ログ本文は別エンドポイント
      const response = await axios.get(
        `${session.instanceUrl}/services/data/${this.apiVersion}/tooling/sobjects/ApexLog/${logId}/Body`,
        { headers: { Authorization: `Bearer ${session.accessToken}` } }
      );
      return response.data as string;
    } catch (err: unknown) {
      throw new Error(`ログ本文取得エラー: ${this.getErrorMessage(err)}`);
    }
  }

  // ── SOQL クエリ (Tooling) ───────────────────────────────────────────────

  /**
   * Tooling API 経由でSOQLクエリを実行
   */
  async query<T = Record<string, unknown>>(soql: string): Promise<T[]> {
    const client = await this.getClient();
    try {
      const response = await client.get("/query", { params: { q: soql } });
      return response.data.records as T[];
    } catch (err: unknown) {
      throw new Error(`Tooling クエリエラー: ${this.getErrorMessage(err)}`);
    }
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
