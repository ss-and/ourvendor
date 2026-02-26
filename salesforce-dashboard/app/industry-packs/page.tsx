"use client";

import { useState } from "react";
import {
  Building2, Heart, Cog, Monitor, Package,
  Database, Columns3, AlertTriangle, Shield,
  CheckCircle2, Loader2, X, Clock, Zap, Globe,
  ChevronRight, PlayCircle,
} from "lucide-react";
import Header from "@/components/layout/Header";
import { industryPacks } from "@/lib/mockData";
import type { IndustryPack, PackItemType } from "@/lib/types";

// ── 定数 ──────────────────────────────────────────────────

const INDUSTRY_ICONS: Record<string, React.ElementType> = {
  realestate:    Building2,
  medical:       Heart,
  manufacturing: Cog,
  saas:          Monitor,
};

const TYPE_CONFIG: Record<PackItemType, { label: string; color: string; icon: React.ElementType }> = {
  object:     { label: "オブジェクト", color: "bg-violet-100 text-violet-700", icon: Database },
  field:      { label: "カスタム項目", color: "bg-blue-100 text-blue-700",    icon: Columns3 },
  validation: { label: "入力規則",     color: "bg-amber-100 text-amber-700",  icon: AlertTriangle },
  permission: { label: "権限セット",   color: "bg-emerald-100 text-emerald-700", icon: Shield },
};

const ROADMAP_ITEMS = [
  {
    phase: "Phase 2",
    title: "会話型フロービルダー",
    description:
      "「商談がクローズしたら担当者にタスクを自動作成したい」をチャットで対話しながら、Salesforce Flowを自動生成・デプロイ。複雑なフロービルダーの操作が不要に。",
    icon: Zap,
    eta: "2025 Q2",
  },
  {
    phase: "Phase 3",
    title: "実Salesforce接続",
    description:
      "設定した組織に直接デプロイ。メタデータAPIを通じて業界パックや個別操作の変更を実際の組織に反映します。DRYRUNモードで事前確認も可能。",
    icon: Globe,
    eta: "2025 Q3",
  },
];

// ── メインページ ─────────────────────────────────────────

