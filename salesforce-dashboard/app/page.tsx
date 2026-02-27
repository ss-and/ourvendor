"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare, Package, Bookmark, History, FileText,
  ArrowRight, Plus, Users, Clock, CheckCircle2,
  X, ChevronDown, Server, ExternalLink,
} from "lucide-react";
import Header from "@/components/layout/Header";
import { useOrg } from "@/contexts/OrgContext";
import { ORGS } from "@/lib/orgs";

// ── 利用可能な機能 ──────────────────────────────────────

const FEATURES = [
  { href: "/chat",            icon: MessageSquare, label: "チャット自動化",    desc: "日本語でSalesforceを設定変更",           badge: "NEW",     badgeCls: "bg-primary-500 text-white" },
  { href: "/industry-packs",  icon: Package,       label: "業界パック",        desc: "業界別CRM設定を一括展開",                badge: "NEW",     badgeCls: "bg-primary-500 text-white" },
  { href: "/presets",         icon: Bookmark,      label: "パワーアクション",  desc: "Lightningページ一括編集・数式自動生成・重複マージ", badge: undefined, badgeCls: "" },
  { href: "/history",         icon: History,       label: "実行履歴",          desc: "操作ログを確認・追跡",                   badge: undefined, badgeCls: "" },
  { href: "/spec-generator",  icon: FileText,      label: "仕様書から自動生成", desc: "業務フロー・要件書を読み込んで一括構築",  badge: "Phase 3", badgeCls: "bg-amber-500 text-white" },
];

// ── 新しい組織を接続モーダル ────────────────────────────

type ConnectPhase = "form" | "oauth_loading" | "oauth_done" | "test_loading" | "test_success" | "test_error";

