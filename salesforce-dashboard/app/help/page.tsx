import Header from "@/components/layout/Header";
import {
  LayoutDashboard, MessageSquare, History, Settings,
  HelpCircle, RefreshCw, Bell, Filter, Download,
  Play, X, RotateCcw, ChevronDown, Shield, Zap,
  CheckCircle2,
} from "lucide-react";

// ── 再利用パーツ ─────────────────────────────────────────────────────

function Section({
  icon, title, color, children,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
        <span className={color}>{icon}</span>
        <h2 className="font-bold text-neutral-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function ButtonDesc({
  icon,
  label,
  description,
}: {
  icon?: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl">
      {icon && (
        <span className="text-neutral-500 mt-0.5 flex-shrink-0">{icon}</span>
      )}
      <div>
        <p className="text-sm font-semibold text-neutral-800">{label}</p>
        <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold text-neutral-800">Q: {q}</p>
      <p className="text-xs text-neutral-600 leading-relaxed">A: {a}</p>
    </div>
  );
}

// ── メインページ ─────────────────────────────────────────────────────

export default function HelpPage() {
  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="ヘルプ・ドキュメント"
        breadcrumb={["Salesforce Automation", "ヘルプ"]}
      />

      <div className="p-6 max-w-3xl space-y-5">

        {/* ── アプリ概要バナー ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-primary-400 p-5 text-white">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle size={20} />
              <h2 className="font-bold text-lg">Salesforce Automation とは？</h2>
            </div>
            <p className="text-primary-100 text-sm leading-relaxed">
              日本語で「AccountにCustomer_Scoreという数値項目を追加して」と入力するだけで、
              AIがSalesforceのカスタム項目・権限セット・入力規則などを自動で設定します。
              すべての操作は実行前に確認画面が表示されるため、意図しない変更が起きる心配はありません。
            </p>
          </div>
        </div>

        {/* ── ダッシュボード ── */}
        <Section
          icon={<LayoutDashboard size={18} />}
          title="ダッシュボード"
          color="text-primary-500"
        >
          <p className="text-sm text-neutral-600">
            Salesforce組織の状態を一目で確認できるホーム画面です。
          </p>
          <div className="space-y-2">
            <ButtonDesc
              label="統計カード（上部4枚）"
              description="カスタム項目数・権限セット数・未解決の問題数・今週の自動化実行数を表示します。各カードの下に先週比の増減（↑↓）が表示されます。"
            />
            <ButtonDesc
              label="Org ヘルス"
              description="Salesforce組織の使用状況（カスタム項目の上限消費率・API呼び出し数など）を円グラフで表示します。緑＝正常、黄＝注意、赤＝警告です。上限に近づくと自動で色が変わります。"
            />
            <ButtonDesc
              label="クイックアクション"
              description="「カスタム項目を追加」など、よく使う操作へのショートカットです。クリックするとチャット画面に移動し、質問の下書きが自動入力されます。"
            />
            <ButtonDesc
              icon={<RefreshCw size={14} />}
              label="同期ボタン（↻ アイコン）"
              description="SalesforceのOrg情報を最新の状態に更新します。ダッシュボードの数値が古くなったときにクリックしてください。"
            />
            <ButtonDesc
              icon={<Bell size={14} />}
              label="通知ベル（🔔 アイコン）"
              description="未読の通知件数を赤いバッジで表示します。実行完了・エラー発生などのお知らせが届いたときにクリックして内容を確認してください。"
            />
            <ButtonDesc
              label="チャットで自動化ボタン（右上）"
              description="チャット自動化画面に移動します。AIへの指示入力はここから行います。"
            />
          </div>
        </Section>

        {/* ── チャット自動化 ── */}
        <Section
          icon={<MessageSquare size={18} />}
          title="チャット自動化"
          color="text-primary-500"
        >
          <p className="text-sm text-neutral-600">
            AIに日本語で指示を出してSalesforceを操作するメイン機能です。
          </p>
          <div className="space-y-2">
            <ButtonDesc
              label="指示入力欄（テキストエリア）"
              description="「AccountにScore__c数値項目を追加して」のように日本語で指示を入力します。Enter で送信、Shift+Enter で改行できます。具体的なAPI名・オブジェクト名を書くとAIの解析精度が上がります。"
            />
            <ButtonDesc
              label="クイック例ボタン（初回表示）"
              description="よく使う指示の例がボタンとして並んでいます。クリックするとそのテキストが入力欄に反映されます。参考にして書き換えてもOKです。"
            />
            <ButtonDesc
              label="AI解析結果カード"
              description="AIが指示の内容を解析した結果を表示します。操作の種類・対象オブジェクト・項目名などが意図通りか必ず確認してください。"
            />
            <ButtonDesc
              label="信頼度 (%)"
              description="AIが指示をどれくらい正確に理解できたかを示す数値です。85%以上で緑、70〜84%で黄、70%未満で赤になります。低い場合は指示をより具体的に書き直してください。"
            />
            <ButtonDesc
              icon={<Play size={14} />}
              label="「実行する」ボタン（解析結果カード内）"
              description="確認モーダルを開きます。この時点ではまだSalesforceへの変更は行われません。モーダルで内容を最終確認してから「実行する」を押してはじめて反映されます。"
            />
            <ButtonDesc
              icon={<X size={14} />}
              label="「キャンセル」ボタン"
              description="操作を取り消してチャットに戻ります。Salesforceへの変更は行われません。"
            />
            <ButtonDesc
              icon={<RotateCcw size={14} />}
              label="リセットボタン（↺ アイコン、入力欄左）"
              description="会話の履歴をすべて消去して最初からやり直します。入力中のテキストも消えますのでご注意ください。"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 leading-relaxed">
            <strong>⚠️ 重要:</strong> 本番環境では必ず「DRY RUN モード」（設定画面で有効化）で動作確認してから実行してください。
            削除操作は元に戻せません。
          </div>
        </Section>

        {/* ── 実行履歴 ── */}
        <Section
          icon={<History size={18} />}
          title="実行履歴"
          color="text-purple-500"
        >
          <p className="text-sm text-neutral-600">
            過去に実行したすべての自動化操作のログを確認できます。監査・トラブルシューティングにご活用ください。
          </p>
          <div className="space-y-2">
            <ButtonDesc
              label="サマリーバッジ（総実行数 / 成功 / 失敗 / DRY RUN）"
              description="集計期間内の操作結果のサマリーです。成功率の確認や異常の早期発見にお役立てください。"
            />
            <ButtonDesc
              icon={<Filter size={14} />}
              label="フィルターボタン"
              description="操作の種類・実行ユーザー・日付などでログを絞り込みます。特定の操作だけを確認したいときに使います。"
            />
            <ButtonDesc
              icon={<Download size={14} />}
              label="エクスポートボタン"
              description="実行履歴をCSV形式でダウンロードします。社内の監査ログとして保管・提出するときにご利用ください。"
            />
          </div>

          {/* ステータスバッジ凡例 */}
          <div>
            <p className="text-xs font-semibold text-neutral-600 mb-2">操作種別バッジの見方</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "ADD_FIELD",       color: "bg-primary-100 text-primary-700", desc: "カスタム項目の追加" },
                { label: "MODIFY_FIELD",    color: "bg-blue-100 text-blue-700",       desc: "カスタム項目の変更" },
                { label: "DELETE_FIELD",    color: "bg-red-100 text-red-700",         desc: "カスタム項目の削除" },
                { label: "PERMISSION_SET",  color: "bg-purple-100 text-purple-700",   desc: "権限セットの変更" },
                { label: "VALIDATION_RULE", color: "bg-orange-100 text-orange-700",   desc: "入力規則の操作" },
                { label: "DRY RUN",         color: "bg-neutral-100 text-neutral-600", desc: "書き込みなしのテスト" },
              ].map(({ label, color, desc }) => (
                <div key={label} className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${color}`}>{label}</span>
                  <span className="text-neutral-500">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── 設定 ── */}
        <Section
          icon={<Settings size={18} />}
          title="設定"
          color="text-neutral-500"
        >
          <div className="space-y-2">
            <ButtonDesc
              label="環境切り替え（本番 / サンドボックス）"
              description="接続先のSalesforce環境を選択します。本番は実データ、サンドボックスはテスト専用の環境です。初めて試す場合は必ずサンドボックスを推奨します。"
            />
            <ButtonDesc
              label="セキュリティトークン"
              description="SalesforceのAPIアクセスに必要な英数字の文字列です。Salesforceにログイン → 右上アイコン →「設定」→「個人設定」→「私のセキュリティトークンのリセット」をクリックすると登録メールアドレスに届きます。"
            />
            <ButtonDesc
              label="接続テストボタン"
              description="入力したユーザー名・パスワード・セキュリティトークンでSalesforceへの接続を確認します。「接続成功」と表示されれば準備OKです。設定を保存する前に必ずテストしてください。"
            />
            <ButtonDesc
              label="信頼度しきい値（スライダー）"
              description="AIの解析信頼度がこの値を下回った場合に追加の確認ダイアログを表示します。デフォルトは70%。本番環境では80%以上に設定することを推奨します。"
            />
            <ButtonDesc
              icon={<Shield size={14} />}
              label="DRY RUN モード（トグル）"
              description="有効にするとAIが「実行する」を押してもSalesforceへの実際の書き込みは行われません。代わりに何が変更されるかの確認レポートのみが出力されます。本番環境での初回テストに最適です。"
            />
            <ButtonDesc
              icon={<ChevronDown size={14} />}
              label="詳細設定（折りたたみ）"
              description="Connected App (Consumer Key/Secret) や JWT 秘密鍵など、高度な認証方式を使う場合に入力します。通常のユーザー名/パスワード認証のみを使う場合は展開不要です。"
            />
          </div>
        </Section>

        {/* ── 対応操作一覧 ── */}
        <Section
          icon={<Zap size={18} />}
          title="対応している操作一覧"
          color="text-orange-500"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: "カスタム項目の追加",        desc: "オブジェクトに新しい項目を作成" },
              { label: "カスタム項目の更新",        desc: "既存項目のラベル・型などを変更" },
              { label: "カスタム項目の削除",        desc: "不要な項目を削除（元に戻せません）" },
              { label: "権限セットの作成",          desc: "新しい権限セットを作成" },
              { label: "権限セットの更新",          desc: "既存の権限セットにアクセス権を追加" },
              { label: "入力規則の作成",            desc: "データ入力時のバリデーションを設定" },
              { label: "入力規則の有効化/無効化",   desc: "既存の入力規則をオン・オフ切り替え" },
              { label: "オブジェクト情報の参照",    desc: "項目一覧・設定内容を確認（読み取り専用）" },
              { label: "Apex 匿名実行",             desc: "高度なSalesforceコードを実行（上級者向け）" },
              { label: "フローの有効化/無効化",     desc: "既存のフローをオン・オフ切り替え" },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-start gap-2 p-3 bg-neutral-50 rounded-xl">
                <CheckCircle2 size={14} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-neutral-800">{label}</p>
                  <p className="text-[11px] text-neutral-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── よくある質問 ── */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <HelpCircle size={18} className="text-amber-500" />
            <h2 className="font-bold text-neutral-900">よくある質問</h2>
          </div>
          <div className="space-y-4 divide-y divide-neutral-100">
            {[
              {
                q: "セキュリティトークンが見つからない / 届かない",
                a: "Salesforceにログイン → 右上のアイコン →「設定」→ 左メニューの「個人設定」→「私のセキュリティトークンのリセット」をクリックすると登録メールアドレスに届きます。迷惑メールフォルダも確認してください。",
              },
              {
                q: "信頼度が低い（赤色）が表示された",
                a: "AIが指示内容を正確に解析できなかった可能性があります。「対象のオブジェクト名（例: Account）」「項目のAPI名（例: Score__c）」「操作内容（追加・変更・削除）」をより具体的に記載するか、キャンセルして書き直してください。",
              },
              {
                q: "DRY RUNとは何ですか？",
                a: "実際にSalesforceを変更せずに操作内容をシミュレーションできるモードです。設定画面でDRY RUNをオンにすると、「実行する」を押しても変更は保存されず、確認レポートのみが出力されます。",
              },
              {
                q: "削除した項目を元に戻せますか？",
                a: "Salesforceのカスタム項目の削除は原則として元に戻せません。削除操作を行う前に、必ずDRY RUNモードで内容を確認するか、Salesforce側でバックアップを取ってください。",
              },
              {
                q: "サンドボックスと本番の違いは？",
                a: "サンドボックスはテスト専用の環境です。本番データには一切影響しません。新しい操作を試す場合は必ずサンドボックスで確認してから本番に適用することを強く推奨します。",
              },
              {
                q: "接続テストが「失敗」になる",
                a: "①パスワードが正しいか確認 ②セキュリティトークンが最新か確認（パスワードを変更するとトークンも無効になります） ③環境（本番/サンドボックス）の選択が正しいか確認 してください。",
              },
            ].map(({ q, a }) => (
              <div key={q} className="pt-4 first:pt-0">
                <FAQ q={q} a={a} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
