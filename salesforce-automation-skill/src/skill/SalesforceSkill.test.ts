/**
 * SalesforceSkill ユニットテスト
 *
 * 外部API (Salesforce / Claude) をモックして
 * ロジック・ルーティングを検証する
 */

import { SalesforceSkill } from "./SalesforceSkill.js";
import { SalesforceAuth } from "../auth/SalesforceAuth.js";
import { MetadataAPI } from "../api/MetadataAPI.js";
import { IntentParser } from "../nlp/IntentParser.js";
import type { ParsedIntent, SkillExecutionResult } from "../types/index.js";

// ── モック設定 ────────────────────────────────────────────────────────────────

jest.mock("../auth/SalesforceAuth.js");
jest.mock("../api/MetadataAPI.js");
jest.mock("../api/ToolingAPI.js");
jest.mock("../nlp/IntentParser.js");

const MockedAuth = SalesforceAuth as jest.MockedClass<typeof SalesforceAuth>;
const MockedMetaAPI = MetadataAPI as jest.MockedClass<typeof MetadataAPI>;
const MockedIntentParser = IntentParser as jest.MockedClass<typeof IntentParser>;

// ── テストヘルパー ────────────────────────────────────────────────────────────

function buildMockIntent(overrides: Partial<ParsedIntent> = {}): ParsedIntent {
  return {
    action: "ADD_FIELD",
    confidence: 0.95,
    parameters: {
      objectApiName: "Account",
      fieldApiName: "Customer_Score__c",
      label: "顧客スコア",
      fieldType: "Number",
      precision: 5,
      scale: 0,
    },
    rawInstruction: "AccountにCustomer_Score__c項目を追加",
    reasoning: "数値項目の追加として解釈",
    ...overrides,
  };
}

// ── テストスイート ────────────────────────────────────────────────────────────

