"use client";

import { clsx } from "clsx";
import {
  Plus, Edit2, Trash2, Shield, ShieldOff, AlertTriangle,
  ToggleLeft, Search, CheckCircle, XCircle, Clock, TestTube,
} from "lucide-react";
import type { ExecutionRecord, ActionType, ActionStatus } from "@/lib/types";

// ── アイコン・ラベルマップ ────────────────────────────────

const actionConfig: Record<ActionType, { icon: React.ReactNode; label: string; color: string }> = {
  ADD_FIELD:             { icon: <Plus size={13} />,        label: "項目追加",     color: "text-primary-600 bg-primary-50" },
  MODIFY_FIELD:          { icon: <Edit2 size={13} />,       label: "項目更新",     color: "text-blue-600 bg-blue-50" },
  DELETE_FIELD:          { icon: <Trash2 size={13} />,      label: "項目削除",     color: "text-red-600 bg-red-50" },
  ADD_PERMISSION:        { icon: <Shield size={13} />,      label: "権限付与",     color: "text-purple-600 bg-purple-50" },
  REVOKE_PERMISSION:     { icon: <ShieldOff size={13} />,   label: "権限剥奪",     color: "text-orange-600 bg-orange-50" },
  CREATE_VALIDATION_RULE:{ icon: <AlertTriangle size={13}/>, label: "入力規則作成", color: "text-amber-600 bg-amber-50" },
  TOGGLE_VALIDATION_RULE:{ icon: <ToggleLeft size={13} />,  label: "規則切替",     color: "text-teal-600 bg-teal-50" },
  DESCRIBE_OBJECT:       { icon: <Search size={13} />,      label: "オブジェクト参照", color: "text-slate-600 bg-slate-50" },
  UNKNOWN:               { icon: <AlertTriangle size={13}/>, label: "不明",        color: "text-gray-600 bg-gray-50" },
};

const statusConfig: Record<ActionStatus, { icon: React.ReactNode; label: string; cls: string }> = {
  success: { icon: <CheckCircle size={13} />, label: "成功",       cls: "badge-success" },
  failed:  { icon: <XCircle size={13} />,     label: "失敗",       cls: "badge-danger" },
  pending: { icon: <Clock size={13} />,       label: "処理中",     cls: "badge-warn" },
  dry_run: { icon: <TestTube size={13} />,    label: "DRY RUN",   cls: "badge-neutral" },
};

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0)  return `${d}日前`;
  if (h > 0)  return `${h}時間前`;
  if (m > 0)  return `${m}分前`;
  return "たった今";
}

// ── コンポーネント ────────────────────────────────────────

interface Props {
  records: ExecutionRecord[];
  compact?: boolean;
}

export default function RecentActionsTable({ records, compact = false }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-neutral-50 border-b border-neutral-200">
            <th className="table-header text-left">操作</th>
            <th className="table-header text-left">指示内容</th>
            <th className="table-header text-left">対象</th>
            {!compact && <th className="table-header text-left">実行者</th>}
            <th className="table-header text-left">ステータス</th>
            <th className="table-header text-right">実行時刻</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec) => {
            const ac = actionConfig[rec.action];
            const sc = statusConfig[rec.status];
            return (
              <tr key={rec.id} className="table-row group">
                {/* 操作種別 */}
                <td className="table-cell">
                  <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", ac.color)}>
                    {ac.icon}
                    {ac.label}
                  </span>
                </td>

                {/* 指示内容 */}
                <td className="table-cell max-w-[220px]">
                  <p className="text-neutral-800 font-medium truncate">{rec.instruction}</p>
                  {rec.details && !compact && (
                    <p className="text-neutral-400 text-xs truncate mt-0.5">{rec.details}</p>
                  )}
                </td>

                {/* 対象 */}
                <td className="table-cell">
                  <code className="text-xs bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded font-mono">
                    {rec.target}
                  </code>
                </td>

                {/* 実行者 */}
                {!compact && (
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                        {rec.user.charAt(0)}
                      </div>
                      <span className="text-sm text-neutral-600 truncate">{rec.user}</span>
                    </div>
                  </td>
                )}

                {/* ステータス */}
                <td className="table-cell">
                  <span className={clsx("badge inline-flex items-center gap-1", sc.cls)}>
                    {sc.icon}
                    {sc.label}
                  </span>
                </td>

                {/* 実行時刻 */}
                <td className="table-cell text-right text-neutral-400 text-xs whitespace-nowrap">
                  {timeAgo(rec.executedAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
