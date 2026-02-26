/**
 * salesforce-automation-skill
 *
 * 自然言語 → Salesforce設定変更を実現するAIスキル
 *
 * 使い方 (プログラム):
 *   import { SalesforceSkill } from "salesforce-automation-skill";
 *   const skill = new SalesforceSkill({ dryRun: true });
 *   const result = await skill.execute("AccountにCustomer_Score__c項目を追加");
 *
 * 使い方 (CLI):
 *   npx ts-node src/index.ts "AccountにCustomer_Score__c項目を追加"
 */

import "dotenv/config";
import { SalesforceSkill } from "./skill/SalesforceSkill.js";

// Public API
export { SalesforceSkill } from "./skill/SalesforceSkill.js";
export { SalesforceAuth, createAuthFromEnv } from "./auth/SalesforceAuth.js";
export { MetadataAPI } from "./api/MetadataAPI.js";
export { ToolingAPI } from "./api/ToolingAPI.js";
export { IntentParser } from "./nlp/IntentParser.js";
export * from "./types/index.js";

// ── CLI エントリーポイント ────────────────────────────────────────────────────

async function main(): Promise<void> {
  const instruction = process.argv[2];

  if (!instruction) {
    printUsage();
    process.exit(1);
  }

  // 特殊コマンド
  if (instruction === "--test-connection") {
    await runConnectionTest();
    return;
  }

  await runInstruction(instruction);
}

async function runInstruction(instruction: string): Promise<void> {
  const dryRun = process.env.DRY_RUN === "true" || process.argv.includes("--dry-run");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(" Salesforce Automation Skill");
  if (dryRun) console.log(" ⚠️  DRY RUN モード (実際の変更は行いません)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log(`指示: ${instruction}\n`);

  const skill = new SalesforceSkill({
    dryRun,
    confidenceThreshold: 0.7,
    onConfirmRequired: async (intent) => {
      console.log(`\n⚠️  信頼度が低い操作です (${intent.confidence.toFixed(2)})`);
      console.log(`操作: ${intent.action}`);
      console.log(`根拠: ${intent.reasoning}`);
      console.log("--dry-run フラグで確認後に実行してください");
      return false;
    },
  });

  try {
    const result = await skill.execute(instruction);

    console.log("\n─────────────────────────────────────────────────────────────");
    console.log(`結果: ${result.success ? "✅ 成功" : "❌ 失敗"}`);
    console.log(`メッセージ: ${result.message}`);

    if (result.details) {
      console.log("\n詳細:");
      console.log(JSON.stringify(result.details, null, 2));
    }

    console.log("─────────────────────────────────────────────────────────────\n");

    process.exit(result.success ? 0 : 1);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n❌ エラー: ${message}\n`);
    process.exit(1);
  }
}

async function runConnectionTest(): Promise<void> {
  console.log("\nSalesforce 接続テスト...");
  const skill = new SalesforceSkill();
  try {
    const { orgId, instanceUrl } = await skill.testConnection();
    console.log(`✅ 接続成功`);
    console.log(`   Org ID: ${orgId}`);
    console.log(`   Instance: ${instanceUrl}\n`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`❌ 接続失敗: ${message}\n`);
    process.exit(1);
  }
}

function printUsage(): void {
  console.log(`
使い方:
  npx ts-node src/index.ts "<自然言語の指示>"
  npx ts-node src/index.ts --test-connection

オプション:
  --dry-run    変更内容を確認のみ (Salesforceへの書き込みなし)

例:
  npx ts-node src/index.ts "AccountオブジェクトにCustomer_Score__cという数値項目を追加"
  npx ts-node src/index.ts "Sales_Rep権限セットでLeadの作成・参照権限を付与"
  npx ts-node src/index.ts "商談のクローズ日が空ならエラーにする入力規則を作成"
  DRY_RUN=true npx ts-node src/index.ts "Contactのメール項目を必須にする"
`);
}

// CLI として実行された場合のみ main() を呼ぶ
if (process.argv[1]?.endsWith("index.ts") || process.argv[1]?.endsWith("index.js")) {
  main().catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Fatal: ${message}`);
    process.exit(1);
  });
}
