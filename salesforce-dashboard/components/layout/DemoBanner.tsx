"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative flex items-center gap-3 bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-sm text-amber-800">
      <AlertTriangle size={15} className="shrink-0 text-amber-500" />
      <span className="flex-1">
        <span className="font-semibold">デモモード</span>
        &nbsp;— このダッシュボードはサンプルデータを表示しています。Salesforce Org には接続していません。
      </span>
      <button
        onClick={() => setDismissed(true)}
        aria-label="バナーを閉じる"
        className="p-1 rounded hover:bg-amber-100 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
