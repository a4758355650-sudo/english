import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/app/auth-provider";
import Link from "next/link"; // 建議使用 next/link

export const metadata: Metadata = {
  title: "多益單字高效學習系統",
  description: "雲端智慧錯題同步",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body style={{ margin: 0, padding: 0, backgroundColor: "#fdfcf9" }}>
        <AuthProvider>
          {/* 統一的導航列，放在這裡就不會跟頁面內容衝突 */}
          <nav style={{ padding: "15px 30px", borderBottom: "1px solid #ddd", background: "#0f2e30", display: "flex", gap: "20px" }}>
            <Link href="/" style={{ color: "white", textDecoration: "none" }}>首頁</Link>
            <Link href="/page1" style={{ color: "white", textDecoration: "none" }}>全部單字練習</Link>
            <Link href="/page2" style={{ color: "white", textDecoration: "none" }}>選擇題抽考</Link>
            <Link href="/profile" style={{ color: "white", textDecoration: "none" }}>個人中心</Link>
          </nav>
          
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}