describe("SalesforceSkill", () => {
  let skill: SalesforceSkill;
  let mockAuth: jest.Mocked<SalesforceAuth>;
  let mockMetaAPI: jest.Mocked<MetadataAPI>;
  let mockParser: jest.Mocked<IntentParser>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Auth モック
    mockAuth = new MockedAuth({} as never) as jest.Mocked<SalesforceAuth>;
    mockAuth.getSession.mockResolvedValue({
      accessToken: "mock-token",
      instanceUrl: "https://test.salesforce.com",
      orgId: "00D000000000001",
      expiresAt: new Date(Date.now() + 3600000),
    });

    // MetadataAPI モック
    mockMetaAPI = new MockedMetaAPI(mockAuth) as jest.Mocked<MetadataAPI>;
    mockMetaAPI.createCustomField.mockResolvedValue({
      success: true,
      id: "mock-deploy-id",
      status: "Succeeded",
      numberComponentsDeployed: 1,
      numberComponentErrors: 0,
    });

    // IntentParser モック
    mockParser = new MockedIntentParser() as jest.Mocked<IntentParser>;

    // インスタンス生成 (dryRun: false)
    skill = new SalesforceSkill({ auth: mockAuth, dryRun: false });

    // プライベートフィールドを差し替え (テスト用)
    (skill as unknown as { metaApi: MetadataAPI; intentParser: IntentParser }).metaApi = mockMetaAPI;
    (skill as unknown as { metaApi: MetadataAPI; intentParser: IntentParser }).intentParser = mockParser;
  });

  // ── 正常系 ──────────────────────────────────────────────────────────────

  describe("execute()", () => {
    it("ADD_FIELD: カスタム項目を正常に作成できる", async () => {
      mockParser.parse.mockResolvedValue(buildMockIntent());

      const result = await skill.execute("AccountにCustomer_Score__c項目を追加");

      expect(result.success).toBe(true);
      expect(result.action).toBe("ADD_FIELD");
      expect(mockMetaAPI.createCustomField).toHaveBeenCalledTimes(1);
      expect(mockMetaAPI.createCustomField).toHaveBeenCalledWith(
        expect.objectContaining({
          objectApiName: "Account",
          fieldApiName: "Customer_Score__c",
          type: "Number",
        })
      );
    });

    it("DESCRIBE_OBJECT: オブジェクト情報を取得できる", async () => {
      mockParser.parse.mockResolvedValue(
        buildMockIntent({
          action: "DESCRIBE_OBJECT",
          parameters: { objectApiName: "Account" },
        })
      );
      mockMetaAPI.describeObject.mockResolvedValue({
        name: "Account",
        label: "取引先",
        fields: [{ name: "Id", label: "ID", type: "id" }],
      });

      const result = await skill.execute("Accountの項目一覧を見せて");

      expect(result.success).toBe(true);
      expect(result.action).toBe("DESCRIBE_OBJECT");
      expect(result.details).toHaveProperty("name", "Account");
    });

    it("UNKNOWN: 解釈できない指示は失敗として返す", async () => {
      mockParser.parse.mockResolvedValue(
        buildMockIntent({
          action: "UNKNOWN",
          confidence: 0.2,
          parameters: { clarification: "もう少し具体的に教えてください" },
        })
      );

      const result = await skill.execute("なんか変な感じにして");

      expect(result.success).toBe(false);
      expect(result.action).toBe("UNKNOWN");
    });
  });

  // ── 信頼度チェック ──────────────────────────────────────────────────────

  describe("confidence threshold", () => {
    it("信頼度が閾値未満の場合、confirmHandler が呼ばれる", async () => {
      const confirmMock = jest.fn().mockResolvedValue(false);
      skill = new SalesforceSkill({
        auth: mockAuth,
        confidenceThreshold: 0.8,
        onConfirmRequired: confirmMock,
      });
      (skill as unknown as { intentParser: IntentParser }).intentParser = mockParser;

      mockParser.parse.mockResolvedValue(buildMockIntent({ confidence: 0.6 }));

      const result = await skill.execute("ちょっと変えて");

      expect(confirmMock).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(false);
    });

    it("confirmHandler が true を返した場合は実行される", async () => {
      const confirmMock = jest.fn().mockResolvedValue(true);
      skill = new SalesforceSkill({
        auth: mockAuth,
        confidenceThreshold: 0.8,
        onConfirmRequired: confirmMock,
        dryRun: false,
      });
      (skill as unknown as { metaApi: MetadataAPI; intentParser: IntentParser }).metaApi = mockMetaAPI;
      (skill as unknown as { metaApi: MetadataAPI; intentParser: IntentParser }).intentParser = mockParser;

      mockParser.parse.mockResolvedValue(buildMockIntent({ confidence: 0.6 }));

      const result = await skill.execute("ちょっと変えて");

      expect(confirmMock).toHaveBeenCalledTimes(1);
      expect(mockMetaAPI.createCustomField).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
    });
  });

  // ── DRY RUN ────────────────────────────────────────────────────────────

  describe("dryRun mode", () => {
    it("DRY RUN では MetadataAPI が呼ばれない", async () => {
      skill = new SalesforceSkill({ auth: mockAuth, dryRun: true });
      (skill as unknown as { intentParser: IntentParser }).intentParser = mockParser;

      mockParser.parse.mockResolvedValue(buildMockIntent());

      const result = await skill.execute("AccountにCustomer_Score__c項目を追加");

      expect(result.dryRun).toBe(true);
      expect(result.message).toContain("[DRY RUN]");
      expect(mockMetaAPI.createCustomField).not.toHaveBeenCalled();
    });
  });

  // ── 監査ログ ───────────────────────────────────────────────────────────

  describe("execution logs", () => {
    it("実行後にログが記録される", async () => {
      mockParser.parse.mockResolvedValue(buildMockIntent());
      await skill.execute("AccountにCustomer_Score__c項目を追加");

      const logs = skill.getExecutionLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].instruction).toBe("AccountにCustomer_Score__c項目を追加");
      expect(logs[0].intent.action).toBe("ADD_FIELD");
    });
  });

  // ── 接続テスト ─────────────────────────────────────────────────────────

  describe("testConnection()", () => {
    it("接続情報を正常に返す", async () => {
      const conn = await skill.testConnection();
      expect(conn.success).toBe(true);
      expect(conn.orgId).toBe("00D000000000001");
      expect(conn.instanceUrl).toBe("https://test.salesforce.com");
    });
  });
});
