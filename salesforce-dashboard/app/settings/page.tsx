"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import {
  User, CreditCard, Zap, BarChart3, Crown,
  Download, Shield, Check, AlertCircle,
} from "lucide-react";

// ── 型 ──────────────────────────────────────────────────

type Tab = "account" | "plan" | "billing" | "ai";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "account", label: "アカウント",         icon: User      },
  { id: "plan",    label: "プラン & 利用状況",  icon: BarChart3 },
  { id: "billing", label: "お支払い",           icon: CreditCard },
  { id: "ai",      label: "AI 設定",            icon: Zap       },
];

// ── モックデータ ─────────────────────────────────────────

const USAGE_ITEMS = [
  { label: "チャット実行",      used: 840,  limit: 1000, unit: "クレジット", color: "bg-primary-500",  pct: 84 },
  { label: "Salesforce 操作",  used: 23,   limit: 50,   unit: "回 / 月",    color: "bg-blue-500",     pct: 46 },
  { label: "API リクエスト",   used: 3241, limit: 5000, unit: "回 / 月",    color: "bg-violet-500",   pct: 65 },
  { label: "ストレージ",        used: 1.2,  limit: 5,    unit: "GB",         color: "bg-emerald-500",  pct: 24 },
];

const BILLING_HISTORY = [
  { date: "2026/02/01", desc: "Pro プラン",    amount: "¥9,800" },
  { date: "2026/01/01", desc: "Pro プラン",    amount: "¥9,800" },
  { date: "2025/12/01", desc: "Pro プラン",    amount: "¥9,800" },
  { date: "2025/11/01", desc: "Starter プラン", amount: "¥2,980" },
];

// ── サブビュー ────────────────────────────────────────────

