"use client";

import { useState, useEffect } from "react";
import { auth } from "@/utils/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg("");
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) return setErrorMsg("請填寫完整資訊");
    setIsSubmitting(true);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      } else {
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
      }
      router.push("/");
      router.refresh();
    } catch (error: any) {
      setIsSubmitting(false);
      setErrorMsg("登入失敗，請檢查帳號密碼");
    }
  };

  if (user) {
    return (
      <div style={{ textAlign: "center", padding: "100px", border: "1px solid #000", margin: "50px" }}>
        <h2>已登入</h2>
        <button onClick={() => { router.push("/"); router.refresh(); }} style={{ background: "#000", color: "#fff", padding: "10px 20px", cursor: "pointer" }}>返回首頁</button>
      </div>
    );
  }

  return (
    <>
      

      <div className="login-card">
        <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>{isRegister ? "註冊" : "登入"}</h2>
        {errorMsg && <div style={{ border: "1px solid #000", padding: "8px", marginBottom: "10px" }}>⚠️ {errorMsg}</div>}
        <form onSubmit={handleAuth}>
          <input type="email" className="login-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" className="login-input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="btn-login">{isSubmitting ? "..." : "確認"}</button>
        </form>
        <button className="toggle-link" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "已有帳號？登入" : "沒有帳號？註冊"}
        </button>
      </div>
    </>
  );
}