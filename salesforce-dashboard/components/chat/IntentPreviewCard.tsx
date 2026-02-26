"use client";

import { clsx } from "clsx";
import {
  Sparkles, AlertTriangle, Database, Shield, FileText, Search,
  CheckCircle2,
} from "lucide-react";
import type { ParsedIntentPreview } from "@/lib/types";

interface Props {
  preview: ParsedIntentPreview;
  onConfirm: () => void;
  onCancel: () => void;
  isExecuted?: boolean;
}

const actionMeta: Record<string, { label: string; icon: React.ReactNode; ringColor: string }> = {
  ADD_FIELD:             { label: "カスタム項目の追加",   icon: <Database size={14} />,   ringColor: "border-primary-400" },
  MODIFY_FIELD:          { label: "カスタム項目の更新",   icon: <Database size={14} />,   ringColor: "border-blue-400" },
  DELETE_FIELD:          { label: "カスタム項目の削除",   icon: <Database size={14} />,   ringColor: "border-red-400" },
  ADD_PERMISSION:        { label: "権限の付与",           icon: <Shield size={14} />,     ringColor: "border-purple-400" },
  REVOKE_PERMISSION:     { label: "権限の剥奪",           icon: <Shield size={14} />,     ringColor: "border-orange-400" },
  CREATE_VALIDATION_RULE:{ label: "入力規則の作成",       icon: <FileText size={14} />,   ringColor: "border-amber-400" },
  TOGGLE_VALIDATION_RULE:{ label: "入力規則の切り替え",   icon: <FileText size={14} />,   ringColor: "border-teal-400" },
  DESCRIBE_OBJECT:       { label: "オブジェクトの参照",   icon: <Search size={14} />,     ringColor: "border-slate-400" },
  UNKNOWN:               { label: "解析失敗",             icon: <AlertTriangle size={14}/>, ringColor: "border-gray-300" },
};

export default function IntentPreviewCard({ preview, onConfirm, onCancel, isExecuted }: Props) {
  const meta  = actionMeta[preview.action] ?? actionMeta.UNKNOWN;
  const conf  = Math.round(preview.confidence * 100);
  const isOk  = preview.action !== "UNKNOWN";

  return (
    <div className={clsx(
      "rounded-2xl rounded-tl-sm border bg-white shadow-card overflow-hidden max-w-[85%]",
      meta.ringColor, "border-l-4"
    )}>
      {/* ── ヘッダー ─────────────────────────────── */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-neutral-50 border-b border-neutral-100">
        <Sparkles size={13} className="text-primary-500" />
        <span className="text-xs font-bold text-neutral-600">AI 解析結果</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[10px] text-neutral-400">信頼度</span>
          <span className={clsx(
            "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
            conf >= 85 ? "bg-emerald-100 text-emerald-700" :
            conf >= 70 ? "bg-amber-100 text-amber-700" :
                         "bg-red-100 text-red-600"
          )}>
            {conf}%
          </span>
        </div>
      </div>

      {/* ── 操作サマリー ─────────────────────────── */}
      <div className="px-3.5 py-3 space-y-2">
        {/* Action label */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-500">{meta.icon}</span>
          <span className="text-sm font-bold text-neutral-800">{meta.label}</span>
        </div>

        {/* Description */}
        <p className="text-xs text-neutral-600 leading-relaxed">{preview.description}</p>

        {/* Params pill list */}
        {(preview.objectApiName || preview.fieldApiName || preview.fieldType || preview.permissionSetName || preview.ruleName) && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {preview.objectApiName && (
              <Pill label="Object" value={preview.objectApiName} color="primary" />
            )}
            {preview.fieldApiName && (
              <Pill label="Field" value={preview.fieldApiName} color="blue" />
            )}
            {preview.fieldType && (
              <Pill label="Type" value={preview.fieldType} color="purple" />
            )}
            {preview.permissionSetName && (
              <Pill label="PermSet" value={preview.permissionSetName} color="purple" />
            )}
            {preview.ruleName && (
              <Pill label="Rule" value={preview.ruleName} color="amber" />
            )}
          </div>
        )}

        {/* Warnings */}
        {preview.warnings.length > 0 && (
          <div className="flex gap-1.5 bg-amber-50 rounded-lg p-2 mt-1">
            <AlertTriangle size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-0.5">
              {preview.warnings.map((w, i) => (
                <p key={i} className="text-[11px] text-amber-700">{w}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── アクションボタン ─────────────────────── */}
      {!isExecuted && isOk && (
        <div className="flex gap-2 px-3.5 pb-3.5">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl bg-primary-500 text-white text-xs font-bold hover:bg-primary-600 transition-colors flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 size={13} />
            実行する
          </button>
        </div>
      )}

      {/* 実行済みラベル */}
      {isExecuted && (
        <div className="px-3.5 pb-3">
          <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400">
            <CheckCircle2 size={12} className="text-emerald-500" />
            実行済み
          </span>
        </div>
      )}
    </div>
  );
}

function Pill({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    primary: "bg-primary-50 text-primary-700 border-primary-200",
    blue:    "bg-blue-50 text-blue-700 border-blue-200",
    purple:  "bg-purple-50 text-purple-700 border-purple-200",
    amber:   "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span className={clsx("inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono font-semibold", colors[color] ?? colors.primary)}>
      <span className="font-sans font-medium opacity-60">{label}:</span>
      {value}
    </span>
  );
}
