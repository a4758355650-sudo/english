"use client";
import { useEffect, useState } from "react";
import { auth } from "@/utils/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push("/login");
      setUser(currentUser);
    });
  }, [router]);

  return (
    <main style={{ maxWidth: "500px", margin: "50px auto", padding: "40px", background: "white", border: "1px solid #000", borderRadius: "0px" }}>
      <h2 style={{ color: "#000", fontSize: "24px" }}>👤 個人中心</h2>
      <div style={{ margin: "20px 0", padding: "20px", border: "1px solid #000", background: "#f9f9f9" }}>
        <p style={{ color: "#000", fontWeight: "bold" }}>電子郵件：{user?.email}</p>
        <p style={{ color: "#000", fontSize: "12px" }}>UID：{user?.uid}</p>
      </div>
      <button 
        onClick={() => signOut(auth)}
        style={{ width: "100%", padding: "16px", background: "#000", color: "#fff", border: "none", cursor: "pointer", fontWeight: "bold" }}
      >
        登出系統
      </button>
    </main>
  );
}