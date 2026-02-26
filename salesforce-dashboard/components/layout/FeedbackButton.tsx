"use client";

import { useState } from "react";
import { MessageSquarePlus, X, Send, CheckCircle } from "lucide-react";

type Step = "idle" | "open" | "sending" | "done";

export default function FeedbackButton() {
  const [step, setStep] = useState<Step>("idle");
  const [text, setText] = useState("");

  async function handleSubmit() {
    if (!text.trim()) return;
    setStep("sending");
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      });
    } catch {
      // fire-and-forget; ignore network errors in demo
    }
    setStep("done");
    setTimeout(() => {
      setStep("idle");
      setText("");
    }, 2500);
  }

  return (
    <>
      {/* フローティングボタン */}
      <button
        onClick={() => setStep("open")}
        aria-label="フィードバックを送る"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full
                   bg-primary-500 text-white text-sm font-medium shadow-modal
                   hover:bg-primary-600 active:scale-95 transition-all duration-150"
      >
        <MessageSquarePlus size={16} />
        フィードバック
      </button>

      {/* モーダル */}
      {(step === "open" || step === "sending" || step === "done") && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-6 pointer-events-none">
          <div
            className="pointer-events-auto w-80 bg-white rounded-2xl shadow-modal border border-neutral-200 animate-slide-up"
            role="dialog"
            aria-modal="true"
            aria-label="フィードバックフォーム"
          >
            {/* ヘッダー */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
              <span className="font-semibold text-sm text-neutral-800">フィードバックを送る</span>
              <button
                onClick={() => { setStep("idle"); setText(""); }}
                className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label="閉じる"
              >
                <X size={15} />
              </button>
            </div>

            {/* 本文 */}
            <div className="p-4">
              {step === "done" ? (
                <div className="flex flex-col items-center gap-2 py-4 text-emerald-600">
                  <CheckCircle size={32} />
                  <p className="text-sm font-medium">ありがとうございます！</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-neutral-500 mb-3">
                    ご意見・ご要望・バグ報告などをお聞かせください。
                  </p>
                  <textarea
                    className="input resize-none h-28 text-sm"
                    placeholder="例: チャット画面でエラーが表示された…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={step === "sending"}
                    autoFocus
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!text.trim() || step === "sending"}
                    className="btn-primary w-full mt-3 justify-center"
                  >
                    <Send size={14} />
                    {step === "sending" ? "送信中..." : "送信する"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
