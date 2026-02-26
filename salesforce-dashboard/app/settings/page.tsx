"use client";

import Header from "@/components/layout/Header";
import { ChevronDown, Shield, Server } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [env, setEnv] = useState<"production" | "sandbox">("production");

  return (
    <div className="flex flex-col min-h-full">
      <Header title="設定" breadcrumb={["Salesforce Automation", "設定"]} />

      <div className="p-6 max-w-2xl space-y-5">

        {/* Salesforce ログイン設定 */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Server size={18} className="text-primary-500" />
            <h2 className="font-bold text-neutral-900">Salesforce ログイン</h2>
          </div>

          {/* 環境選択 */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">環境</label>
            <div className="flex gap-2">
              <button
                onClick={() => setEnv("production")}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  env === "production"
                    ? "bg-primary-500 text-white border-primary-500"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-primary-300"
                }`}
              >
                本番
              </button>
              <button
                onClick={() => setEnv("sandbox")}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  env === "sandbox"
                    ? "bg-primary-500 text-white border-primary-500"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-primary-300"
                }`}
              >
                サンドボックス
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">ユーザー名</label>
            <input type="email" placeholder="admin@yourorg.com" className="input" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">パスワード</label>
            <input type="password" placeholder="••••••••" className="input" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">
              セキュリティトークン
              <span className="text-neutral-400 font-normal ml-1">（APIアクセスに必要）</span>
            </label>
            <input type="password" placeholder="abcXYZ123..." className="input" />
            <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed">
              取得方法: Salesforce 右上アイコン →「設定」→「個人設定」→「私のセキュリティトークンのリセット」→ メールで届いたトークンを貼り付け
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button className="btn-primary">接続テスト</button>
            <button className="btn-ghost">保存</button>
          </div>
        </div>

        {/* 詳細設定（折りたたみ） */}
        <div className="card overflow-hidden">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-neutral-50 transition-colors"
          >
            <span className="text-sm font-semibold text-neutral-600">詳細設定（Connected App / JWT）</span>
            <ChevronDown
              size={16}
              className={`text-neutral-400 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`}
            />
          </button>

          {showAdvanced && (
            <div className="px-5 pb-5 space-y-4 border-t border-neutral-100">
              <p className="text-xs text-neutral-400 pt-3">
                Connected App を使った OAuth / JWT 認証が必要な場合に入力してください。
              </p>

              {[
                { label: "Consumer Key (Client ID)", placeholder: "3MVG9...", type: "text" },
                { label: "Consumer Secret", placeholder: "your_consumer_secret", type: "password" },
                { label: "JWT 秘密鍵パス", placeholder: "./certs/server.key", type: "text" },
                { label: "APIバージョン", placeholder: "v59.0", type: "text" },
              ].map(({ label, placeholder, type }) => (
                <div key={label}>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">{label}</label>
                  <input type={type} placeholder={placeholder} className="input" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI 設定 */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={18} className="text-blue-500" />
            <h2 className="font-bold text-neutral-900">AI 設定</h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Anthropic API Key</label>
            <input type="password" placeholder="sk-ant-..." className="input" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">信頼度しきい値</label>
            <div className="flex items-center gap-3">
              <input type="range" min={50} max={100} defaultValue={70} className="flex-1 accent-primary-500" />
              <span className="text-sm font-bold text-neutral-700 w-10 text-right">70%</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">この値未満の信頼度では実行前に確認ダイアログを表示します</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-800">DRY RUN モード</p>
              <p className="text-xs text-neutral-400">有効にするとSalesforceへの書き込みを行いません</p>
            </div>
            <div className="w-11 h-6 bg-neutral-200 rounded-full relative cursor-pointer">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform" />
            </div>
          </div>

          <button className="btn-primary">設定を保存</button>
        </div>

      </div>
    </div>
  );
}
