import { Suspense } from "react";
import Header from "@/components/layout/Header";
import ChatInterface from "@/components/chat/ChatInterface";
import ChatSearchParamReader from "./ChatSearchParamReader";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen">
      <Header
        title="チャット自動化"
        breadcrumb={["Salesforce Automation", "チャット"]}
      />

      {/* ── 2カラムレイアウト: チャット + サイドパネル ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* チャット */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Suspense fallback={<div className="flex-1" />}>
            <ChatSearchParamReader />
          </Suspense>
        </div>

        {/* サイドパネル: ヒント */}
        <aside className="hidden xl:flex flex-col w-72 bg-white border-l border-neutral-200 overflow-y-auto">
          <div className="p-5 border-b border-neutral-100">
            <h3 className="font-bold text-neutral-800 text-sm">使い方ガイド</h3>
            <p className="text-xs text-neutral-500 mt-1">自然言語で指示するだけ</p>
          </div>

          <div className="p-4 space-y-4">
            {/* Step cards */}
            {[
              {
                step: "01",
                title: "指示を入力",
                desc: "「AccountにCustomer_Score__c数値項目を追加して」のように日本語で入力",
              },
              {
                step: "02",
                title: "AIが解析",
                desc: "Claude AIが意図を解析し、Salesforce操作のパラメータを抽出します",
              },
              {
                step: "03",
                title: "内容を確認",
                desc: "実行内容と信頼度スコアを確認。問題なければ「実行する」をクリック",
              },
              {
                step: "04",
                title: "自動実行",
                desc: "Salesforce Metadata APIが呼び出され、設定変更が自動で完了します",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center text-[11px] font-black flex-shrink-0">
                  {step}
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-800">{title}</p>
                  <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-neutral-100">
            <p className="text-xs font-bold text-neutral-700 mb-3">対応操作一覧</p>
            <div className="space-y-1.5">
              {[
                "カスタム項目の追加・更新・削除",
                "権限セットの作成・更新",
                "入力規則の作成・有効化/無効化",
                "オブジェクト情報の参照",
                "Apex匿名実行（高度）",
                "フローの有効化/無効化",
              ].map((op) => (
                <div key={op} className="flex items-start gap-1.5 text-xs text-neutral-600">
                  <span className="text-primary-500 mt-0.5">✓</span>
                  <span>{op}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="m-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-[11px] font-bold text-amber-700 mb-1">⚠️ 注意</p>
            <p className="text-[11px] text-amber-600 leading-relaxed">
              本番環境では必ず DRY RUN モードで確認後に実行してください。削除操作は元に戻せません。
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
