import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import DemoBanner from "@/components/layout/DemoBanner";
import FeedbackButton from "@/components/layout/FeedbackButton";
import { OrgProvider } from "@/contexts/OrgContext";

export const metadata: Metadata = {
  title: "Salesforce Automation Dashboard",
  description: "自然言語でSalesforceの設定を自動化するAIダッシュボード",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-surface-bg">
        <OrgProvider>
          <DemoBanner />
          <div className="flex h-screen overflow-hidden">
            {/* サイドバー (固定, 幅240px) */}
            <Sidebar />

            {/* メインコンテンツエリア */}
            <main className="flex-1 ml-60 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                {children}
              </div>
            </main>
          </div>
          <FeedbackButton />
        </OrgProvider>
      </body>
    </html>
  );
}
