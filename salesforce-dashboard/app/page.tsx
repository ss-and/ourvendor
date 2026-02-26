import Link from "next/link";
import {
  Layers, Shield, AlertTriangle, Zap,
  ArrowRight, MessageSquare,
} from "lucide-react";
import Header from "@/components/layout/Header";
import StatsCard from "@/components/dashboard/StatsCard";
import OrgHealthRing from "@/components/dashboard/OrgHealthRing";
import RecentActionsTable from "@/components/dashboard/RecentActionsTable";
import { orgStats, orgHealthMetrics, executionHistory } from "@/lib/mockData";

const statIcons = [
  <Layers size={20} />,
  <Shield size={20} />,
  <AlertTriangle size={20} />,
  <Zap size={20} />,
];
const statColors = ["teal", "blue", "purple", "orange"] as const;

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="ダッシュボード"
        breadcrumb={["Salesforce Automation"]}
        actions={
          <Link href="/chat" className="btn-primary">
            <MessageSquare size={15} />
            チャットで自動化
          </Link>
        }
      />

      <div className="flex-1 p-6 space-y-6">

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ① 統計カード
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {orgStats.map((stat, i) => (
            <StatsCard
              key={stat.label}
              {...stat}
              icon={statIcons[i]}
              color={statColors[i]}
            />
          ))}
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ② Org ヘルス + クイックアクション (2カラム)
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Org ヘルス */}
          <div className="lg:col-span-2 card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-neutral-900">Org ヘルス</h2>
                <p className="text-xs text-neutral-500 mt-0.5">組織の使用状況をモニタリング</p>
              </div>
              <span className="text-xs text-neutral-400">最終更新: 2分前</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {orgHealthMetrics.map((metric) => (
                <OrgHealthRing key={metric.label} {...metric} />
              ))}
            </div>
          </div>

          {/* クイックアクション */}
          <div className="card p-5">
            <h2 className="font-bold text-neutral-900 mb-1">クイックアクション</h2>
            <p className="text-xs text-neutral-500 mb-4">よく使う操作をワンクリックで</p>

            <div className="space-y-2">
              {[
                { label: "カスタム項目を追加",   desc: "オブジェクトに新規項目",    href: "/chat?q=項目を追加したい" },
                { label: "権限セットを更新",     desc: "アクセス権限を変更",        href: "/chat?q=権限セットを更新" },
                { label: "入力規則を作成",       desc: "バリデーションルール設定",   href: "/chat?q=入力規則を作成" },
                { label: "オブジェクトを参照",   desc: "フィールド一覧を確認",      href: "/chat?q=オブジェクトを確認" },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 hover:border-primary-400 hover:bg-primary-50 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                    <MessageSquare size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-800">{action.label}</p>
                    <p className="text-xs text-neutral-500">{action.desc}</p>
                  </div>
                  <ArrowRight size={14} className="text-neutral-300 group-hover:text-primary-500 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ③ 最近の実行履歴
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <div>
              <h2 className="font-bold text-neutral-900">最近の自動化実行</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                直近 {executionHistory.length} 件の操作ログ
              </p>
            </div>
            <Link href="/history" className="btn-ghost text-xs">
              すべて表示 <ArrowRight size={12} />
            </Link>
          </div>
          <RecentActionsTable records={executionHistory.slice(0, 5)} />
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ④ バナー: チャットUI への誘導
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-primary-400 p-6 text-white">
          {/* Decorative circles */}
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full" />
          <div className="absolute -right-4 -bottom-8 w-32 h-32 bg-white/10 rounded-full" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <MessageSquare size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">AIチャットで直感的に操作</h3>
              <p className="text-primary-100 text-sm mt-1">
                「AccountにCustomer_Score数値項目を追加して」と日本語で入力するだけ。
                AIが自動でSalesforceの設定を変更します。
              </p>
            </div>
            <Link
              href="/chat"
              className="flex-shrink-0 bg-white text-primary-700 font-bold px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-colors text-sm shadow-md"
            >
              今すぐ試す →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
