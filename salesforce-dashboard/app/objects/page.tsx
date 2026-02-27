"use client";

import { useState } from "react";
import {
  Layers, Search, ChevronDown, ChevronUp,
  Database, AlertTriangle, CheckCircle2, Plus,
  Filter, Columns3,
} from "lucide-react";
import Header from "@/components/layout/Header";

// ── モックデータ ──────────────────────────────────────────

type ObjType = "standard" | "custom";

type SFObject = {
  id: string;
  label: string;
  apiName: string;
  type: ObjType;
  fields: number;
  records: number;
  validations: number;
  lastModified: string;
  fields_detail: { name: string; apiName: string; type: string; required: boolean }[];
};

const OBJECTS: SFObject[] = [
  {
    id: "o1", label: "取引先", apiName: "Account", type: "standard",
    fields: 64, records: 3840, validations: 2, lastModified: "2026/02/18",
    fields_detail: [
      { name: "取引先名",    apiName: "Name",             type: "Text",    required: true  },
      { name: "電話番号",    apiName: "Phone",            type: "Phone",   required: false },
      { name: "業種",        apiName: "Industry",         type: "Picklist",required: false },
      { name: "年間売上",    apiName: "AnnualRevenue",    type: "Currency",required: false },
      { name: "競合社名",    apiName: "Competitor__c",    type: "Text",    required: false },
    ],
  },
  {
    id: "o2", label: "商談", apiName: "Opportunity", type: "standard",
    fields: 52, records: 1204, validations: 4, lastModified: "2026/02/21",
    fields_detail: [
      { name: "商談名",      apiName: "Name",             type: "Text",    required: true  },
      { name: "金額",        apiName: "Amount",           type: "Currency",required: false },
      { name: "フェーズ",    apiName: "StageName",        type: "Picklist",required: true  },
      { name: "完了予定日",  apiName: "CloseDate",        type: "Date",    required: true  },
      { name: "競合社名",    apiName: "Competitor__c",    type: "Text",    required: false },
      { name: "商談確度コメント", apiName: "ProbabilityNote__c", type: "TextArea", required: false },
    ],
  },
  {
    id: "o3", label: "取引先責任者", apiName: "Contact", type: "standard",
    fields: 47, records: 5610, validations: 1, lastModified: "2026/01/30",
    fields_detail: [
      { name: "姓",          apiName: "LastName",         type: "Text",    required: true  },
      { name: "名",          apiName: "FirstName",        type: "Text",    required: false },
      { name: "メール",      apiName: "Email",            type: "Email",   required: false },
      { name: "部署",        apiName: "Department",       type: "Text",    required: false },
    ],
  },
  {
    id: "o4", label: "商談進捗管理", apiName: "DealProgress__c", type: "custom",
    fields: 18, records: 422, validations: 3, lastModified: "2026/02/10",
    fields_detail: [
      { name: "商談",        apiName: "Opportunity__c",   type: "Lookup",  required: true  },
      { name: "進捗フェーズ", apiName: "Phase__c",        type: "Picklist",required: true  },
      { name: "コメント",    apiName: "Comment__c",       type: "TextArea",required: false },
    ],
  },
  {
    id: "o5", label: "パートナー情報", apiName: "PartnerInfo__c", type: "custom",
    fields: 11, records: 87, validations: 0, lastModified: "2026/01/15",
    fields_detail: [
      { name: "パートナー名", apiName: "Name",            type: "Text",    required: true  },
      { name: "契約開始日",   apiName: "StartDate__c",    type: "Date",    required: false },
    ],
  },
];

// ── ページ ────────────────────────────────────────────────

export default function ObjectsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "standard" | "custom">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = OBJECTS.filter((o) => {
    const matchType = filter === "all" || o.type === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || o.label.toLowerCase().includes(q) || o.apiName.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="オブジェクト管理"
        breadcrumb={["Salesforce Automation", "オブジェクト管理"]}
        actions={
          <button className="btn-primary">
            <Plus size={14} />
            新規オブジェクト
          </button>
        }
      />

      <div className="flex-1 p-6 space-y-4 max-w-4xl mx-auto w-full">

        {/* 検索 & フィルタ */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="オブジェクト名・API 名で検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          <div className="flex gap-1 bg-neutral-100 rounded-xl p-1">
            {(["all", "standard", "custom"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === f ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {f === "all" ? "すべて" : f === "standard" ? "標準" : "カスタム"}
              </button>
            ))}
          </div>
        </div>

        {/* サマリー */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "総オブジェクト", value: OBJECTS.length,                                        color: "text-neutral-800" },
            { label: "標準オブジェクト", value: OBJECTS.filter((o) => o.type === "standard").length, color: "text-blue-600" },
            { label: "カスタムオブジェクト", value: OBJECTS.filter((o) => o.type === "custom").length, color: "text-violet-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* オブジェクト一覧 */}
        <div className="card overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-3 border-b border-neutral-100 bg-neutral-50 text-[11px] font-bold text-neutral-500 uppercase tracking-wide">
            <span>オブジェクト</span>
            <span className="text-right">項目数</span>
            <span className="text-right">レコード数</span>
            <span className="text-right">入力規則</span>
            <span className="text-right">最終更新</span>
          </div>
          <div className="divide-y divide-neutral-100">
            {filtered.map((obj) => {
              const isOpen = expanded === obj.id;
              return (
                <div key={obj.id}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : obj.id)}
                    className="w-full grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-3.5 text-left hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        obj.type === "custom" ? "bg-violet-100" : "bg-blue-100"
                      }`}>
                        <Database size={13} className={obj.type === "custom" ? "text-violet-600" : "text-blue-600"} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-neutral-800 leading-none">{obj.label}</p>
                        <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{obj.apiName}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                        obj.type === "custom" ? "bg-violet-100 text-violet-600" : "bg-blue-100 text-blue-600"
                      }`}>
                        {obj.type === "custom" ? "カスタム" : "標準"}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-neutral-700 text-right">{obj.fields}</span>
                    <span className="text-sm text-neutral-600 text-right">{obj.records.toLocaleString()}</span>
                    <span className={`text-sm text-right font-semibold ${obj.validations > 0 ? "text-amber-600" : "text-neutral-400"}`}>
                      {obj.validations}
                    </span>
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-[11px] text-neutral-400">{obj.lastModified}</span>
                      {isOpen ? <ChevronUp size={13} className="text-neutral-400" /> : <ChevronDown size={13} className="text-neutral-400" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 border-t border-neutral-100 bg-neutral-50/50">
                      <div className="pt-3 flex items-center justify-between mb-2">
                        <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
                          <Columns3 size={11} />
                          主要カスタム項目
                        </p>
                        <button className="flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:text-primary-700">
                          <Plus size={11} />
                          項目を追加
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {obj.fields_detail.map((f) => (
                          <div key={f.apiName} className="flex items-center gap-3 p-2 rounded-lg bg-white border border-neutral-200">
                            <span className="text-xs font-medium text-neutral-800 flex-1">{f.name}</span>
                            <code className="text-[11px] text-neutral-400 font-mono">{f.apiName}</code>
                            <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">{f.type}</span>
                            {f.required && (
                              <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded">必須</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
