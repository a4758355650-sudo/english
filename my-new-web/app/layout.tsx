// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/app/auth-provider";

export const metadata: Metadata = {
  title: "多益單字高效學習系統",
  description: "雲端智慧錯題同步",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body style={{ margin: 0, padding: 0, backgroundColor: "#fdfcf9" }}>
        {/* 把導覽列固定在這裡，這是所有頁面共用的 */}
        <nav style={{ padding: "15px", borderBottom: "1px solid #ccc", background: "#fff" }}>
           {/* 你的導覽列連結放在這 */}
           <a href="/">首頁</a> | <a href="/page1">練習1</a> | <a href="/profile">個人</a>
        </nav>
        
        {/* 這邊只剩下內容，不會再被 Navbar 的 CSS 影響 */}
        <AuthProvider>
           {children}
        </AuthProvider>
      </body>
    </html>
  );
}