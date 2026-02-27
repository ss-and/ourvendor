"use client";

import { useState } from "react";
import {
  Shield, Users, Lock, Check, X, Search,
  Plus, ChevronRight, AlertTriangle, Eye, Loader2, CheckCircle2,
} from "lucide-react";
import Header from "@/components/layout/Header";

// ── 型 ──────────────────────────────────────────────────

type PSItem = { id: string; name: string; assigned: number; description: string; modified: string };

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

// ── 権限セット作成モーダル ────────────────────────────────

function NewPermSetModal({ onClose, onCreated }: { onClose: () => void; onCreated: (ps: PSItem) => void }) {
  const [name, setName]         = useState("");
  const [desc, setDesc]         = useState("");
  const [apiAccess, setApiAccess] = useState(false);
  const [creating, setCreating] = useState(false);
  const [done, setDone]         = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    await new Promise((r) => setTimeout(r, 1000));
    onCreated({ id: `ps${Date.now()}`, name: name.trim(), assigned: 0, description: desc.trim() || "（説明なし）", modified: "2026/02/27" });
    setCreating(false);
    setDone(true);
    setTimeout(onClose, 1100);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget && !creating) onClose(); }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-modal mx-4 animate-slide-up overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Lock size={15} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-neutral-900 text-sm">権限セットを作成</h2>
              <p className="text-[11px] text-neutral-400">新しい権限セットを Salesforce に追加</p>
            </div>
          </div>
          {!creating && <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 transition-colors"><X size={16} /></button>}
        </div>

        {done ? (
          <div className="flex flex-col items-center py-10 gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <p className="text-sm font-bold text-neutral-800">権限セットを作成しました</p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">権限セット名 <span className="text-red-400">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例: 営業部マネージャー権限" className="input" disabled={creating} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">説明</label>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="この権限セットの目的・付与する権限を記載" className="input resize-none h-16 text-sm" disabled={creating} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={apiAccess} onChange={(e) => setApiAccess(e.target.checked)} disabled={creating} className="w-4 h-4 rounded border-neutral-300 text-primary-500" />
              <span className="text-xs font-semibold text-neutral-600">API アクセスを許可</span>
            </label>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={onClose} disabled={creating} className="btn-ghost text-sm">キャンセル</button>
              <button onClick={handleCreate} disabled={!name.trim() || creating} className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {creating ? <><Loader2 size={13} className="animate-spin" />作成中...</> : <><Plus size={13} />権限セットを作成</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 権限セット編集モーダル ────────────────────────────────

function EditPermSetModal({ item, onClose }: { item: PSItem; onClose: () => void }) {
  const [name, setName]   = useState(item.name);
  const [desc, setDesc]   = useState(item.description);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    setSaved(true);
    setTimeout(onClose, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget && !saving) onClose(); }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-modal mx-4 animate-slide-up overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Lock size={15} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-neutral-900 text-sm">権限セットを編集</h2>
              <p className="text-[11px] text-neutral-400">{item.name}</p>
            </div>
          </div>
          {!saving && <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 transition-colors"><X size={16} /></button>}
        </div>
        {saved ? (
          <div className="flex flex-col items-center py-10 gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <p className="text-sm font-bold text-neutral-800">保存しました</p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">権限セット名</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" disabled={saving} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">説明</label>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="input resize-none h-16 text-sm" disabled={saving} />
            </div>
            <div className="text-xs text-neutral-500 bg-neutral-50 rounded-lg p-3">
              割り当て済みユーザー: <span className="font-bold text-neutral-700">{item.assigned} 名</span>
              <span className="ml-3">最終更新: {item.modified}</span>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={onClose} disabled={saving} className="btn-ghost text-sm">キャンセル</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm disabled:opacity-50">
                {saving ? <><Loader2 size={13} className="animate-spin" />保存中...</> : <><CheckCircle2 size={13} />保存</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PermSetsTab ──────────────────────────────────────────

function PermSetsTab() {
  const [permSets, setPermSets]     = useState(PERMISSION_SETS);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<PSItem | null>(null);

  return (
    <>
      <div className="space-y-3">
        <div className="flex justify-end">
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus size={14} />
            権限セットを作成
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {permSets.map((ps) => (
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
              <button
                onClick={() => setEditTarget(ps)}
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-semibold flex-shrink-0 mt-1"
              >
                編集 <ChevronRight size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {showCreate && (
        <NewPermSetModal
          onClose={() => setShowCreate(false)}
          onCreated={(ps) => setPermSets((prev) => [ps, ...prev])}
        />
      )}
      {editTarget && <EditPermSetModal item={editTarget} onClose={() => setEditTarget(null)} />}
    </>
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
