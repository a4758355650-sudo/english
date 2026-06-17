"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/utils/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "100px", fontSize: "20px", color: "#12343b" }}>系統安全載入中...</div>;
  }

  return (
    <>
      <style>{`
        .global-nav { background: #12343b; padding: 14px 24px; display: flex; gap: 4px; align-items: center; box-shadow: 0 8px 28px rgba(18, 52, 59, 0.18); }
        .nav-link { color: #eef7f6; text-decoration: none; padding: 9px 12px; border-radius: 6px; font-size: 14px; font-weight: bold; transition: all 0.15s; }
        .nav-link:hover { background: rgba(255, 255, 255, 0.15); color: white; }
        .nav-brand { margin-right: auto; color: white; font-size: 16px; font-weight: bold; padding-right: 20px; }
        .user-zone { display: flex; align-items: center; gap: 12px; margin-left: auto; }
        .btn-logout { background: #c7673c; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; }
      `}</style>

      <nav className="global-nav">
        <div className="nav-brand">📈 多益單字衝刺站</div>
        <Link href="/" className="nav-link">🏠 首頁</Link>
        <Link href="/page1" className="nav-link">📖 全部單字練習</Link>
        <Link href="/page2" className="nav-link">🎲 選擇題抽考</Link>
        <Link href="/page3" className="nav-link">🎯 不熟悉單字</Link>
        <Link href="/profile" className="nav-link">👤 個人中心</Link>
        
        <div className="user-zone">
          {user ? (
            <>
              <span style={{ color: "#fff", fontSize: "14px" }}>👤 <strong>{user.email?.split("@")[0]}</strong> 同學</span>
              <button className="btn-logout" onClick={handleLogout}>登出</button>
            </>
          ) : (
            <Link href="/login" className="nav-link" style={{ background: "#2f6f73" }}>🔐 會員登入</Link>
          )}
        </div>
      </nav>

      {children}
    </>
  );
}