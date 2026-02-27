"use client";

import { useState, useRef } from "react";
import Header from "@/components/layout/Header";
import {
  FileText, Upload, Sparkles, CheckCircle2, ChevronRight,
  AlertCircle, Zap, Package, Users, BarChart3, Loader2,
  X, FileUp, Lock, ExternalLink,
} from "lucide-react";

// ── モック: 解析結果 ────────────────────────────────────────

const MOCK_REQUIREMENTS = [
  { id: "r1", category: "オブジェクト設計",   text: "営業案件（Opportunity）にカスタム項目「競合社名」「商談確度コメント」を追加する" },
  { id: "r2", category: "プロセス自動化",      text: "案件ステージが「提案中」→「交渉中」に変わった際、担当上長へ自動メール通知を送る" },
  { id: "r3", category: "承認フロー",          text: "割引率 20% 以上の案件は営業部長の承認を必須とする" },
  { id: "r4", category: "ダッシュボード",       text: "週次売上サマリーと進行中案件ランキングをトップページに表示する" },
  { id: "r5", category: "権限設定",            text: "パートナーユーザーは自社関連案件のみ閲覧可能とし、編集は不可にする" },
  { id: "r6", category: "レポート",            text: "月次の製品別受注金額レポートを自動生成して経営陣へ配布する" },
];

const MOCK_GENERATED = [
  {
    id: "g1",
    icon: Package,
    color: "bg-blue-500",
    label: "カスタム項目 追加",
    detail: "Opportunity: 競合社名 (Text), 商談確度コメント (TextArea)",
    status: "ready",
  },
  {
    id: "g2",
    icon: Zap,
    color: "bg-violet-500",
    label: "フロー作成",
    detail: "ステージ変更トリガー → 上長メール通知（Record-Triggered Flow）",
    status: "ready",
  },
  {
    id: "g3",
    icon: CheckCircle2,
    color: "bg-emerald-500",
    label: "承認プロセス 設定",
    detail: "割引率 ≥ 20% → 営業部長に承認依頼（Approval Process）",
    status: "ready",
  },
  {
    id: "g4",
    icon: BarChart3,
    color: "bg-amber-500",
    label: "ダッシュボード 作成",
    detail: "週次売上サマリー + 案件ランキングコンポーネント（Lightning Dashboard）",
    status: "ready",
  },
  {
    id: "g5",
    icon: Users,
    color: "bg-rose-500",
    label: "権限セット 設定",
    detail: "パートナープロファイル: Opportunity 読み取り専用、共有ルール適用",
    status: "ready",
  },
  {
    id: "g6",
    icon: FileText,
    color: "bg-teal-500",
    label: "レポート + スケジュール",
    detail: "製品別受注金額レポート → 月次自動配信（Report Schedule）",
    status: "ready",
  },
];

// ── ステート型 ───────────────────────────────────────────────

type Stage = "idle" | "uploaded" | "analyzing" | "analyzed" | "generating" | "done";

// ── コンポーネント ────────────────────────────────────────────

