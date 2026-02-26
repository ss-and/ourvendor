"use client";

import Link from "next/link";
import {
  MessageSquare, Package, Bookmark, History,
  ArrowRight, Plus, Users, Clock, CheckCircle2,
} from "lucide-react";
import Header from "@/components/layout/Header";
import { useOrg } from "@/contexts/OrgContext";
import { ORGS } from "@/lib/orgs";

// ── 利用可能な機能 ──────────────────────────────────────

const FEATURES = [
  {
    href: "/chat",
    icon: MessageSquare,
    label: "チャット自動化",
    desc: "日本語でSalesforceを設定変更",
    badge: "NEW",
  },
  {
    href: "/industry-packs",
    icon: Package,
    label: "業界パック",
    desc: "業界別CRM設定を一括展開",
    badge: "NEW",
  },
  {
    href: "/presets",
    icon: Bookmark,
    label: "プリセット管理",
    desc: "よく使う設定をテンプレート化",
    badge: undefined,
  },
  {
    href: "/history",
    icon: History,
    label: "実行履歴",
    desc: "操作ログを確認・追跡",
    badge: undefined,
  },
];

// ── メインページ ──────────────────────────────────────────

export default function HomePage() {
  const { selectedOrg, selectOrg } = useOrg();

  return (
    <div className="flex flex-col min-h-full">
      <Header title="ホーム" breadcrumb={["Salesforce Automation"]} />

      <div className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-8">

        {/* ━━━ ① ウェルカム ━━━ */}
        <div>
          <h1 className="text-xl font-bold text-neutral-900">
            田中 太郎 さん、こんにちは。
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            どの Salesforce 組織で作業しますか？
          </p>
        </div>

        {/* ━━━ ② 組織セレクター ━━━ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ORGS.map((org) => {
            const isSelected = selectedOrg.id === org.id;
            return (
              <button
                key={org.id}
                onClick={() => selectOrg(org.id)}
                className={`card p-4 text-left transition-all duration-150 ${
                  isSelected
                    ? `${org.borderActive} ${org.bgActive} shadow-md ring-1 ${org.ringColor}`
                    : "hover:border-neutral-300 hover:shadow-sm"
                }`}
              >
                {/* 上段: ドット＋名前＋バッジ */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${org.dotColor}`} />
                    <p className="font-semibold text-neutral-900 text-sm leading-tight">
                      {org.name}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${org.badgeColor}`}>
                    {org.badge}
                  </span>
                </div>

                {/* ドメイン */}
                <p className="text-xs text-neutral-400 truncate ml-4">{org.domain}</p>

                {/* メタ情報 */}
                <div className="flex items-center gap-3 mt-2.5 ml-4">
                  <span className="flex items-center gap-1 text-xs text-neutral-400">
                    <Clock size={11} />
                    {org.lastUsed}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-neutral-400">
                    <Users size={11} />
                    {org.userCount} 名
                  </span>
                </div>

                {/* 選択インジケーター */}
                {isSelected && (
                  <div className={`flex items-center gap-1 mt-2.5 ml-4 text-xs font-semibold ${org.textActive}`}>
                    <CheckCircle2 size={12} />
                    選択中
                  </div>
                )}
              </button>
            );
          })}

          {/* 新しい組織を接続（Phase 1 予定） */}
          <div className="card p-4 border-dashed opacity-55 select-none">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <Plus size={17} className="text-neutral-400" />
              </div>
              <div>
                <p className="font-semibold text-neutral-500 text-sm">新しい組織を接続</p>
                <p className="text-xs text-neutral-400">Salesforce OAuth で認証</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
              Phase 1 実装予定
            </span>
          </div>
        </div>

        {/* ━━━ ③ セパレーター ━━━ */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-xs text-neutral-500 flex items-center gap-1.5 whitespace-nowrap">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${selectedOrg.dotColor}`} />
            {selectedOrg.name} で作業中
          </span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>

        {/* ━━━ ④ 機能ショートカット ━━━ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEATURES.map(({ href, icon: Icon, label, desc, badge }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 p-4 card hover:border-primary-300 hover:bg-primary-50 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-neutral-800 text-sm">{label}</p>
                  {badge && (
                    <span className="text-[9px] font-bold bg-primary-500 text-white px-1.5 py-0.5 rounded-full">
                      {badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">{desc}</p>
              </div>
              <ArrowRight size={14} className="text-neutral-300 group-hover:text-primary-500 transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
