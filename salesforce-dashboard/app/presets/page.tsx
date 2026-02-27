"use client";

import { useState } from "react";
import {
  LayoutTemplate, Calculator, GitMerge, Zap,
  Copy, Check, Loader2, CheckCircle2, AlertTriangle,
  Eye, EyeOff, ChevronDown, ChevronUp, ArrowRightLeft,
} from "lucide-react";
import Header from "@/components/layout/Header";

// ── 型 ────────────────────────────────────────────────────

type Tab = "lightning" | "formula" | "merge";

// ── モックデータ: Lightning ページ ──────────────────────────

const LIGHTNING_PAGES = [
  {
    id: "lp1", name: "Account Record Page", type: "レコードページ",
    object: "Account", lastModified: "2026/02/18",
    components: [
      { id: "c1", name: "詳細 (Details)",          visible: true },
      { id: "c2", name: "関連リスト",               visible: true },
      { id: "c3", name: "活動タイムライン",           visible: true },
      { id: "c4", name: "Chatter フィード",          visible: false },
      { id: "c5", name: "パスコンポーネント",         visible: true },
    ],
  },
  {
    id: "lp2", name: "Opportunity Record Page", type: "レコードページ",
    object: "Opportunity", lastModified: "2026/02/10",
    components: [
      { id: "c6", name: "詳細 (Details)",            visible: true },
      { id: "c7", name: "商品リスト (Products)",      visible: true },
      { id: "c8", name: "活動タイムライン",            visible: false },
      { id: "c9", name: "売上予測コンポーネント",       visible: true },
    ],
  },
  {
    id: "lp3", name: "Contact Record Page", type: "レコードページ",
    object: "Contact", lastModified: "2026/01/30",
    components: [
      { id: "c10", name: "詳細 (Details)",           visible: true },
      { id: "c11", name: "ケース履歴",                visible: true },
      { id: "c12", name: "Chatter フィード",          visible: true },
    ],
  },
  {
    id: "lp4", name: "Home Page", type: "ホームページ",
    object: "—", lastModified: "2026/01/15",
    components: [
      { id: "c13", name: "今日のタスク",              visible: true },
      { id: "c14", name: "最近のレコード",             visible: true },
      { id: "c15", name: "ニュースフィード",            visible: false },
    ],
  },
];

// ── モックデータ: 生成済み数式 ──────────────────────────────

const SAVED_FORMULAS = [
  { id: "f1", name: "粗利率",       object: "Opportunity", formula: "(Amount - Cost__c) / Amount * 100", createdAt: "2026/02/12" },
  { id: "f2", name: "フルネーム結合", object: "Contact",    formula: "FirstName & \" \" & LastName",      createdAt: "2026/02/05" },
];

// ── モックデータ: 重複候補 ──────────────────────────────────

type MergeItem = {
  id: string; fieldA: string; fieldB: string;
  object: string; similarity: number; merged: boolean;
};

const INITIAL_MERGE_CANDIDATES: MergeItem[] = [
  { id: "m1", fieldA: "Customer_Name__c",   fieldB: "Client_Name__c",  object: "Account",     similarity: 94, merged: false },
  { id: "m2", fieldA: "Phone_Number__c",    fieldB: "Tel__c",          object: "Contact",     similarity: 88, merged: false },
  { id: "m3", fieldA: "Deal_Amount__c",     fieldB: "Contract_Value__c", object: "Opportunity", similarity: 81, merged: false },
  { id: "m4", fieldA: "Closing_Date__c",    fieldB: "Expected_Close__c", object: "Opportunity", similarity: 79, merged: false },
  { id: "m5", fieldA: "Company_Address__c", fieldB: "BillingStreet",   object: "Account",     similarity: 72, merged: false },
];

// ── タブ定義 ─────────────────────────────────────────────

const TABS: { id: Tab; icon: React.ElementType; label: string; desc: string }[] = [
  { id: "lightning", icon: LayoutTemplate, label: "Lightning ページ編集", desc: "コンポーネントの表示/非表示を一括変更" },
  { id: "formula",   icon: Calculator,     label: "数式自動生成",          desc: "日本語で説明するだけで数式を自動作成" },
  { id: "merge",     icon: GitMerge,       label: "重複項目マージ",         desc: "類似した項目を検出してまとめる" },
];