export default function SpecGeneratorPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [fileName, setFileName] = useState<string>("");
  const [checkedReqs, setCheckedReqs] = useState<Set<string>>(new Set(MOCK_REQUIREMENTS.map((r) => r.id)));
  const [deployedItems, setDeployedItems] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    setStage("uploaded");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const runAnalyze = () => {
    setStage("analyzing");
    setTimeout(() => setStage("analyzed"), 2200);
  };

  const runGenerate = () => {
    setStage("generating");
    setTimeout(() => setStage("done"), 2800);
  };

  const toggleReq = (id: string) => {
    setCheckedReqs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const deployItem = (id: string) => {
    setDeployedItems((prev) => new Set([...prev, id]));
  };

  const deployAll = () => {
    setDeployedItems(new Set(MOCK_GENERATED.map((g) => g.id)));
  };

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="仕様書から自動生成"
        breadcrumb={["Salesforce Automation", "仕様書から自動生成"]}
      />

      <div className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-6">

        {/* ── ヘッダバナー ── */}
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-5 text-white shadow-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-base">Phase 3 — 仕様書から自動生成</p>
                <span className="text-[10px] font-bold bg-white/25 px-2 py-0.5 rounded-full">BETA</span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                業務フロー・機能要件書（PDF / Word / テキスト）をアップロードすると、
                AI が要件を解析して Salesforce の設定を自動で構築します。
              </p>
            </div>
          </div>
        </div>

        {/* ── BYOL 必要バナー（未接続時） ── */}
        {stage === "idle" && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50">
            <Lock size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-700 leading-relaxed">
              <span className="font-bold">BYOL 接続が必要です。</span>
              {"  "}設定 → AI 設定 → BYOL を有効にして API キーを登録すると利用できます。
              <a href="/settings" className="inline-flex items-center gap-1 ml-1 font-semibold underline hover:no-underline">
                設定へ <ExternalLink size={10} />
              </a>
            </div>
          </div>
        )}

        {/* ── ステップインジケーター ── */}
        <div className="flex items-center gap-2 text-xs">
          {(["ファイルアップロード", "要件解析", "設定生成"] as const).map((step, i) => {
            const stepStage = ([
              ["idle", "uploaded"],
              ["analyzing", "analyzed"],
              ["generating", "done"],
            ][i]) as Stage[];
            const active = stepStage.includes(stage);
            const done =
              (i === 0 && ["analyzing","analyzed","generating","done"].includes(stage)) ||
              (i === 1 && ["generating","done"].includes(stage)) ||
              (i === 2 && stage === "done");
            return (
              <div key={step} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold transition-colors ${
                  done   ? "bg-emerald-100 text-emerald-700" :
                  active ? "bg-amber-100 text-amber-700"     :
                           "bg-neutral-100 text-neutral-400"
                }`}>
                  {done ? <CheckCircle2 size={11} /> : <span className="w-3.5 text-center">{i + 1}</span>}
                  {step}
                </div>
                {i < 2 && <ChevronRight size={13} className="text-neutral-300 flex-shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* ── STEP 1: アップロード ── */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-neutral-800 flex items-center gap-2">
            <FileUp size={16} className="text-amber-500" />
            ファイルをアップロード
          </h2>

          {stage === "idle" || stage === "uploaded" ? (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
                  isDragging ? "border-amber-400 bg-amber-50" : "border-neutral-200 hover:border-amber-300 hover:bg-amber-50/50"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Upload size={20} className="text-amber-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-neutral-700">
                    {isDragging ? "ここにドロップ" : "ドラッグ & ドロップ、またはクリックして選択"}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">PDF, Word (.docx), テキスト (.txt) — 最大 50MB</p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
              </div>

              {stage === "uploaded" && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium">
                    <FileText size={14} />
                    {fileName}
                  </div>
                  <button onClick={() => { setStage("idle"); setFileName(""); }}>
                    <X size={14} className="text-neutral-400 hover:text-neutral-600 transition-colors" />
                  </button>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  disabled={stage !== "uploaded"}
                  onClick={runAnalyze}
                  className={`btn-primary transition-opacity ${stage !== "uploaded" ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <Sparkles size={14} />
                  AI で要件を解析する
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 font-medium">
              <CheckCircle2 size={14} />
              {fileName} — アップロード完了
            </div>
          )}
        </div>

        {/* ── STEP 2: 解析中 / 解析結果 ── */}
        {(stage === "analyzing" || stage === "analyzed" || stage === "generating" || stage === "done") && (
          <div className="card p-5 space-y-4">
            <h2 className="font-bold text-neutral-800 flex items-center gap-2">
              <Sparkles size={16} className="text-violet-500" />
              抽出された要件
              {stage === "analyzing" && (
                <Loader2 size={14} className="animate-spin text-violet-400 ml-1" />
              )}
            </h2>

            {stage === "analyzing" ? (
              <div className="space-y-2">
                {[80, 60, 90, 50].map((w, i) => (
                  <div key={i} className="h-4 bg-neutral-100 rounded-full animate-pulse" style={{ width: `${w}%` }} />
                ))}
                <p className="text-xs text-neutral-400 mt-2 animate-pulse">ドキュメントを解析中...</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-neutral-500">
                  AI が {MOCK_REQUIREMENTS.length} 件の要件を検出しました。
                  不要な要件のチェックを外してから「設定を生成」してください。
                </p>
                <div className="space-y-2">
                  {MOCK_REQUIREMENTS.map((req) => (
                    <label
                      key={req.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        checkedReqs.has(req.id)
                          ? "bg-violet-50 border-violet-200"
                          : "bg-neutral-50 border-neutral-200 opacity-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checkedReqs.has(req.id)}
                        onChange={() => toggleReq(req.id)}
                        className="mt-0.5 accent-violet-500 flex-shrink-0"
                      />
                      <div>
                        <span className="text-[10px] font-bold text-violet-500 bg-violet-100 px-1.5 py-0.5 rounded mr-1.5">
                          {req.category}
                        </span>
                        <span className="text-xs text-neutral-700">{req.text}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {(stage === "analyzed") && (
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-neutral-400">
                      {checkedReqs.size} / {MOCK_REQUIREMENTS.length} 件を選択中
                    </p>
                    <button
                      disabled={checkedReqs.size === 0}
                      onClick={runGenerate}
                      className={`btn-primary transition-opacity ${checkedReqs.size === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      <Zap size={14} />
                      Salesforce 設定を生成する
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── STEP 3: 生成中 / 生成結果 ── */}
        {(stage === "generating" || stage === "done") && (
          <div className="card p-5 space-y-4">
            <h2 className="font-bold text-neutral-800 flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              生成された Salesforce 設定
              {stage === "generating" && (
                <Loader2 size={14} className="animate-spin text-amber-400 ml-1" />
              )}
            </h2>

            {stage === "generating" ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-neutral-100 rounded-xl animate-pulse" />
                ))}
                <p className="text-xs text-neutral-400 animate-pulse">Salesforce 設定を構築中...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-neutral-500">
                    {MOCK_GENERATED.length} 件の設定が生成されました。個別または一括で Salesforce へ適用できます。
                  </p>
                  <button
                    onClick={deployAll}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <CheckCircle2 size={12} />
                    すべて適用
                  </button>
                </div>

                <div className="space-y-2">
                  {MOCK_GENERATED.map(({ id, icon: Icon, color, label, detail }) => {
                    const deployed = deployedItems.has(id);
                    return (
                      <div
                        key={id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                          deployed ? "bg-emerald-50 border-emerald-200" : "bg-neutral-50 border-neutral-200"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
                          <Icon size={14} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-neutral-800">{label}</p>
                          <p className="text-[11px] text-neutral-500 truncate">{detail}</p>
                        </div>
                        {deployed ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg flex-shrink-0">
                            <CheckCircle2 size={11} />
                            適用済み
                          </span>
                        ) : (
                          <button
                            onClick={() => deployItem(id)}
                            className="flex items-center gap-1 text-[11px] font-bold text-white bg-primary-500 hover:bg-primary-600 px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
                          >
                            <Zap size={11} />
                            適用
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {deployedItems.size > 0 && (
                  <div className="flex items-start gap-2 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700">
                    <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                    <span>
                      適用された設定は Salesforce の開発サンドボックスに書き込まれました。
                      本番反映前にテスト環境で動作確認することをお勧めします。
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
