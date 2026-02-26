"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, MessageSquare, History, Settings,
  Layers, Shield, Zap, HelpCircle, LogOut, ChevronRight, Bookmark,
} from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";
import { clsx } from "clsx";

// ── ナビゲーション定義 ────────────────────────────────────

const mainNav = [
  { href: "/",        icon: LayoutDashboard, label: "ダッシュボード" },
  { href: "/chat",    icon: MessageSquare,   label: "チャット自動化", badge: "NEW" },
  { href: "/presets", icon: Bookmark,        label: "プリセット管理" },
  { href: "/history", icon: History,         label: "実行履歴" },
];

const adminNav = [
  { href: "/objects",     icon: Layers,   label: "オブジェクト管理" },
  { href: "/permissions", icon: Shield,   label: "権限管理" },
  { href: "/automations", icon: Zap,      label: "自動化ルール" },
  { href: "/settings",    icon: Settings, label: "設定" },
];

// ── コンポーネント ────────────────────────────────────────

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-60 flex flex-col bg-sidebar-bg z-30 select-none">

      {/* ── ロゴ ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
        {/* SF icon mark */}
        <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0 shadow-glow">
          <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-white" width={18} height={18}>
            <path d="M10 2C7.24 2 5 4.24 5 7c0 1.37.55 2.61 1.44 3.51C4.99 11.27 4 12.98 4 15c0 3.31 2.69 6 6 6 .35 0 .7-.03 1.03-.09A6 6 0 0 0 20 15c0-2.22-1.21-4.15-3-5.19V7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v1.17A6.01 6.01 0 0 0 10 9c-.69 0-1.35.12-1.97.32-.02-.1-.03-.21-.03-.32 0-1.66 1.34-3 3-3z"/>
          </svg>
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none">Salesforce</p>
          <p className="text-primary-400 text-[10px] font-semibold tracking-widest mt-0.5">AUTOMATION</p>
        </div>
      </div>

      {/* ── メインナビ ────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-2 mb-2 text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
          メインメニュー
        </p>
        {mainNav.map(({ href, icon: Icon, label, badge }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-sidebar-active text-white border-l-2 border-primary-500 pl-[10px]"
                  : "text-neutral-400 hover:bg-sidebar-hover hover:text-white"
              )}
            >
              <Icon size={17} className={active ? "text-primary-400" : ""} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="text-[9px] font-bold bg-primary-500 text-white px-1.5 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
              {active && <ChevronRight size={13} className="text-primary-400 opacity-60" />}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-sidebar-border">
          <p className="px-2 mb-2 text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
            管理者メニュー
          </p>
          {adminNav.map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-sidebar-active text-white border-l-2 border-primary-500 pl-[10px]"
                    : "text-neutral-400 hover:bg-sidebar-hover hover:text-white"
                )}
              >
                <Icon size={17} className={active ? "text-primary-400" : ""} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── ボトムユーザー情報 ─────────────────────────────── */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        <Link
          href="/help"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full text-neutral-400 hover:bg-sidebar-hover hover:text-white transition-all duration-150 ${
            pathname === "/help" ? "bg-sidebar-active text-white border-l-2 border-primary-500 pl-[10px]" : ""
          }`}
        >
          <HelpCircle size={17} className={pathname === "/help" ? "text-primary-400" : ""} />
          <span className="text-sm">ヘルプ</span>
        </Link>

        {/* User avatar row */}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg bg-sidebar-active">
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            田
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">田中 太郎</p>
            <p className="text-neutral-500 text-[11px] truncate">システム管理者</p>
          </div>
          <button className="text-neutral-500 hover:text-red-400 transition-colors">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
