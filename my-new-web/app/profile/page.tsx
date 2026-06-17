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
    <main style={{ maxWidth: "500px", margin: "50px auto", padding: "30px", background: "white", borderRadius: "12px", border: "1px solid #d8dee8" }}>
      <h2 style={{ color: "#2f6f73" }}>👤 個人中心</h2>
      <div style={{ margin: "20px 0", padding: "15px", background: "#f8fafc", borderRadius: "8px" }}>
        <p><strong>電子郵件：</strong> {user?.email}</p>
        <p style={{ fontSize: "12px", color: "#64748b" }}><strong>UID：</strong> {user?.uid}</p>
      </div>
      <button 
        onClick={handleSignOut}
        style={{ width: "100%", padding: "12px", background: "#e11d48", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
      >
        登出系統
      </button>
    </main>
  );
}