export default function IndustryPacksPage() {
  const [selected, setSelected] = useState<IndustryPack | null>(null);

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="業界パック"
        breadcrumb={["Salesforce Automation", "業界パック"]}
      />

      <div className="flex-1 p-6 space-y-8">
        {/* リード文 */}
        <p className="text-sm text-neutral-500 -mt-1">
          業界に合ったCRM設定をワンクリックで一括展開します。オブジェクト・カスタム項目・入力規則・権限セットをまとめて作成できます。
        </p>

        {/* 業界カードグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {industryPacks.map((pack) => {
            const Icon = INDUSTRY_ICONS[pack.id] ?? Package;
            const total =
              pack.stats.objects +
              pack.stats.fields +
              pack.stats.validations +
              pack.stats.permissions;
            return (
              <button
                key={pack.id}
                onClick={() => setSelected(pack)}
                className="card p-5 text-left hover:border-primary-300 hover:shadow-md transition-all group"
              >
                {/* アイコン */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${pack.accentBg}`}
                >
                  <Icon size={20} className={pack.accentText} />
                </div>

                <h3 className="font-bold text-neutral-900 text-sm mb-0.5">{pack.name}</h3>
                <p className="text-xs text-neutral-500 mb-4 leading-relaxed">{pack.tagline}</p>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-400 mb-4">
                  {pack.stats.objects > 0 && (
                    <span>
                      オブジェクト <strong className="text-neutral-700">{pack.stats.objects}</strong>
                    </span>
                  )}
                  <span>
                    カスタム項目 <strong className="text-neutral-700">{pack.stats.fields}</strong>
                  </span>
                  <span>
                    入力規則 <strong className="text-neutral-700">{pack.stats.validations}</strong>
                  </span>
                  {pack.stats.permissions > 0 && (
                    <span>
                      権限セット <strong className="text-neutral-700">{pack.stats.permissions}</strong>
                    </span>
                  )}
                  <span className="ml-auto text-neutral-300">合計 {total} 件</span>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-primary-600 group-hover:gap-2 transition-all">
                  <PlayCircle size={13} />
                  詳細を見て一括展開
                  <ChevronRight size={12} />
                </div>
              </button>
            );
          })}
        </div>

        {/* ── ロードマップ ─────────────────────────────────── */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-neutral-400" />
            <span className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase">
              ロードマップ — 今後実装予定
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ROADMAP_ITEMS.map((item) => (
              <div
                key={item.phase}
                className="card p-5 border-dashed opacity-70"
              >
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <item.icon size={15} className="text-neutral-400" />
                    <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                      {item.phase}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 bg-neutral-50 border border-neutral-200 px-2 py-0.5 rounded-full">
                    {item.eta} 予定
                  </span>
                </div>
                <h3 className="font-bold text-neutral-600 text-sm mb-1.5">{item.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 詳細モーダル */}
      {selected && (
        <PackDetailModal pack={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

// ── PackDetailModal ──────────────────────────────────────

type ExecPhase = "idle" | "executing" | "done";

function PackDetailModal({
  pack,
  onClose,
}: {
  pack: IndustryPack;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<ExecPhase>("idle");
  const [completedCount, setCompletedCount] = useState(0);

  const Icon = INDUSTRY_ICONS[pack.id] ?? Package;

  async function handleExecute() {
    setPhase("executing");
    setCompletedCount(0);
    for (let i = 0; i < pack.items.length; i++) {
      await new Promise((r) => setTimeout(r, 420));
      setCompletedCount(i + 1);
    }
    setPhase("done");
  }

  function handleClose() {
    setPhase("idle");
    setCompletedCount(0);
    onClose();
  }

  const total = pack.items.length;
  const progress = total > 0 ? (completedCount / total) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-modal animate-slide-up mx-4 flex flex-col max-h-[85vh]">
        {/* ヘッダ */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${pack.accentBg}`}
            >
              <Icon size={16} className={pack.accentText} />
            </div>
            <div>
              <h2 className="font-bold text-neutral-900 text-sm leading-tight">{pack.name}</h2>
              <p className="text-[11px] text-neutral-400">{pack.tagline}</p>
            </div>
          </div>
          {phase !== "executing" && (
            <button
              onClick={handleClose}
              className="p-1 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors flex-shrink-0"
            >
              <X size={17} />
            </button>
          )}
        </div>

        {/* ボディ */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {phase === "done" ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 size={48} className="text-emerald-500 mb-3" />
              <h3 className="font-bold text-neutral-900 mb-1">展開完了！</h3>
              <p className="text-sm text-neutral-500">
                {total} 件の設定を正常に作成しました
              </p>
            </div>
          ) : (
            pack.items.map((item, index) => {
              const isCompleted = phase === "executing" && index < completedCount;
              const isActive    = phase === "executing" && index === completedCount;
              const cfg = TYPE_CONFIG[item.type];
              const TypeIcon = cfg.icon;

              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-300 ${
                    isCompleted
                      ? "border-emerald-200 bg-emerald-50"
                      : isActive
                      ? "border-primary-200 bg-primary-50"
                      : "border-neutral-100 bg-neutral-50"
                  }`}
                >
                  {/* ステータスアイコン */}
                  <div className="flex-shrink-0 mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    ) : isActive ? (
                      <Loader2 size={16} className="text-primary-500 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-neutral-300" />
                    )}
                  </div>

                  {/* コンテンツ */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.color}`}>
                        <TypeIcon size={10} />
                        {cfg.label}
                      </span>
                      <span className="text-xs font-semibold text-neutral-800 leading-tight">
                        {item.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-relaxed mb-0.5">
                      {item.description}
                    </p>
                    <code className="text-[10px] text-neutral-400 font-mono">{item.target}</code>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* フッタ */}
        <div className="flex items-center px-5 py-4 border-t border-neutral-100 flex-shrink-0 gap-3">
          {phase === "idle" && (
            <>
              <span className="text-xs text-neutral-400 flex-1">合計 {total} 件の設定を作成します</span>
              <button onClick={handleClose} className="btn-ghost">キャンセル</button>
              <button onClick={handleExecute} className="btn-primary">
                <PlayCircle size={14} />
                一括展開する
              </button>
            </>
          )}

          {phase === "executing" && (
            <>
              <span className="text-xs text-neutral-500 flex-shrink-0">
                {completedCount} / {total} 完了
              </span>
              <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          )}

          {phase === "done" && (
            <div className="flex justify-end w-full">
              <button onClick={handleClose} className="btn-primary">
                <CheckCircle2 size={14} />
                完了
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
