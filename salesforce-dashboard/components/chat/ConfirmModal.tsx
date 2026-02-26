"use client";

import {
  AlertTriangle, X, CheckCircle, Info,
  Database, Shield, FileText, Search,
} from "lucide-react";
import { clsx } from "clsx";
import type { ConfirmModalState } from "@/lib/types";

interface ConfirmModalProps {
  state: ConfirmModalState;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const actionLabels: Record<string, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  ADD_FIELD:             { label: "カスタム項目を追加",  icon: <Database size={18} />,  color: "text-primary-700",  bgColor: "bg-primary-50" },
  MODIFY_FIELD:          { label: "カスタム項目を更新",  icon: <Database size={18} />,  color: "text-blue-700",     bgColor: "bg-blue-50" },
  DELETE_FIELD:          { label: "カスタム項目を削除",  icon: <Database size={18} />,  color: "text-red-700",      bgColor: "bg-red-50" },
  ADD_PERMISSION:        { label: "権限を付与",          icon: <Shield size={18} />,    color: "text-purple-700",   bgColor: "bg-purple-50" },
  REVOKE_PERMISSION:     { label: "権限を剥奪",          icon: <Shield size={18} />,    color: "text-orange-700",   bgColor: "bg-orange-50" },
  CREATE_VALIDATION_RULE:{ label: "入力規則を作成",      icon: <FileText size={18} />,  color: "text-amber-700",    bgColor: "bg-amber-50" },
  TOGGLE_VALIDATION_RULE:{ label: "入力規則を切り替え",  icon: <FileText size={18} />,  color: "text-teal-700",     bgColor: "bg-teal-50" },
  DESCRIBE_OBJECT:       { label: "オブジェクトを参照",  icon: <Search size={18} />,    color: "text-slate-700",    bgColor: "bg-slate-50" },
  UNKNOWN:               { label: "不明な操作",          icon: <AlertTriangle size={18}/>, color: "text-gray-700",  bgColor: "bg-gray-50" },
};

export default function ConfirmModal({ state, onConfirm, onCancel, loading = false }: ConfirmModalProps) {
  if (!state.open || !state.preview) return null;

  const { preview } = state;
  const config = actionLabels[preview.action] ?? actionLabels.UNKNOWN;
  const isDestructive = preview.action === "DELETE_FIELD" || preview.action === "REVOKE_PERMISSION";
  const isReadOnly    = preview.action === "DESCRIBE_OBJECT";

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-modal animate-slide-up overflow-hidden">

        {/* Header bar */}
        <div className={clsx("flex items-center gap-3 px-5 py-4 border-b border-neutral-100", config.bgColor)}>
          <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", config.bgColor, config.color)}>
            {config.icon}
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">実行確認</p>
            <h3 className={clsx("font-bold text-base", config.color)}>{config.label}</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-neutral-200/60 text-neutral-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">

          {/* 信頼度バー */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-neutral-500">AI解析の信頼度</span>
              <span className={clsx(
                "text-xs font-bold",
                preview.confidence >= 0.85 ? "text-emerald-600" :
                preview.confidence >= 0.7  ? "text-amber-600" : "text-red-500"
              )}>
                {Math.round(preview.confidence * 100)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className={clsx(
                  "h-full rounded-full transition-all",
                  preview.confidence >= 0.85 ? "bg-emerald-500" :
                  preview.confidence >= 0.7  ? "bg-amber-500" : "bg-red-500"
                )}
                style={{ width: `${Math.round(preview.confidence * 100)}%` }}
              />
            </div>
          </div>

          {/* 実行内容サマリー */}
          <div className="bg-neutral-50 rounded-xl p-3.5 space-y-2">
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">実行内容</p>

            {preview.objectApiName && (
              <Row label="対象オブジェクト" value={preview.objectApiName} mono />
            )}
            {preview.fieldApiName && (
              <Row label="項目 API名" value={preview.fieldApiName} mono />
            )}
            {preview.label && (
              <Row label="ラベル" value={preview.label} />
            )}
            {preview.fieldType && (
              <Row label="項目型" value={preview.fieldType} />
            )}
            {preview.permissionSetName && (
              <Row label="権限セット" value={preview.permissionSetName} mono />
            )}
            {preview.ruleName && (
              <Row label="ルール名" value={preview.ruleName} mono />
            )}
            {preview.formula && (
              <Row label="条件式" value={preview.formula} mono />
            )}
            {preview.errorMessage && (
              <Row label="エラーメッセージ" value={preview.errorMessage} />
            )}
          </div>

          {/* 警告 */}
          {preview.warnings.length > 0 && (
            <div className="flex gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                {preview.warnings.map((w, i) => (
                  <p key={i} className="text-xs text-amber-700">{w}</p>
                ))}
              </div>
            </div>
          )}

          {/* 破壊的操作の追加警告 */}
          {isDestructive && (
            <div className="flex gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 font-medium">
                この操作は元に戻すことができません。実行前に必ずバックアップを確認してください。
              </p>
            </div>
          )}

          {/* 読み取り専用の注記 */}
          {isReadOnly && (
            <div className="flex gap-2.5 bg-blue-50 border border-blue-200 rounded-xl p-3">
              <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">この操作はデータを変更しません（読み取り専用）</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-neutral-100 flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-ghost" disabled={loading}>
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={clsx(
              "inline-flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-150 disabled:opacity-60",
              isDestructive
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-primary-500 text-white hover:bg-primary-600"
            )}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                実行中...
              </>
            ) : (
              <>
                <CheckCircle size={15} />
                {isReadOnly ? "取得する" : "実行する"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-neutral-500 w-28 flex-shrink-0 pt-0.5">{label}</span>
      <span className={clsx(
        "text-xs text-neutral-800 font-medium flex-1 break-all",
        mono && "font-mono bg-neutral-200 rounded px-1 py-0.5"
      )}>
        {value}
      </span>
    </div>
  );
}
