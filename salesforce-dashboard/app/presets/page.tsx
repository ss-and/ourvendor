"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bookmark, Plus, Search, ArrowRight, Layers,
  Shield, AlertTriangle, FileSearch, MoreHorizontal,
  PlayCircle, Pencil, Trash2, X, Save,
} from "lucide-react";
import Header from "@/components/layout/Header";
import { presets as initialPresets } from "@/lib/mockData";
import type { Preset, PresetCategory } from "@/lib/types";

// ── カテゴリ定義 ─────────────────────────────────────────

const CATEGORIES: { key: PresetCategory | "all"; label: string; icon: React.ReactNode }[] = [
  { key: "all",        label: "すべて",       icon: <Bookmark size={15} /> },
  { key: "field",      label: "項目操作",     icon: <Layers size={15} /> },
  { key: "permission", label: "権限管理",     icon: <Shield size={15} /> },
  { key: "validation", label: "入力規則",     icon: <AlertTriangle size={15} /> },
  { key: "describe",   label: "オブジェクト参照", icon: <FileSearch size={15} /> },
  { key: "other",      label: "その他",       icon: <MoreHorizontal size={15} /> },
];

const CATEGORY_COLORS: Record<PresetCategory, string> = {
  field:      "bg-blue-100 text-blue-700",
  permission: "bg-purple-100 text-purple-700",
  validation: "bg-amber-100 text-amber-700",
  describe:   "bg-emerald-100 text-emerald-700",
  other:      "bg-neutral-100 text-neutral-600",
};

const CATEGORY_LABELS: Record<PresetCategory, string> = {
  field:      "項目操作",
  permission: "権限管理",
  validation: "入力規則",
  describe:   "オブジェクト参照",
  other:      "その他",
};

// ── メインページ ─────────────────────────────────────────

