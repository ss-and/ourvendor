"use client";

import { useState } from "react";
import {
  LayoutDashboard, Layers, Zap, Users, AlertTriangle,
  CheckCircle2, Clock, TrendingUp, ArrowUpRight, ArrowDownRight,
  RefreshCw, Database, Shield,
} from "lucide-react";
import Header from "@/components/layout/Header";

// ── モックデータ ──────────────────────────────────────────

const HEALTH_METRICS = [
  { label: "カスタムオブジェクト",  value: 42,   limit: 200, unit: "個", icon: Layers,   color: "bg-blue-500",    pct: 21 },
  { label: "アクティブフロー",       value: 18,   limit: 50,  unit: "本", icon: Zap,      color: "bg-violet-500",  pct: 36 },
  { label: "カスタム項目 (合計)",    value: 284,  limit: 800, unit: "項目", icon: Database, color: "bg-amber-500",  pct: 36 },
  { label: "権限セット",            value: 12,   limit: 1000, unit: "個", icon: Shield,   color: "bg-emerald-500", pct: 1 },
];

const RECENT_CHANGES = [
  { id: 1, type: "フロー作成",   name: "商談クローズ通知フロー",    user: "田中 太郎", time: "10分前",   status: "success" },
  { id: 2, type: "項目追加",     name: "Opportunity.競合社名__c",  user: "山田 花子", time: "1時間前",  status: "success" },
  { id: 3, type: "承認プロセス", name: "割引率承認プロセス v2",     user: "田中 太郎", time: "3時間前",  status: "success" },
  { id: 4, type: "入力規則",     name: "メールアドレス形式チェック", user: "鈴木 一郎", time: "昨日",     status: "success" },
  { id: 5, type: "項目削除",     name: "Contact.Obsolete__c",      user: "田中 太郎", time: "2日前",    status: "warning" },
];

const STATS = [
  { label: "総ユーザー数",  value: "124",  change: "+3",  up: true,  icon: Users,          color: "bg-blue-100",    iconColor: "text-blue-600" },
  { label: "今月の変更件数", value: "38",   change: "+12", up: true,  icon: RefreshCw,       color: "bg-violet-100",  iconColor: "text-violet-600" },
  { label: "アクティブフロー", value: "18", change: "+2",  up: true,  icon: Zap,             color: "bg-amber-100",   iconColor: "text-amber-600" },
  { label: "エラー件数",    value: "2",    change: "-5",  up: false, icon: AlertTriangle,   color: "bg-red-100",     iconColor: "text-red-500" },
];

const ORG_HEALTH_SCORE = 87; // 0–100

// ── コンポーネント ────────────────────────────────────────

export default function DashboardPage() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  };

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="舵手ボード"
        breadcrumb={["Salesforce Automation", "舵手ボード"]}
        actions={
          <button onClick={handleRefresh} className="btn-ghost text-sm" disabled={refreshing}>
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            更新
          </button>
        }
      />

      <div className="flex-1 p-6 space-y-6 max-w-4xl mx-auto w-full">

        {/* ━━━ サマリー統計 ━━━ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATS.map(({ label, value, change, up, icon: Icon, color, iconColor }) => (
            <div key={label} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`}>
                  <Icon size={16} className={iconColor} />
                </div>
                <span className={`flex items-center gap-0.5 text-[11px] font-bold ${up ? "text-emerald-600" : "text-red-500"}`}>
                  {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {change}
                </span>
              </div>
              <p className="text-2xl font-bold text-neutral-900 leading-none">{value}</p>
              <p className="text-[11px] text-neutral-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* ━━━ 組織ヘルスリング ━━━ */}
          <div className="card p-5 flex flex-col items-center justify-center gap-3">
            <p className="text-xs font-bold text-neutral-600 self-start">組織ヘルススコア</p>
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="48" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                <circle
                  cx="60" cy="60" r="48" fill="none"
                  stroke={ORG_HEALTH_SCORE >= 80 ? "#22c55e" : ORG_HEALTH_SCORE >= 60 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(ORG_HEALTH_SCORE / 100) * 301.6} 301.6`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-neutral-900">{ORG_HEALTH_SCORE}</span>
                <span className="text-[10px] text-neutral-400">/ 100</span>
              </div>
            </div>
            <div className="w-full space-y-1.5">
              {[
                { label: "API 制限",    pct: 12, color: "bg-emerald-400" },
                { label: "ストレージ",  pct: 34, color: "bg-blue-400" },
                { label: "日次処理量",  pct: 55, color: "bg-amber-400" },
              ].map(({ label, pct, color }) => (
                <div key={label}>
                  <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-0.5">
                    <span>{label}</span><span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ━━━ ガバナ制限メーター ━━━ */}
          <div className="sm:col-span-2 card p-5 space-y-4">
            <p className="text-xs font-bold text-neutral-600">ガバナ制限 / 使用状況</p>
            {HEALTH_METRICS.map(({ label, value, limit, unit, icon: Icon, color, pct }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-5 h-5 rounded ${color} flex items-center justify-center`}>
                      <Icon size={11} className="text-white" />
                    </div>
                    <span className="text-xs font-medium text-neutral-700">{label}</span>
                  </div>
                  <span className="text-xs text-neutral-500">
                    <span className="font-bold text-neutral-800">{value.toLocaleString()}</span>
                    {" / "}{limit.toLocaleString()} {unit}
                  </span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color} ${pct >= 80 ? "" : "opacity-75"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ━━━ 最近の変更 ━━━ */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-neutral-400" />
              <h2 className="font-bold text-neutral-800 text-sm">最近の変更</h2>
            </div>
            <span className="text-[11px] text-neutral-400">{RECENT_CHANGES.length} 件</span>
          </div>
          <div className="divide-y divide-neutral-100">
            {RECENT_CHANGES.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.status === "success" ? "bg-emerald-400" : "bg-amber-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                      {item.type}
                    </span>
                    <span className="text-xs font-semibold text-neutral-800 truncate">{item.name}</span>
                  </div>
                </div>
                <span className="text-[11px] text-neutral-400 flex-shrink-0">{item.user}</span>
                <span className="text-[11px] text-neutral-300 flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ━━━ クイックアクション ━━━ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/objects",     icon: Layers,          label: "オブジェクト管理",  color: "bg-blue-100 text-blue-600" },
            { href: "/permissions", icon: Shield,          label: "権限管理",           color: "bg-violet-100 text-violet-600" },
            { href: "/automations", icon: Zap,             label: "自動化ルール",        color: "bg-amber-100 text-amber-600" },
            { href: "/chat",        icon: TrendingUp,      label: "チャットで設定",      color: "bg-primary-100 text-primary-600" },
          ].map(({ href, icon: Icon, label, color }) => (
            <a
              key={href}
              href={href}
              className="card p-4 flex flex-col items-center gap-2 text-center hover:border-primary-300 hover:shadow-sm transition-all"
            >
              <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`}>
                <Icon size={17} />
              </div>
              <span className="text-xs font-semibold text-neutral-700">{label}</span>
            </a>
          ))}
        </div>

      </div>
    </div>
  );
}