function AccountTab() {
  return (
    <div className="space-y-6">
      {/* アバター & 名前 */}
      <div className="card p-6">
        <h3 className="font-bold text-neutral-800 mb-4">プロフィール</h3>
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
              田
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-neutral-200 rounded-full flex items-center justify-center shadow-sm hover:bg-neutral-50 transition-colors">
              <span className="text-[10px] text-neutral-600 font-bold">✎</span>
            </button>
          </div>
          <div>
            <p className="font-bold text-neutral-900">田中 太郎</p>
            <p className="text-sm text-neutral-500">admin@mycompany.co.jp</p>
            <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              <Crown size={9} />
              Pro プラン
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "お名前",  value: "田中 太郎",              type: "text" },
            { label: "メールアドレス", value: "admin@mycompany.co.jp", type: "email" },
            { label: "会社名",  value: "MyCompany 株式会社",     type: "text" },
            { label: "役職",    value: "システム管理者",          type: "text" },
          ].map(({ label, value, type }) => (
            <div key={label}>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">{label}</label>
              <input type={type} defaultValue={value} className="input" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button className="btn-primary">
            <Check size={14} />
            保存する
          </button>
        </div>
      </div>

      {/* セキュリティ */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-blue-500" />
          <h3 className="font-bold text-neutral-800">セキュリティ</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">現在のパスワード</label>
            <input type="password" placeholder="••••••••" className="input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">新しいパスワード</label>
              <input type="password" placeholder="••••••••" className="input" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">確認用パスワード</label>
              <input type="password" placeholder="••••••••" className="input" />
            </div>
          </div>
          <div className="flex justify-end">
            <button className="btn-ghost text-sm">パスワードを変更</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanTab() {
  return (
    <div className="space-y-6">
      {/* 現在のプラン */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown size={16} className="text-amber-500" />
              <h3 className="font-bold text-neutral-800">Pro プラン</h3>
            </div>
            <p className="text-sm text-neutral-500">
              毎月 1日 に自動更新 — 次回請求: <span className="font-semibold text-neutral-700">¥9,800</span>（2026/03/01）
            </p>
          </div>
          <button className="btn-ghost text-sm flex-shrink-0">プランを変更</button>
        </div>

        {/* クレジット消費メーター */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-neutral-700">今月の利用状況</p>
            <p className="text-xs text-neutral-400">リセット: 2026/03/01</p>
          </div>
          {USAGE_ITEMS.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-neutral-600">{item.label}</span>
                <span className="text-xs text-neutral-500">
                  <span className="font-bold text-neutral-800">{item.used.toLocaleString()}</span>
                  {" / "}
                  {item.limit.toLocaleString()} {item.unit}
                </span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${item.color} ${item.pct >= 80 ? "opacity-100" : "opacity-80"}`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
              {item.pct >= 80 && (
                <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={11} />
                  上限に近づいています
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* プラン比較 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            name: "Starter",
            price: "¥2,980",
            features: ["チャット 300 クレジット/月", "Salesforce 操作 10回/月", "API 1,000回/月"],
            current: false,
          },
          {
            name: "Pro",
            price: "¥9,800",
            features: ["チャット 1,000 クレジット/月", "Salesforce 操作 50回/月", "API 5,000回/月", "優先サポート"],
            current: true,
          },
          {
            name: "Enterprise",
            price: "お問い合わせ",
            features: ["クレジット無制限", "操作数無制限", "専用サポート", "SLA 保証"],
            current: false,
          },
        ].map((plan) => (
          <div
            key={plan.name}
            className={`card p-4 relative ${plan.current ? "border-primary-400 bg-primary-50 ring-1 ring-primary-300" : ""}`}
          >
            {plan.current && (
              <span className="absolute -top-2.5 left-4 text-[10px] font-bold bg-primary-500 text-white px-2 py-0.5 rounded-full">
                現在のプラン
              </span>
            )}
            <p className="font-bold text-neutral-800 mb-0.5">{plan.name}</p>
            <p className="text-lg font-bold text-neutral-900 mb-3">
              {plan.price}
              {plan.price !== "お問い合わせ" && <span className="text-xs font-normal text-neutral-400">/月</span>}
            </p>
            <ul className="space-y-1.5 mb-4">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-1.5 text-xs text-neutral-600">
                  <Check size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            {!plan.current && (
              <button className={`w-full py-2 rounded-xl text-xs font-bold border transition-colors ${
                plan.name === "Enterprise"
                  ? "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                  : "bg-primary-500 text-white border-primary-500 hover:bg-primary-600"
              }`}>
                {plan.name === "Enterprise" ? "お問い合わせ" : "このプランに変更"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BillingTab() {
  return (
    <div className="space-y-6">
      {/* 支払い方法 */}
      <div className="card p-6">
        <h3 className="font-bold text-neutral-800 mb-4">お支払い方法</h3>
        <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-7 bg-gradient-to-r from-blue-600 to-blue-400 rounded-md flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">VISA</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-800">
                •••• •••• •••• <span className="text-neutral-900">4242</span>
              </p>
              <p className="text-xs text-neutral-400">有効期限: 2026/12</p>
            </div>
          </div>
          <button className="btn-ghost text-sm">更新する</button>
        </div>
        <button className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
          + 支払い方法を追加
        </button>
      </div>

      {/* 請求先情報 */}
      <div className="card p-6">
        <h3 className="font-bold text-neutral-800 mb-4">請求先情報</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "会社名 / 氏名",   value: "MyCompany 株式会社" },
            { label: "メールアドレス",   value: "billing@mycompany.co.jp" },
            { label: "郵便番号",         value: "150-0001" },
            { label: "住所",             value: "東京都渋谷区神宮前1-1-1" },
          ].map(({ label, value }) => (
            <div key={label}>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">{label}</label>
              <input type="text" defaultValue={value} className="input" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button className="btn-primary">
            <Check size={14} />
            保存する
          </button>
        </div>
      </div>

      {/* 請求履歴 */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h3 className="font-bold text-neutral-800">請求履歴</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500">日付</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500">内容</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500">金額</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {BILLING_HISTORY.map((row) => (
              <tr key={row.date} className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-3.5 text-neutral-600 text-xs">{row.date}</td>
                <td className="px-6 py-3.5 text-neutral-800 font-medium text-xs">{row.desc}</td>
                <td className="px-6 py-3.5 text-right font-bold text-neutral-800 text-xs">{row.amount}</td>
                <td className="px-6 py-3.5 text-right">
                  <button className="flex items-center gap-1 text-xs text-neutral-400 hover:text-primary-600 transition-colors ml-auto">
                    <Download size={12} />
                    領収書
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AITab() {
  const [dryRun, setDryRun] = useState(false);
  const [confidence, setConfidence] = useState(70);

  return (
    <div className="space-y-6">
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Zap size={16} className="text-primary-500" />
          <h3 className="font-bold text-neutral-800">AI 動作設定</h3>
        </div>

        {/* DRY RUN */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-semibold text-neutral-800">DRY RUN モード</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              有効にすると Salesforce への書き込みを行わずにプレビューのみ表示します
            </p>
          </div>
          <button
            onClick={() => setDryRun(!dryRun)}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
              dryRun ? "bg-primary-500" : "bg-neutral-200"
            }`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              dryRun ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
        </div>

        {/* 信頼度しきい値 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-neutral-800">AI 信頼度しきい値</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                この値未満では実行前に確認ダイアログを表示します
              </p>
            </div>
            <span className="text-lg font-bold text-primary-600 w-14 text-right">{confidence}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={100}
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
            className="w-full accent-primary-500"
          />
          <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
            <span>慎重 (50%)</span>
            <span>積極的 (100%)</span>
          </div>
        </div>

        {/* Anthropic API Key */}
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1">
            Anthropic API Key
            <span className="text-neutral-400 font-normal ml-1">（独自キーを使用する場合）</span>
          </label>
          <input type="password" placeholder="sk-ant-..." className="input" />
          <p className="text-[11px] text-neutral-400 mt-1.5">
            未入力の場合はサービス側のキーが使用されます（Pro プランに含まれます）
          </p>
        </div>

        <div className="flex justify-end pt-1">
          <button className="btn-primary">
            <Check size={14} />
            設定を保存
          </button>
        </div>
      </div>
    </div>
  );
}

// ── メインページ ──────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("account");

  const ActiveView = {
    account: AccountTab,
    plan:    PlanTab,
    billing: BillingTab,
    ai:      AITab,
  }[activeTab];

  return (
    <div className="flex flex-col min-h-full">
      <Header title="設定" breadcrumb={["Salesforce Automation", "設定"]} />

      <div className="flex-1 p-6 max-w-3xl mx-auto w-full">
        {/* タブナビ */}
        <div className="flex gap-1 mb-6 bg-neutral-100 rounded-xl p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
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

        {/* コンテンツ */}
        <ActiveView />
      </div>
    </div>
  );
}
