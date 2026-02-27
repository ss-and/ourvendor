"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Send, Zap, RotateCcw, CheckCircle, XCircle,
  Lightbulb, History, ArrowRight, AlertTriangle,
} from "lucide-react";
import { clsx } from "clsx";
import IntentPreviewCard from "./IntentPreviewCard";
import ConfirmModal from "./ConfirmModal";
import { quickExamples } from "@/lib/mockData";
import type { ChatMessage, ConfirmModalState, ParsedIntentPreview } from "@/lib/types";

let _msgId = 0;
const newId = () => `msg-${++_msgId}-${Date.now()}`;

// ── ウェルカムメッセージ ──────────────────────────────────

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  type: "text",
  text: "こんにちは！Salesforce Automation AIです\n\n自然言語で指示するだけで、Salesforceの設定変更を自動で実行します。\n\n例えば「AccountにCustomer_Score__c数値項目を追加して」のように日本語で話しかけてください。",
  timestamp: new Date(),
};

// ── Typing Indicator ─────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5">
      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
        <Zap size={14} className="text-primary-600" />
      </div>
      <div className="chat-bubble-ai flex items-center gap-1.5 py-3.5">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
}

// ── Message コンポーネント ────────────────────────────────

interface MessageProps {
  msg: ChatMessage;
  onConfirm: (msgId: string, preview: ParsedIntentPreview) => void;
  onCancel: (msgId: string) => void;
  executedIds: Set<string>;
}

