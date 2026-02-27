"use client";

import { useState } from "react";
import {
  Shield, Users, Lock, Check, X, Search,
  Plus, ChevronRight, AlertTriangle, Eye,
} from "lucide-react";
import Header from "@/components/layout/Header";

// ── 型 & モックデータ ─────────────────────────────────────

type PermTab = "profiles" | "permsets" | "fls";

const PROFILES = [
  { id: "p1", name: "システム管理者",        users: 5,  customObjects: "全アクセス", api: true,  modifyAll: true  },
  { id: "p2", name: "標準ユーザー",          users: 98, customObjects: "読み取り/編集", api: false, modifyAll: false },
  { id: "p3", name: "読み取り専用",          users: 18, customObjects: "読み取り",   api: false, modifyAll: false },
  { id: "p4", name: "パートナーコミュニティ", users: 3,  customObjects: "制限あり",   api: false, modifyAll: false },
];

const PERMISSION_SETS = [
  { id: "ps1", name: "営業部マネージャー権限", assigned: 12, description: "商談削除・全レポート閲覧を許可",         modified: "2026/02/15" },
  { id: "ps2", name: "データ移行用権限",       assigned: 2,  description: "一括インポート・API 書き込みを許可",     modified: "2026/01/20" },
  { id: "ps3", name: "パートナーポータル拡張", assigned: 3,  description: "パートナーが取引先情報を限定編集可能",    modified: "2025/12/10" },
  { id: "ps4", name: "レポート管理者",         assigned: 8,  description: "全ダッシュボード・スケジュールレポート", modified: "2025/11/05" },
];

const FLS_FIELDS = [
  { object: "Opportunity", field: "Amount",            apiName: "Amount",         admin: { read: true, edit: true }, standard: { read: true, edit: true }, readOnly: { read: true, edit: false }, partner: { read: false, edit: false } },
  { object: "Opportunity", field: "競合社名",           apiName: "Competitor__c",  admin: { read: true, edit: true }, standard: { read: true, edit: true }, readOnly: { read: true, edit: false }, partner: { read: false, edit: false } },
  { object: "Opportunity", field: "商談確度コメント",    apiName: "ProbabilityNote__c", admin: { read: true, edit: true }, standard: { read: true, edit: false }, readOnly: { read: false, edit: false }, partner: { read: false, edit: false } },
  { object: "Account",     field: "年間売上",           apiName: "AnnualRevenue",  admin: { read: true, edit: true }, standard: { read: true, edit: false }, readOnly: { read: true, edit: false }, partner: { read: false, edit: false } },
  { object: "Contact",     field: "メールアドレス",      apiName: "Email",          admin: { read: true, edit: true }, standard: { read: true, edit: true }, readOnly: { read: true, edit: false }, partner: { read: true, edit: false } },
];

const PROFILE_COLS = [
  { key: "admin",    label: "管理者" },
  { key: "standard", label: "標準" },
  { key: "readOnly", label: "読み取り" },
  { key: "partner",  label: "パートナー" },
] as const;

// ── コンポーネント ────────────────────────────────────────

function ProfilesTab() {
  return (
    <div className="space-y-3">
      <div className="card overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-neutral-100 bg-neutral-50 text-[11px] font-bold text-neutral-500 uppercase tracking-wide">
          <span>プロファイル名</span>
          <span className="text-right">ユーザー数</span>
          <span className="text-right">カスタムオブジェクト</span>
          <span className="text-center">API アクセス</span>
          <span className="text-center">全レコード変更</span>
        </div>
        <div className="divide-y divide-neutral-100">
          {PROFILES.map((p) => (
            <div key={p.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-neutral-50 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Users size={13} className="text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{p.name}</p>
                </div>
              </div>
              <span className="text-sm text-neutral-600 text-right font-medium">{p.users} 名</span>
              <span className="text-xs text-neutral-600 text-right">{p.customObjects}</span>
              <div className="flex justify-center">
                {p.api ? <Check size={14} className="text-emerald-500" /> : <X size={14} className="text-neutral-300" />}
              </div>
              <div className="flex justify-center">
                {p.modifyAll
                  ? <AlertTriangle size={14} className="text-amber-500" />
                  : <X size={14} className="text-neutral-300" />}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-start gap-2 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
        <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
        「全レコード変更」権限は最小権限の原則に従い、必要最小限のプロファイルのみ付与してください。
      </div>
    </div>
  );
}

function PermSetsTab() {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button className="btn-primary">
          <Plus size={14} />
          権限セットを作成
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {PERMISSION_SETS.map((ps) => (
          <div key={ps.id} className="card p-4 flex items-start gap-3 hover:border-primary-300 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lock size={16} className="text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-bold text-neutral-800">{ps.name}</p>
                <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded-full">
                  {ps.assigned} 名に割り当て
                </span>
              </div>
              <p className="text-xs text-neutral-500">{ps.description}</p>
              <p className="text-[11px] text-neutral-400 mt-1">最終更新: {ps.modified}</p>
            </div>
            <button className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-semibold flex-shrink-0 mt-1">
              編集 <ChevronRight size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FLSTab() {
  return (
    <div className="space-y-3">
      <p className="text-xs text-neutral-500">
        項目レベルセキュリティ (FLS) — 各プロファイルの読み取り/編集権限を確認できます。
      </p>
      <div className="card overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              <th className="px-4 py-3 text-left text-[11px] font-bold text-neutral-500 uppercase tracking-wide">オブジェクト / 項目</th>
              {PROFILE_COLS.map((col) => (
                <th key={col.key} className="px-3 py-3 text-center text-[11px] font-bold text-neutral-500 uppercase tracking-wide whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {FLS_FIELDS.map((row, i) => {
              const isNewObj = i === 0 || FLS_FIELDS[i - 1].object !== row.object;
              return (
                <tr key={`${row.object}-${row.apiName}`} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-2.5">
                    {isNewObj && (
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded mb-1 block w-fit">
                        {row.object}
                      </span>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Eye size={11} className="text-neutral-300" />
                      <span className="font-medium text-neutral-700">{row.field}</span>
                      <code className="text-[10px] text-neutral-400 font-mono">{row.apiName}</code>
                    </div>
                  </td>
                  {PROFILE_COLS.map((col) => {
                    const perms = row[col.key] as { read: boolean; edit: boolean };
                    return (
                      <td key={col.key} className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${perms.read ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-400"}`}>
                            読
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${perms.edit ? "bg-blue-100 text-blue-700" : "bg-neutral-100 text-neutral-400"}`}>
                            編
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PermissionsPage() {
  const [activeTab, setActiveTab] = useState<PermTab>("profiles");

  const TABS: { id: PermTab; icon: React.ElementType; label: string }[] = [
    { id: "profiles", icon: Users,  label: "プロファイル" },
    { id: "permsets", icon: Lock,   label: "権限セット" },
    { id: "fls",      icon: Shield, label: "FLS（項目レベル）" },
  ];

  const ActiveView = { profiles: ProfilesTab, permsets: PermSetsTab, fls: FLSTab }[activeTab];

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="権限管理"
        breadcrumb={["Salesforce Automation", "権限管理"]}
      />

      <div className="flex-1 p-6 space-y-5 max-w-4xl mx-auto w-full">
        {/* タブナビ */}
        <div className="flex gap-1 bg-neutral-100 rounded-xl p-1">
          {TABS.map(({ id, icon: Icon, label }) => (
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
            </button>
          ))}
        </div>
        <ActiveView />
      </div>
    </div>
  );
}
