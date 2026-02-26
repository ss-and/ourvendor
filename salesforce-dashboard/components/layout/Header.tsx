"use client";

import { Bell, Search, RefreshCw, ChevronRight } from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";

interface HeaderProps {
  title: string;
  breadcrumb?: string[];
  actions?: React.ReactNode;
}

export default function Header({ title, breadcrumb, actions }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-neutral-200 px-6 py-3.5 flex items-center gap-4">

      {/* ── パンくず + タイトル ──────────────────────────── */}
      <div className="flex-1 min-w-0">
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-neutral-400 mb-0.5">
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={11} />}
                <span>{crumb}</span>
              </span>
            ))}
          </div>
        )}
        <h1 className="text-base font-bold text-neutral-900 truncate">{title}</h1>
      </div>

      {/* ── サーチバー ──────────────────────────────────── */}
      <div className="hidden md:flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 w-64 text-sm text-neutral-400 hover:border-primary-400 transition-colors cursor-text">
        <Search size={15} />
        <span>オブジェクト・項目を検索...</span>
      </div>

      {/* ── アクション ───────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* 同期ボタン */}
        <Tooltip text="Salesforce Orgの情報を最新状態に更新" position="bottom">
          <button className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors">
            <RefreshCw size={17} />
          </button>
        </Tooltip>

        {/* 通知ベル */}
        <Tooltip text="通知を確認（3件の未読）" position="bottom">
          <button className="relative p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors">
            <Bell size={17} />
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
              3
            </span>
          </button>
        </Tooltip>

        {/* カスタムアクション (ページ毎) */}
        {actions}

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-xs ml-1 cursor-pointer hover:ring-2 hover:ring-primary-300 transition-all">
          田
        </div>
      </div>
    </header>
  );
}