function Message({ msg, onConfirm, onCancel, executedIds }: MessageProps) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end animate-slide-up">
        <div className="chat-bubble-user">{msg.text}</div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2.5 animate-slide-up">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 shadow-sm">
        <Zap size={14} className="text-primary-600" />
      </div>

      <div className="flex flex-col gap-1 max-w-[85%]">
        {/* テキスト */}
        {msg.type === "text" && (
          <div className="chat-bubble-ai whitespace-pre-wrap">{msg.text}</div>
        )}

        {/* エラー */}
        {msg.type === "error" && (
          <div className="chat-bubble-ai flex items-start gap-2 border-l-4 border-amber-400 bg-amber-50">
            <AlertTriangle size={15} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-amber-800">{msg.text}</span>
          </div>
        )}

        {/* Intent プレビューカード */}
        {msg.type === "intent_preview" && msg.intentPreview && (
          <IntentPreviewCard
            preview={msg.intentPreview}
            onConfirm={() => onConfirm(msg.id, msg.intentPreview!)}
            onCancel={() => onCancel(msg.id)}
            isExecuted={executedIds.has(msg.id)}
          />
        )}

        {/* 実行結果 */}
        {msg.type === "result" && (
          <div className="flex flex-col gap-1.5">
            <div className={clsx(
              "chat-bubble-ai flex items-start gap-2",
              msg.status === "success"  ? "border-l-4 border-emerald-400" :
              msg.status === "dry_run"  ? "border-l-4 border-sky-400 bg-sky-50" :
              msg.status === "failed"   ? "border-l-4 border-red-400" : ""
            )}>
              {msg.status === "success" && (
                <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              )}
              {msg.status === "dry_run" && (
                <span className="text-[10px] font-bold bg-sky-200 text-sky-700 rounded px-1.5 py-0.5 flex-shrink-0 mt-0.5">
                  DRY RUN
                </span>
              )}
              {msg.status === "failed" && (
                <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
              )}
              <span className="text-sm whitespace-pre-wrap">{msg.text}</span>
            </div>
            {msg.status === "success" && (
              <div className="flex items-center gap-3 pl-1">
                <Link
                  href="/history"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500 hover:text-primary-600 transition-colors"
                >
                  <History size={11} />
                  実行履歴で確認
                  <ArrowRight size={10} />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 時刻 */}
        <p className="text-[10px] text-neutral-400 pl-1">
          {msg.timestamp.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// メインコンポーネント
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function ChatInterface({ initialQuery = "" }: { initialQuery?: string }) {
  const [messages, setMessages]         = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput]               = useState(initialQuery);
  const [typing, setTyping]             = useState(false);
  const [executedIds, setExecutedIds]   = useState<Set<string>>(new Set());
  const [modal, setModal]               = useState<ConfirmModalState>({ open: false, preview: null, messageId: "" });
  const [modalLoading, setModalLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  // 最下部へスクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // 初期クエリがある場合は自動送信
  useEffect(() => {
    if (initialQuery) {
      const t = setTimeout(() => handleSend(initialQuery), 600);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── メッセージ送信 ──────────────────────────────────────

  const handleSend = useCallback(async (text?: string) => {
    const instruction = (text ?? input).trim();
    if (!instruction) return;

    // User message を追加
    const userMsg: ChatMessage = {
      id: newId(), role: "user", type: "text", text: instruction, timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      // ── リアル Claude API 解析 ────────────────────────────
      const res = await fetch("/api/chat/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error ?? `サーバーエラー (${res.status})`);
      }

      const preview: ParsedIntentPreview = await res.json();

      // instruction を _raw に保存（execute 時に使用）
      if (preview._raw) {
        preview._raw.instruction = instruction;
      } else {
        (preview as ParsedIntentPreview)._raw = {
          action: preview.action,
          confidence: preview.confidence,
          reasoning: "",
          parameters: {},
          instruction,
        };
      }

      setTyping(false);

      if (preview.action === "UNKNOWN") {
        const unknownMsg: ChatMessage = {
          id: newId(), role: "assistant", type: "text",
          text: `申し訳ありません。指示の内容を解析できませんでした。\n\n${
            preview.warnings[0] ?? "もう少し具体的に教えてください。"
          }\n\n例: "AccountにCustomer_Score__c数値項目を追加"`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, unknownMsg]);
        return;
      }

      // Intent プレビューカードを表示
      const previewMsg: ChatMessage = {
        id: newId(), role: "assistant", type: "intent_preview",
        intentPreview: preview, timestamp: new Date(),
      };
      setMessages((prev) => [...prev, previewMsg]);

    } catch (err: unknown) {
      setTyping(false);
      const message = err instanceof Error ? err.message : "不明なエラー";
      const errMsg: ChatMessage = {
        id: newId(), role: "assistant", type: "error",
        text: `解析中にエラーが発生しました: ${message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    }
  }, [input]);

  // ── モーダル確認 ────────────────────────────────────────

  const handleIntentConfirm = useCallback((msgId: string, preview: ParsedIntentPreview) => {
    setModal({ open: true, preview, messageId: msgId });
  }, []);

  const handleIntentCancel = useCallback((msgId: string) => {
    const cancelMsg: ChatMessage = {
      id: newId(), role: "assistant", type: "text",
      text: "操作をキャンセルしました。別の指示をどうぞ。",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, cancelMsg]);
    setExecutedIds((prev) => new Set([...prev, msgId]));
  }, []);

  const handleModalConfirm = useCallback(async () => {
    if (!modal.preview) return;
    setModalLoading(true);

    const { preview, messageId } = modal;
    const instruction = preview._raw?.instruction as string | undefined;
    const action      = preview._raw?.action ?? preview.action;
    const parameters  = preview._raw?.parameters ?? {};

    try {
      // ── リアル Execute API ───────────────────────────────
      const res = await fetch("/api/chat/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction, action, parameters }),
      });

      const result = await res.json();

      setModal({ open: false, preview: null, messageId: "" });
      setModalLoading(false);
      setExecutedIds((prev) => new Set([...prev, messageId]));

      const resultMsg: ChatMessage = {
        id: newId(), role: "assistant", type: "result",
        text: result.message ?? (result.success ? `${action} を実行しました` : "実行に失敗しました"),
        status: result.status ?? (result.success ? "success" : "failed"),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, resultMsg]);

    } catch (err: unknown) {
      setModal({ open: false, preview: null, messageId: "" });
      setModalLoading(false);
      const message = err instanceof Error ? err.message : "不明なエラー";
      const errMsg: ChatMessage = {
        id: newId(), role: "assistant", type: "result",
        text: `実行中にエラーが発生しました: ${message}`,
        status: "failed", timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    }
  }, [modal]);

  const handleModalCancel = useCallback(() => {
    setModal({ open: false, preview: null, messageId: "" });
  }, []);

  // ── チャットリセット ────────────────────────────────────

  const handleReset = useCallback(() => {
    setMessages([WELCOME]);
    setExecutedIds(new Set());
    setInput("");
    inputRef.current?.focus();
  }, []);

  // ── キー入力ハンドラー ──────────────────────────────────

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // ── Render ─────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-surface-bg">

      {/* ── チャット領域 ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <Message
            key={msg.id}
            msg={msg}
            onConfirm={handleIntentConfirm}
            onCancel={handleIntentCancel}
            executedIds={executedIds}
          />
        ))}

        {/* Typing indicator */}
        {typing && (
          <div className="animate-fade-in">
            <TypingIndicator />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── クイック例文（初期状態のみ表示） ─────────────── */}
      {messages.length === 1 && !typing && (
        <div className="px-4 pb-3 animate-fade-in">
          <p className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium mb-2">
            <Lightbulb size={12} className="text-amber-400" />
            こんな指示を試してみましょう
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickExamples.map((ex) => (
              <button
                key={ex}
                onClick={() => handleSend(ex)}
                className="text-left px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-700 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700 transition-all duration-150 shadow-sm"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 入力エリア ───────────────────────────────────── */}
      <div className="bg-white border-t border-neutral-200 px-4 py-3">
        <div className="flex items-end gap-3">
          {/* リセットボタン */}
          <button
            onClick={handleReset}
            title="チャットをリセット"
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors flex-shrink-0 mb-0.5"
          >
            <RotateCcw size={17} />
          </button>

          {/* テキストエリア */}
          <div className="flex-1 relative bg-neutral-50 border border-neutral-200 rounded-2xl focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="例: AccountにCustomer_Score__c数値項目を追加して（Enterで送信）"
              rows={1}
              disabled={typing}
              className="w-full px-4 py-3 text-sm bg-transparent resize-none focus:outline-none leading-relaxed max-h-32 overflow-y-auto placeholder:text-neutral-400 disabled:opacity-50"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
          </div>

          {/* 送信ボタン */}
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || typing}
            className={clsx(
              "w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200",
              input.trim() && !typing
                ? "bg-primary-500 text-white hover:bg-primary-600 shadow-glow"
                : "bg-neutral-100 text-neutral-300 cursor-not-allowed"
            )}
          >
            <Send size={17} />
          </button>
        </div>

        <p className="text-center text-[10px] text-neutral-300 mt-2">
          Shift+Enter で改行 · Enter で送信 · AI の判断結果は必ず確認画面で確認できます
        </p>
      </div>

      {/* ── 確認モーダル ─────────────────────────────────── */}
      <ConfirmModal
        state={modal}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
        loading={modalLoading}
      />
    </div>
  );
}
