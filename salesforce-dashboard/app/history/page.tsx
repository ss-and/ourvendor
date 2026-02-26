import Header from "@/components/layout/Header";
import RecentActionsTable from "@/components/dashboard/RecentActionsTable";
import { executionHistory } from "@/lib/mockData";
import { History, Download, Filter } from "lucide-react";

export default function HistoryPage() {
  const success = executionHistory.filter((r) => r.status === "success").length;
  const failed  = executionHistory.filter((r) => r.status === "failed").length;
  const dryRun  = executionHistory.filter((r) => r.status === "dry_run").length;

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="実行履歴"
        breadcrumb={["Salesforce Automation", "実行履歴"]}
        actions={
          <button className="btn-ghost text-sm">
            <Download size={15} />
            エクスポート
          </button>
        }
      />

      <div className="p-6 space-y-5">
        {/* サマリーバッジ */}
        <div className="flex flex-wrap gap-3">
          <div className="card px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
              <History size={16} className="text-neutral-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">総実行数</p>
              <p className="text-lg font-bold text-neutral-900">{executionHistory.length}</p>
            </div>
          </div>
          <div className="card px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-600 text-xs font-bold">✓</span>
            </div>
            <div>
              <p className="text-xs text-neutral-500">成功</p>
              <p className="text-lg font-bold text-emerald-600">{success}</p>
            </div>
          </div>
          <div className="card px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <span className="text-red-500 text-xs font-bold">✗</span>
            </div>
            <div>
              <p className="text-xs text-neutral-500">失敗</p>
              <p className="text-lg font-bold text-red-500">{failed}</p>
            </div>
          </div>
          <div className="card px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
              <span className="text-neutral-500 text-xs font-bold">D</span>
            </div>
            <div>
              <p className="text-xs text-neutral-500">DRY RUN</p>
              <p className="text-lg font-bold text-neutral-600">{dryRun}</p>
            </div>
          </div>
        </div>

        {/* テーブル */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h2 className="font-bold text-neutral-900">全実行ログ</h2>
            <button className="btn-ghost text-xs">
              <Filter size={13} />
              フィルター
            </button>
          </div>
          <RecentActionsTable records={executionHistory} />
        </div>
      </div>
    </div>
  );
}