function ConnectOrgModal({ onClose }: { onClose: () => void }) {
  const [env, setEnv] = useState<"production" | "sandbox">("production");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [phase, setPhase] = useState<ConnectPhase>("form");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleOAuth = async () => {
    setPhase("oauth_loading");
    await new Promise((r) => setTimeout(r, 1600));
    setPhase("oauth_done");
    setTimeout(onClose, 1400);
  };

  const handleTest = async () => {
    if (!username.trim() || !password.trim()) return;
    setPhase("test_loading");
    await new Promise((r) => setTimeout(r, 1300));
    setPhase(Math.random() > 0.15 ? "test_success" : "test_error");
  };

  const loading = phase === "oauth_loading" || phase === "test_loading";

  // ── 成功画面 ────
  if (phase === "oauth_done" || phase === "test_success") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-modal mx-4 p-8 flex flex-col items-center text-center animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <h2 className="font-bold text-neutral-900 text-lg mb-1">接続完了！</h2>
          <p className="text-sm text-neutral-500 mb-2">
            {phase === "oauth_done" ? "Salesforce OAuth 認証に成功しました" : "接続テストが成功しました"}
          </p>
          <p className="text-xs text-neutral-400 mb-6">
            {displayName || (env === "production" ? "本番環境" : "サンドボックス")} を組織リストに追加しました
          </p>
          <button onClick={onClose} className="btn-primary w-full justify-center">
            閉じる
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-modal mx-4 flex flex-col max-h-[90vh] animate-slide-up">
        {/* ヘッダ */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
              <Server size={16} className="text-primary-600" />
            </div>
            <div>
              <h2 className="font-bold text-neutral-900 text-sm">新しい組織を接続</h2>
              <p className="text-[11px] text-neutral-400">Salesforce 組織を認証して追加</p>
            </div>
          </div>
          {!loading && (
            <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors">
              <X size={16} />
            </button>
          )}
        </div>

        {/* ボディ */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* エラーバナー */}
          {phase === "test_error" && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              <X size={13} className="flex-shrink-0" />
              接続テストに失敗しました。ユーザー名・パスワード・トークンを確認してください。
            </div>
          )}

          {/* OAuth 推奨バナー */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-primary-50 border border-primary-200">
            <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ExternalLink size={12} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-primary-800">Salesforce OAuth で接続（推奨）</p>
              <p className="text-[11px] text-primary-600 mt-0.5 leading-relaxed">
                パスワードを入力せずにワンクリックで安全に認証できます。
              </p>
              <button
                onClick={handleOAuth}
                disabled={loading}
                className="mt-2 flex items-center gap-1.5 text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-60 px-3 py-1.5 rounded-lg transition-colors"
              >
                {phase === "oauth_loading" ? (
                  <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />接続中...</>
                ) : (
                  <><ExternalLink size={11} />Salesforce でログイン</>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-[11px] text-neutral-400 font-medium">または手動で入力</span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          {/* 環境選択 */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">環境</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "production" as const, label: "本番 (Production)" },
                { id: "sandbox"    as const, label: "サンドボックス" },
              ].map(({ id, label }) => (
                <button key={id} onClick={() => setEnv(id)} disabled={loading}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    env === id ? "bg-primary-500 text-white border-primary-500" : "bg-white text-neutral-600 border-neutral-200 hover:border-primary-300"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 表示名 */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">表示名</label>
            <input type="text" placeholder="例: 本番環境、営業SB..." value={displayName}
              onChange={(e) => setDisplayName(e.target.value)} disabled={loading} className="input" />
          </div>

          {/* ユーザー名 */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">
              ユーザー名 <span className="text-red-400">*</span>
            </label>
            <input type="email" placeholder="admin@yourorg.com" value={username}
              onChange={(e) => setUsername(e.target.value)} disabled={loading} className="input" />
          </div>

          {/* パスワード */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">
              パスワード <span className="text-red-400">*</span>
            </label>
            <input type="password" placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)} disabled={loading} className="input" />
          </div>

          {/* セキュリティトークン */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">
              セキュリティトークン
              <span className="text-neutral-400 font-normal ml-1">（APIアクセスに必要）</span>
            </label>
            <input type="password" placeholder="abcXYZ123..." disabled={loading} className="input" />
            <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
              Salesforce 右上アイコン → 設定 → 個人設定 → セキュリティトークンのリセット → メールで届いたトークンを入力
            </p>
          </div>

          {/* 詳細設定 */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-neutral-50 transition-colors"
            >
              <span className="text-xs font-semibold text-neutral-600">詳細設定（Connected App / JWT）</span>
              <ChevronDown size={15} className={`text-neutral-400 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
            {showAdvanced && (
              <div className="px-4 pb-4 space-y-3 border-t border-neutral-100">
                <p className="text-[11px] text-neutral-400 pt-3">
                  Connected App を使った OAuth / JWT 認証が必要な場合に入力してください。
                </p>
                {[
                  { label: "Consumer Key (Client ID)", placeholder: "3MVG9...",               type: "text" },
                  { label: "Consumer Secret",           placeholder: "your_consumer_secret",   type: "password" },
                  { label: "JWT 秘密鍵パス",            placeholder: "./certs/server.key",     type: "text" },
                  { label: "API バージョン",            placeholder: "v63.0",                  type: "text" },
                ].map(({ label, placeholder, type }) => (
                  <div key={label}>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">{label}</label>
                    <input type={type} placeholder={placeholder} disabled={loading} className="input text-xs" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* フッタ */}
        <div className="px-5 py-4 border-t border-neutral-100 flex items-center justify-between gap-3 flex-shrink-0">
          <button onClick={onClose} disabled={loading} className="btn-ghost text-sm">キャンセル</button>
          <button
            onClick={handleTest}
            disabled={loading || !username.trim() || !password.trim()}
            className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {phase === "test_loading" ? (
              <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />テスト中...</>
            ) : (
              <><CheckCircle2 size={14} />接続テスト & 追加</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── メインページ ──────────────────────────────────────────

export default function HomePage() {
  const { selectedOrg, selectOrg } = useOrg();
  const [connectModalOpen, setConnectModalOpen] = useState(false);

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
              <div
                key={org.id}
                role="button"
                tabIndex={0}
                onClick={() => selectOrg(org.id)}
                onKeyDown={(e) => e.key === "Enter" && selectOrg(org.id)}
                className={`card p-4 text-left transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? `${org.borderActive} ${org.bgActive} shadow-md ring-1 ${org.ringColor}`
                    : "hover:border-neutral-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${org.dotColor}`} />
                    <p className="font-semibold text-neutral-900 text-sm leading-tight">{org.name}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${org.badgeColor}`}>
                    {org.badge}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 truncate ml-4">{org.domain}</p>
                <div className="flex items-center justify-between mt-2.5 ml-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-neutral-400">
                      <Clock size={11} />
                      {org.lastUsed}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-neutral-400">
                      <Users size={11} />
                      {org.userCount} 名
                    </span>
                  </div>
                  {/* Salesforce で開くボタン */}
                  <a
                    href={`https://${org.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg transition-colors ${
                      isSelected
                        ? `${org.textActive} hover:bg-white/60`
                        : "text-neutral-400 hover:text-primary-600 hover:bg-primary-50"
                    }`}
                  >
                    <ExternalLink size={11} />
                    SF で開く
                  </a>
                </div>
                {isSelected && (
                  <div className={`flex items-center gap-1 mt-2 ml-0 text-xs font-semibold ${org.textActive}`}>
                    <CheckCircle2 size={12} />
                    選択中
                  </div>
                )}
              </div>
            );
          })}

          {/* 新しい組織を接続 */}
          <button
            onClick={() => setConnectModalOpen(true)}
            className="card p-4 text-left border-dashed hover:border-primary-300 hover:bg-primary-50 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-100 group-hover:bg-primary-100 flex items-center justify-center flex-shrink-0 transition-colors">
                <Plus size={17} className="text-neutral-400 group-hover:text-primary-500 transition-colors" />
              </div>
              <div>
                <p className="font-semibold text-neutral-600 group-hover:text-neutral-800 text-sm transition-colors">
                  新しい組織を接続
                </p>
                <p className="text-xs text-neutral-400">Salesforce OAuth / 手動で認証</p>
              </div>
            </div>
            <div className="flex items-center gap-1 ml-0.5">
              <ArrowRight size={12} className="text-neutral-300 group-hover:text-primary-400 transition-colors" />
              <span className="text-[11px] text-neutral-400 group-hover:text-primary-500 font-medium transition-colors">
                クリックして追加
              </span>
            </div>
          </button>
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
          {FEATURES.map(({ href, icon: Icon, label, desc, badge, badgeCls }) => (
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
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${badgeCls}`}>
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

      {/* ━━━ 接続モーダル ━━━ */}
      {connectModalOpen && <ConnectOrgModal onClose={() => setConnectModalOpen(false)} />}
    </div>
  );
}
