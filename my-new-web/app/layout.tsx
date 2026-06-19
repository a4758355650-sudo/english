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
        {/* 這裡不要放任何 <nav>，AuthProvider 內部已經有了 */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}