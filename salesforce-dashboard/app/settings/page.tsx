import Header from "@/components/layout/Header";
import { Key, Server, Bell, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-full">
      <Header title="設定" breadcrumb={["Salesforce Automation", "設定"]} />

      <div className="p-6 max-w-2xl space-y-5">

        {/* Salesforce 接続設定 */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Server size={18} className="text-primary-500" />
            <h2 className="font-bold text-neutral-900">Salesforce 接続設定</h2>
          </div>

          {[
            { label: "ログインURL", placeholder: "https://login.salesforce.com", type: "url" },
            { label: "APIバージョン", placeholder: "v59.0", type: "text" },
            { label: "Consumer Key (Client ID)", placeholder: "3MVG9...", type: "text" },
          ].map(({ label, placeholder, type }) => (
            <div key={label}>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">{label}</label>
              <input type={type} placeholder={placeholder} className="input" />
            </div>
          ))}

          <div className="flex items-center gap-3 pt-1">
            <button className="btn-primary">接続テスト</button>
            <button className="btn-ghost">保存</button>
          </div>
        </div>

        {/* JWT 認証 */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Key size={18} className="text-purple-500" />
            <h2 className="font-bold text-neutral-900">JWT Bearer 認証</h2>
          </div>

          {[
            { label: "Salesforce ユーザー名", placeholder: "admin@yourorg.com", type: "email" },
            { label: "秘密鍵パス", placeholder: "./certs/server.key", type: "text" },
          ].map(({ label, placeholder, type }) => (
            <div key={label}>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">{label}</label>
              <input type={type} placeholder={placeholder} className="input" />
            </div>
          ))}

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
            <strong>注意:</strong> 秘密鍵ファイルは .gitignore に追加し、本番環境では Secret Manager を使用してください。
          </div>
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