export default function PresetsPage() {
  const [presets, setPresets] = useState<Preset[]>(initialPresets);
  const [activeCategory, setActiveCategory] = useState<PresetCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editTarget, setEditTarget] = useState<Preset | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // フィルタリング
  const filtered = presets.filter((p) => {
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.prompt.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  function deletePreset(id: string) {
    setPresets((prev) => prev.filter((p) => p.id !== id));
    setMenuOpenId(null);
  }

  function savePreset(data: Omit<Preset, "id" | "usedCount" | "createdAt">) {
    if (editTarget) {
      setPresets((prev) =>
        prev.map((p) => (p.id === editTarget.id ? { ...p, ...data } : p))
      );
      setEditTarget(null);
    } else {
      const newPreset: Preset = {
        ...data,
        id: `preset-${Date.now()}`,
        usedCount: 0,
        createdAt: new Date(),
      };
      setPresets((prev) => [newPreset, ...prev]);
      setShowCreateModal(false);
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="プリセット管理"
        breadcrumb={["Salesforce Automation", "プリセット"]}
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <Plus size={15} />
            新規プリセット
          </button>
        }
      />

      <div className="flex-1 p-6 space-y-5">

        {/* ── 検索 ──────────────────────────────────────── */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="タイトル・プロンプト・タグで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
          />
        </div>

        {/* ── カテゴリフィルタ ───────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                activeCategory === key
                  ? "bg-primary-500 text-white border-primary-500"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-primary-300 hover:text-primary-600"
              }`}
            >
              {icon}
              {label}
              <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeCategory === key ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-500"
              }`}>
                {key === "all"
                  ? presets.length
                  : presets.filter((p) => p.category === key).length}
              </span>
            </button>
          ))}
        </div>

        {/* ── プリセット一覧 ─────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-16 text-neutral-400">
            <Bookmark size={36} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">プリセットが見つかりません</p>
            <p className="text-xs mt-1">検索条件を変えるか、新規作成してください</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((preset) => (
              <div
                key={preset.id}
                className="card p-4 flex flex-col gap-3 hover:border-primary-300 transition-colors relative group"
                onClick={() => setMenuOpenId(null)}
              >
                {/* ヘッダ行 */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className={`badge text-[10px] mb-1.5 ${CATEGORY_COLORS[preset.category]}`}>
                      {CATEGORY_LABELS[preset.category]}
                    </span>
                    <h3 className="text-sm font-bold text-neutral-900 leading-snug">{preset.title}</h3>
                  </div>

                  {/* ケバブメニュー */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === preset.id ? null : preset.id);
                      }}
                      className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="操作メニュー"
                    >
                      <MoreHorizontal size={15} />
                    </button>
                    {menuOpenId === preset.id && (
                      <div
                        className="absolute right-0 top-8 z-20 w-36 bg-white border border-neutral-200 rounded-xl shadow-modal py-1 animate-fade-in"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => { setEditTarget(preset); setMenuOpenId(null); }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50"
                        >
                          <Pencil size={13} /> 編集
                        </button>
                        <button
                          onClick={() => deletePreset(preset.id)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={13} /> 削除
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* プロンプトプレビュー */}
                <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed flex-1">
                  {preset.prompt}
                </p>

                {/* タグ */}
                {preset.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {preset.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 text-[10px] font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* フッタ */}
                <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                  <span className="text-[11px] text-neutral-400">{preset.usedCount}回使用</span>
                  <Link
                    href={`/chat?q=${encodeURIComponent(preset.prompt)}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 text-xs font-semibold hover:bg-primary-500 hover:text-white transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <PlayCircle size={12} />
                    実行する
                    <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 新規作成 / 編集モーダル ───────────────────────── */}
      {(showCreateModal || editTarget) && (
        <PresetModal
          initial={editTarget ?? undefined}
          onSave={savePreset}
          onClose={() => { setShowCreateModal(false); setEditTarget(null); }}
        />
      )}
    </div>
  );
}

// ── PresetModal ──────────────────────────────────────────

interface PresetModalProps {
  initial?: Preset;
  onSave: (data: Omit<Preset, "id" | "usedCount" | "createdAt">) => void;
  onClose: () => void;
}

function PresetModal({ initial, onSave, onClose }: PresetModalProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [prompt, setPrompt] = useState(initial?.prompt ?? "");
  const [category, setCategory] = useState<PresetCategory>(initial?.category ?? "field");
  const [tagsInput, setTagsInput] = useState(initial?.tags.join(", ") ?? "");

  function handleSubmit() {
    if (!title.trim() || !prompt.trim()) return;
    onSave({
      title: title.trim(),
      prompt: prompt.trim(),
      category,
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-modal animate-slide-up mx-4">
        {/* ヘッダ */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2 className="font-bold text-neutral-900">
            {initial ? "プリセットを編集" : "新規プリセットを作成"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* フォーム */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">タイトル</label>
            <input
              className="input"
              placeholder="例: Account に数値項目を追加"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">カテゴリ</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter((c) => c.key !== "all").map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setCategory(key as PresetCategory)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    category === key
                      ? "bg-primary-500 text-white border-primary-500"
                      : "bg-white text-neutral-600 border-neutral-200 hover:border-primary-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">
              プロンプト
              <span className="text-neutral-400 font-normal ml-1">（チャットに送る指示文）</span>
            </label>
            <textarea
              className="input resize-none h-28 text-sm"
              placeholder="例: AccountにCustomer_Score__c数値項目を追加して"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">
              タグ
              <span className="text-neutral-400 font-normal ml-1">（カンマ区切り）</span>
            </label>
            <input
              className="input"
              placeholder="例: Account, Number"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>
        </div>

        {/* フッタ */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-neutral-100">
          <button onClick={onClose} className="btn-ghost">キャンセル</button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !prompt.trim()}
            className="btn-primary"
          >
            <Save size={14} />
            {initial ? "変更を保存" : "作成する"}
          </button>
        </div>
      </div>
    </div>
  );
}