// ════════════════════════════════════════════════════════
//  Lightning ページ編集タブ
// ════════════════════════════════════════════════════════

type PageState = typeof LIGHTNING_PAGES;

function LightningTab() {
  const [pages, setPages] = useState(LIGHTNING_PAGES);
  const [expanded, setExpanded] = useState<string | null>("lp1");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<string | null>(null);

  const toggleComponent = (pageId: string, compId: string) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id !== pageId ? p : {
          ...p,
          components: p.components.map((c) =>
            c.id !== compId ? c : { ...c, visible: !c.visible }
          ),
        }
      )
    );
    setSaved((prev) => { const n = new Set(prev); n.delete(pageId); return n; });
  };

  const savePage = async (pageId: string) => {
    setSaving(pageId);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(null);
    setSaved((prev) => new Set([...prev, pageId]));
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-neutral-500">
        各 Lightning ページのコンポーネントを有効 / 無効にして「保存」すると Salesforce へ反映されます。
      </p>
      {pages.map((page) => {
        const isOpen = expanded === page.id;
        const isSaving = saving === page.id;
        const isSaved = saved.has(page.id);
        const visibleCount = page.components.filter((c) => c.visible).length;

        return (
          <div key={page.id} className="card overflow-hidden">
            {/* ヘッダ行 */}
            <button
              onClick={() => setExpanded(isOpen ? null : page.id)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-neutral-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <LayoutTemplate size={15} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-neutral-800">{page.name}</p>
                <p className="text-[11px] text-neutral-400">
                  {page.type} · {page.object} · 最終更新: {page.lastModified}
                </p>
              </div>
              <span className="text-[11px] text-neutral-400 mr-2">
                {visibleCount}/{page.components.length} 表示中
              </span>
              {isOpen ? <ChevronUp size={15} className="text-neutral-400 flex-shrink-0" /> : <ChevronDown size={15} className="text-neutral-400 flex-shrink-0" />}
            </button>

            {isOpen && (
              <div className="border-t border-neutral-100 px-4 pb-4 pt-3 space-y-2">
                {page.components.map((comp) => (
                  <div
                    key={comp.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                      comp.visible ? "border-neutral-200 bg-neutral-50" : "border-neutral-100 bg-neutral-50 opacity-50"
                    }`}
                  >
                    <span className="text-xs font-medium text-neutral-700">{comp.name}</span>
                    <button
                      onClick={() => toggleComponent(page.id, comp.id)}
                      className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                        comp.visible
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-neutral-200 text-neutral-500 hover:bg-neutral-300"
                      }`}
                    >
                      {comp.visible ? <Eye size={11} /> : <EyeOff size={11} />}
                      {comp.visible ? "表示" : "非表示"}
                    </button>
                  </div>
                ))}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => savePage(page.id)}
                    disabled={isSaving}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                      isSaved
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-primary-500 text-white hover:bg-primary-600"
                    }`}
                  >
                    {isSaving ? <Loader2 size={12} className="animate-spin" /> : isSaved ? <CheckCircle2 size={12} /> : <Zap size={12} />}
                    {isSaving ? "保存中..." : isSaved ? "保存済み" : "Salesforce に保存"}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  数式自動生成タブ
// ════════════════════════════════════════════════════════

const FORMULA_OBJECTS = ["Account", "Opportunity", "Contact", "Lead", "Case", "カスタムオブジェクト"];

const FORMULA_EXAMPLES = [
  { desc: "粗利率を計算したい",                formula: `IF(Amount > 0, (Amount - Cost__c) / Amount * 100, 0)` },
  { desc: "商談金額が100万以上なら「大型案件」", formula: `IF(Amount >= 1000000, "大型案件", "通常案件")` },
  { desc: "姓と名を「姓 名」形式で結合",          formula: `LastName & " " & FirstName` },
];

function FormulaTab() {
  const [object, setObject] = useState("Opportunity");
  const [desc, setDesc] = useState("");
  const [returnType, setReturnType] = useState("Text");
  const [stage, setStage] = useState<"idle" | "generating" | "done">("idle");
  const [formula, setFormula] = useState("");
  const [copied, setCopied] = useState(false);
  const [savedFormulas, setSavedFormulas] = useState(SAVED_FORMULAS);

  const generate = async () => {
    if (!desc.trim()) return;
    setStage("generating");
    await new Promise((r) => setTimeout(r, 1800));
    // Mock generated formula based on description
    const generated = desc.includes("粗利") || desc.includes("利益")
      ? `IF(Amount > 0, (Amount - Cost__c) / Amount * 100, 0)`
      : desc.includes("姓") || desc.includes("名前") || desc.includes("氏名")
      ? `LastName & " " & FirstName`
      : `IF(ISBLANK(${object === "Opportunity" ? "Amount" : "Name"}), "未設定", TEXT(${object === "Opportunity" ? "Amount" : "Name"}))`;
    setFormula(generated);
    setStage("done");
  };

  const copyFormula = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const saveFormula = () => {
    if (!formula || !desc) return;
    setSavedFormulas((prev) => [
      { id: `f${Date.now()}`, name: desc.slice(0, 20), object, formula, createdAt: "2026/02/27" },
      ...prev,
    ]);
    setDesc(""); setFormula(""); setStage("idle");
  };

  return (
    <div className="space-y-4">
      <div className="card p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">対象オブジェクト</label>
            <select value={object} onChange={(e) => setObject(e.target.value)} className="input text-xs">
              {FORMULA_OBJECTS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">戻り値の型</label>
            <select value={returnType} onChange={(e) => setReturnType(e.target.value)} className="input text-xs">
              {["Text", "Number", "Currency", "Percent", "Date", "Checkbox"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1">
            どんな計算・判定をしたいですか？
          </label>
          <textarea
            value={desc}
            onChange={(e) => { setDesc(e.target.value); setStage("idle"); setFormula(""); }}
            placeholder="例: 商談金額が100万以上なら「大型案件」、それ以外は「通常案件」と表示したい"
            className="input resize-none h-20 text-sm"
          />
          {/* サンプル例 */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {FORMULA_EXAMPLES.map((ex) => (
              <button
                key={ex.desc}
                onClick={() => { setDesc(ex.desc); setStage("idle"); setFormula(""); }}
                className="text-[11px] text-primary-600 bg-primary-50 hover:bg-primary-100 px-2 py-0.5 rounded-full transition-colors"
              >
                {ex.desc}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            disabled={!desc.trim() || stage === "generating"}
            onClick={generate}
            className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
              !desc.trim() || stage === "generating"
                ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                : "bg-primary-500 text-white hover:bg-primary-600"
            }`}
          >
            {stage === "generating" ? <Loader2 size={13} className="animate-spin" /> : <Calculator size={13} />}
            {stage === "generating" ? "生成中..." : "数式を生成"}
          </button>
        </div>

        {/* 生成結果 */}
        {stage === "done" && formula && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700">生成された数式</span>
              <div className="flex gap-2">
                <button
                  onClick={copyFormula}
                  className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-700 transition-colors"
                >
                  {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  {copied ? "コピー済み" : "コピー"}
                </button>
                <button
                  onClick={saveFormula}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-200 hover:bg-emerald-300 px-2 py-0.5 rounded-lg transition-colors"
                >
                  <CheckCircle2 size={11} />
                  保存
                </button>
              </div>
            </div>
            <code className="block text-xs text-emerald-800 font-mono bg-white border border-emerald-200 rounded-lg p-3 leading-relaxed break-all">
              {formula}
            </code>
          </div>
        )}
      </div>

      {/* 保存済み数式 */}
      {savedFormulas.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-neutral-100">
            <p className="text-xs font-bold text-neutral-600">保存済み数式</p>
          </div>
          <div className="divide-y divide-neutral-100">
            {savedFormulas.map((f) => (
              <div key={f.id} className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-neutral-700">{f.name}</span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">{f.object}</span>
                  </div>
                  <code className="text-[11px] text-neutral-500 font-mono truncate block">{f.formula}</code>
                </div>
                <span className="text-[11px] text-neutral-400 flex-shrink-0">{f.createdAt}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  重複項目マージタブ
// ════════════════════════════════════════════════════════

function MergeTab() {
  const [candidates, setCandidates] = useState<MergeItem[]>(INITIAL_MERGE_CANDIDATES);
  const [merging, setMerging] = useState<string | null>(null);

  const mergeItem = async (id: string) => {
    setMerging(id);
    await new Promise((r) => setTimeout(r, 1200));
    setMerging(null);
    setCandidates((prev) => prev.map((c) => c.id === id ? { ...c, merged: true } : c));
  };

  const similarityColor = (n: number) =>
    n >= 90 ? "text-red-600 bg-red-100" :
    n >= 80 ? "text-amber-600 bg-amber-100" :
              "text-neutral-600 bg-neutral-100";

  const pending = candidates.filter((c) => !c.merged);
  const done    = candidates.filter((c) => c.merged);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
        <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">
          AI が類似した項目名を検出しました。マージすると <strong>fieldB を廃止して fieldA に統合</strong>します。
          実行前にバックアップを取ることをお勧めします。
        </p>
      </div>

      {pending.length === 0 && done.length > 0 && (
        <div className="flex flex-col items-center py-10 text-neutral-400">
          <CheckCircle2 size={36} className="text-emerald-400 mb-2" />
          <p className="text-sm font-medium text-neutral-600">すべての重複項目をマージしました</p>
        </div>
      )}

      {pending.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-neutral-100 flex items-center justify-between">
            <p className="text-xs font-bold text-neutral-700">検出された重複候補</p>
            <span className="text-[11px] text-neutral-400">{pending.length} 件</span>
          </div>
          <div className="divide-y divide-neutral-100">
            {pending.map((item) => (
              <div key={item.id} className="px-5 py-3.5 flex items-center gap-3">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-xs font-mono text-neutral-800 bg-neutral-100 px-1.5 py-0.5 rounded">
                      {item.fieldA}
                    </code>
                    <ArrowRightLeft size={13} className="text-neutral-400 flex-shrink-0" />
                    <code className="text-xs font-mono text-neutral-800 bg-neutral-100 px-1.5 py-0.5 rounded">
                      {item.fieldB}
                    </code>
                    <span className="text-[10px] text-neutral-500 bg-blue-50 px-1.5 py-0.5 rounded">{item.object}</span>
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${similarityColor(item.similarity)}`}>
                  類似度 {item.similarity}%
                </span>
                <button
                  onClick={() => mergeItem(item.id)}
                  disabled={merging === item.id}
                  className="flex items-center gap-1 text-[11px] font-bold text-white bg-primary-500 hover:bg-primary-600 px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0 disabled:opacity-50"
                >
                  {merging === item.id
                    ? <Loader2 size={11} className="animate-spin" />
                    : <GitMerge size={11} />}
                  マージ
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {done.length > 0 && (
        <div className="card overflow-hidden opacity-60">
          <div className="px-5 py-3 border-b border-neutral-100">
            <p className="text-xs font-bold text-neutral-500">統合済み</p>
          </div>
          <div className="divide-y divide-neutral-100">
            {done.map((item) => (
              <div key={item.id} className="px-5 py-3 flex items-center gap-3">
                <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                <code className="text-xs font-mono text-neutral-500">{item.fieldA}</code>
                <span className="text-[11px] text-neutral-400">← {item.fieldB} を統合</span>
                <span className="ml-auto text-[10px] text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">{item.object}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  メインページ
// ════════════════════════════════════════════════════════

export default function PowerActionsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("lightning");

  const ActiveView = { lightning: LightningTab, formula: FormulaTab, merge: MergeTab }[activeTab];

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="パワーアクション"
        breadcrumb={["Salesforce Automation", "パワーアクション"]}
      />

      <div className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-6">

        {/* タブ */}
        <div className="grid grid-cols-3 gap-2">
          {TABS.map(({ id, icon: Icon, label, desc }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-start gap-1.5 p-3.5 rounded-xl border-2 text-left transition-all ${
                activeTab === id
                  ? "border-primary-400 bg-primary-50"
                  : "border-neutral-200 hover:border-neutral-300 bg-white"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                activeTab === id ? "bg-primary-500" : "bg-neutral-100"
              }`}>
                <Icon size={15} className={activeTab === id ? "text-white" : "text-neutral-500"} />
              </div>
              <p className={`text-xs font-bold leading-snug ${activeTab === id ? "text-primary-700" : "text-neutral-700"}`}>
                {label}
              </p>
              <p className="text-[10px] text-neutral-400 leading-snug">{desc}</p>
            </button>
          ))}
        </div>

        {/* コンテンツ */}
        <ActiveView />
      </div>
    </div>
  );
}
