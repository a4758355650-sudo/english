"use client";

import { useEffect, useState } from "react";
import { auth } from "@/utils/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) router.push("/login");
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) return <div style={{ padding: 50, textAlign: "center" }}>載入中...</div>;

  return (
    // 在 profile/page.tsx 裡，把原本圓角的 style 簡化為：
    <main style={{
      maxWidth: "500px",
      margin: "50px auto",
      padding: "40px",
      background: "white",
      border: "1px solid #000000" // 極簡風：單像素黑框
    }}>
      <h2 style={{ fontWeight: "700" }}>個人中心</h2>
      <div style={{ margin: "30px 0", padding: "20px", border: "1px solid #000000" }}>
        <p>電子郵件：{user?.email}</p>
        <p>UID：{user?.uid}</p>
      </div>
      <button
        onClick={handleSignOut}
        style={{
          width: "100%", padding: "16px", background: "white", border: "1px solid #000000",
          cursor: "pointer", fontWeight: "600"
        }}
      >
        登出系統
      </button>
    </main>
  );
}