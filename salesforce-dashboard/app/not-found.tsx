import Link from "next/link";
import {
  Globe, MessageSquare, Package, Bookmark,
  LayoutDashboard, Zap, ArrowLeft, Clock, CheckCircle2,
} from "lucide-react";

const AVAILABLE = [
  { href: "/chat",            icon: MessageSquare, label: "チャット自動化", badge: "NEW" },
  { href: "/industry-packs", icon: Package,        label: "業界パック",     badge: "NEW" },
  { href: "/presets",        icon: Bookmark,       label: "プリセット管理", badge: undefined },
];

const ROADMAP = [
  {
    phase: "Phase 1",
    eta: "2025 Q1",
    labelText: "開発中",
    labelColor: "bg-blue-100 text-blue-700",
    itemColor: "bg-blue-100 text-blue-600",
    items: [
      {
        icon: Globe,
        title: "実Salesforce接続",
        desc: "メタデータAPIで実際の組織に直接デプロイ。DRYRUNで事前確認も可能",
      },
    ],
  },
  {
    phase: "Phase 2",
    eta: "2025 Q2",
    labelText: "計画中",
    labelColor: "bg-violet-100 text-violet-700",
    itemColor: "bg-violet-100 text-violet-600",
    items: [
      {
        icon: LayoutDashboard,
        title: "舵手ボード",
        desc: "組織のヘルスと実行履歴をリアルタイムで可視化するダッシュボード",
      },
      {
        icon: Zap,
        title: "スキル＆フロービルダー",
        desc: "チャットでSalesforce Flowを自動生成・追加。スキルでどんどん拡張",
      },
    ],
  },
];

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-full">
      {/* ── ヘッダ（戻るリンク） ── */}
      <div className="sticky top-0 z-20 flex items-center bg-white border-b border-neutral-200 px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
        >
          <ArrowLeft size={15} />
          ホームに戻る
        </Link>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* ── ヒーロー ── */}
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <Clock size={28} className="text-neutral-400" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">このページは開発中です</h1>
            <p className="text-neutral-500 mt-2 text-sm leading-relaxed">
              この機能はロードマップに含まれています。<br />
              引き続きご期待ください！
            </p>
          </div>

          {/* ── 現在利用可能 ── */}
          <div className="card p-5">
            <h2 className="font-bold text-neutral-800 mb-3 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              現在利用可能な機能
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {AVAILABLE.map(({ href, icon: Icon, label, badge }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 hover:border-primary-400 hover:bg-primary-50 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-colors flex-shrink-0">
                    <Icon size={14} />
                  </div>
                  <span className="text-sm font-medium text-neutral-800 flex-1">{label}</span>
                  {badge && (
                    <span className="text-[9px] font-bold bg-primary-500 text-white px-1.5 py-0.5 rounded-full">
                      {badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* ── ロードマップ ── */}
          <div className="space-y-3">
            <h2 className="font-bold text-neutral-800">開発ロードマップ</h2>
            {ROADMAP.map((phase) => (
              <div key={phase.phase} className="card p-5 border-dashed opacity-80">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${phase.labelColor}`}>
                      {phase.phase}
                    </span>
                    <span className="text-xs text-neutral-500">{phase.labelText}</span>
                  </div>
                  <span className="text-xs text-neutral-400">{phase.eta} 予定</span>
                </div>
                <div className="space-y-3">
                  {phase.items.map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${phase.itemColor}`}>
                        <Icon size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-700">{title}</p>
                        <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
