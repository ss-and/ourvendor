"use client";

import { useState } from "react";
import {
  Zap, GitBranch, Settings2, Play, Pause,
  Plus, AlertTriangle, CheckCircle2, Clock,
  ChevronRight, ArrowRight, Loader2,
} from "lucide-react";
import Header from "@/components/layout/Header";

// ── 型 & モックデータ ─────────────────────────────────────

type AutoTab = "flows" | "workflows" | "process";
type AutoStatus = "active" | "inactive" | "error";

type Flow = {
  id: string;
  name: string;
  trigger: string;
  object: string;
  lastModified: string;
  status: AutoStatus;
  runs: number;
};

const FLOWS: Flow[] = [
  { id: "f1", name: "商談クローズ通知フロー",   trigger: "レコード変更",    object: "Opportunity", lastModified: "2026/02/21", status: "active",   runs: 342 },
  { id: "f2", name: "新規リード自動割り当て",    trigger: "レコード作成",    object: "Lead",        lastModified: "2026/02/10", status: "active",   runs: 128 },
  { id: "f3", name: "メール送信：フォロー依頼",  trigger: "スケジュール",    object: "Contact",     lastModified: "2026/01/25", status: "active",   runs: 56  },
  { id: "f4", name: "ケース優先度エスカレーション", trigger: "レコード変更", object: "Case",        lastModified: "2026/01/15", status: "error",    runs: 0   },
  { id: "f5", name: "旧フロー：商談リマインダー",  trigger: "スケジュール",  object: "Opportunity", lastModified: "2025/11/01", status: "inactive", runs: 0   },
];

const WORKFLOWS = [
  { id: "w1", name: "商談金額変更アラート",     object: "Opportunity", action: "メール通知",         status: "active"   as AutoStatus, modified: "2026/01/10" },
  { id: "w2", name: "取引先ステータス更新",     object: "Account",     action: "項目更新",           status: "active"   as AutoStatus, modified: "2025/12/20" },
  { id: "w3", name: "リード未対応リマインダー", object: "Lead",        action: "タスク作成",         status: "inactive" as AutoStatus, modified: "2025/10/05" },
];

const PROCESS_BUILDER = [
  { id: "pb1", name: "商談フェーズ移行プロセス", object: "Opportunity", steps: 4, status: "active"   as AutoStatus, modified: "2025/09/10" },
  { id: "pb2", name: "取引先分類プロセス",       object: "Account",     steps: 2, status: "inactive" as AutoStatus, modified: "2025/06/01" },
];

// ── サブコンポーネント ────────────────────────────────────

const StatusBadge = ({ status }: { status: AutoStatus }) => {
  const map = {
    active:   { cls: "bg-emerald-100 text-emerald-700", label: "有効",   icon: <CheckCircle2 size={10} /> },
    inactive: { cls: "bg-neutral-100 text-neutral-500", label: "無効",   icon: <Pause size={10} /> },
    error:    { cls: "bg-red-100 text-red-600",          label: "エラー", icon: <AlertTriangle size={10} /> },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${map.cls}`}>
      {map.icon}{map.label}
    </span>
  );
};

function FlowsTab() {
  const [flows, setFlows] = useState<Flow[]>(FLOWS);
  const [toggling, setToggling] = useState<string | null>(null);

  const toggle = async (id: string) => {
    setToggling(id);
    await new Promise((r) => setTimeout(r, 700));
    setFlows((prev) => prev.map((f) =>
      f.id !== id ? f : { ...f, status: f.status === "active" ? "inactive" : "active" }
    ));
    setToggling(null);
  };

  const statusCount = (s: AutoStatus) => flows.filter((f) => f.status === s).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "有効",   value: statusCount("active"),   color: "text-emerald-600" },
          { label: "無効",   value: statusCount("inactive"), color: "text-neutral-500" },
          { label: "エラー", value: statusCount("error"),    color: "text-red-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <p className="text-xs text-neutral-500">フロー一覧（{flows.length} 件）</p>
        <button className="btn-primary">
          <Plus size={14} />
          新規フロー
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="divide-y divide-neutral-100">
          {flows.map((flow) => (
            <div key={flow.id} className="flex items-center gap-3 px-5 py-3.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-neutral-800">{flow.name}</p>
                  <StatusBadge status={flow.status} />
                  {flow.status === "error" && (
                    <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                      要確認
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                  <span>{flow.trigger}</span>
                  <span className="text-neutral-200">·</span>
                  <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">{flow.object}</span>
                  <span className="text-neutral-200">·</span>
                  <span className="flex items-center gap-1"><Clock size={10} />{flow.lastModified}</span>
                  {flow.status === "active" && <span>{flow.runs.toLocaleString()} 回実行</span>}
                </div>
              </div>
              <button
                onClick={() => toggle(flow.id)}
                disabled={toggling === flow.id || flow.status === "error"}
                className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ${
                  flow.status === "active"
                    ? "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    : flow.status === "error"
                    ? "bg-red-100 text-red-500 cursor-not-allowed"
                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                }`}
              >
                {toggling === flow.id
                  ? <Loader2 size={11} className="animate-spin" />
                  : flow.status === "active" ? <Pause size={11} /> : <Play size={11} />}
                {flow.status === "active" ? "無効化" : flow.status === "error" ? "エラー" : "有効化"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700">
        <Zap size={13} className="flex-shrink-0 mt-0.5" />
        新しいフローは「チャット自動化」から自然言語で作成できます。
        <a href="/chat" className="font-bold underline hover:no-underline ml-1">試してみる →</a>
      </div>
    </div>
  );
}

function WorkflowsTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
        <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
        ワークフロールールは廃止予定です。新規作成はフローを使用してください。
      </div>
      <div className="card overflow-hidden divide-y divide-neutral-100">
        {WORKFLOWS.map((wf) => (
          <div key={wf.id} className="flex items-center gap-3 px-5 py-3.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <GitBranch size={15} className="text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold text-neutral-800">{wf.name}</p>
                <StatusBadge status={wf.status} />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">{wf.object}</span>
                <ArrowRight size={10} />
                <span>{wf.action}</span>
                <span className="text-neutral-200">·</span>
                <span>{wf.modified}</span>
              </div>
            </div>
            <button className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-0.5 flex-shrink-0">
              編集 <ChevronRight size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProcessBuilderTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
        <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
        プロセスビルダーは廃止予定です。フローへの移行をお勧めします。
      </div>
      <div className="card overflow-hidden divide-y divide-neutral-100">
        {PROCESS_BUILDER.map((pb) => (
          <div key={pb.id} className="flex items-center gap-3 px-5 py-3.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
              <Settings2 size={15} className="text-neutral-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold text-neutral-800">{pb.name}</p>
                <StatusBadge status={pb.status} />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">{pb.object}</span>
                <span>·</span>
                <span>{pb.steps} ステップ</span>
                <span>·</span>
                <span>{pb.modified}</span>
              </div>
            </div>
            <button className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-0.5 flex-shrink-0">
              フローに移行 <ChevronRight size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── メインページ ─────────────────────────────────────────

export default function AutomationsPage() {
  const [activeTab, setActiveTab] = useState<AutoTab>("flows");

  const TABS: { id: AutoTab; icon: React.ElementType; label: string; count: number }[] = [
    { id: "flows",    icon: Zap,        label: "フロー",             count: FLOWS.length },
    { id: "workflows",icon: GitBranch,  label: "ワークフロー",        count: WORKFLOWS.length },
    { id: "process",  icon: Settings2,  label: "プロセスビルダー",    count: PROCESS_BUILDER.length },
  ];

  const ActiveView = { flows: FlowsTab, workflows: WorkflowsTab, process: ProcessBuilderTab }[activeTab];

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="自動化ルール"
        breadcrumb={["Salesforce Automation", "自動化ルール"]}
      />

      <div className="flex-1 p-6 space-y-5 max-w-4xl mx-auto w-full">
        <div className="flex gap-1 bg-neutral-100 rounded-xl p-1">
          {TABS.map(({ id, icon: Icon, label, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === id
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              <Icon size={13} />
              <span className="hidden sm:inline">{label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === id ? "bg-neutral-100 text-neutral-700" : "bg-neutral-200 text-neutral-500"
              }`}>{count}</span>
            </button>
          ))}
        </div>
        <ActiveView />
      </div>
    </div>
  );
}
