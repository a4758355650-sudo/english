// my-new-web/src/app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { auth } from "@/utils/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation"; // 引入 Next.js 官方的路由跳轉

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // 防止重複點擊

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
    const trimmedEmail = email.trim(); // 自動清除信箱前後不小心按到的空白鍵
    
    if (!trimmedEmail || !password) {
      return setErrorMsg("請填寫完整信箱與密碼！");
    }
    
    setIsSubmitting(true);
    
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        alert("註冊成功！");
      } else {
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
      }
      
      // 使用 Next.js 官方 router 進行原生重整跳轉，徹底乾淨地刷新狀態
      router.push("/");
      router.refresh();
      
    } catch (error: any) {
      console.error("Firebase Auth Error:", error.code, error.message);
      setIsSubmitting(false);
      
      // 精準判定 Firebase 回傳的錯誤代碼
      if (error.code === "auth/email-already-in-use") {
        setErrorMsg("此信箱已被註冊！");
      } else if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
        setErrorMsg("信箱或密碼錯誤，請重新輸入！");
      } else {
        setErrorMsg(`驗證失敗：${error.message}`);
      }
    }
  };

  if (user) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        <h2 style={{ color: "#2f6f73" }}>🎉 您已經成功登入系統！</h2>
        <p style={{ color: "#64748b", marginTop: "10px" }}>請點擊上方導覽列開始練習多益單字。</p>
        <button 
          onClick={() => { router.push("/"); router.refresh(); }}
          style={{ background: "#2f6f73", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", marginTop: "20px", cursor: "pointer", fontWeight: "bold" }}
        >
          返回首頁
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .login-container { display: flex; justify-content: center; align-items: center; min-height: 70vh; background: #f7f3ea; padding: 20px; }
        .login-card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); border: 1px solid #d8dee8; text-align: center; width: 350px; }
        .login-input { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; margin: 8px 0; box-sizing: border-box; font-size: 16px; }
        .btn-login { width: 100%; padding: 12px; background: #2f6f73; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 16px; margin-top: 10px; transition: background 0.2s; }
        .btn-login:disabled { background: #94a3b8; cursor: not-allowed; }
        .toggle-link { color: #2f6f73; font-size: 14px; background: none; border: none; cursor: pointer; text-decoration: underline; margin-top: 15px; }
        .err-msg { color: #ef4444; font-size: 14px; margin: 10px 0; font-weight: bold; background: #fef2f2; padding: 8px; border-radius: 4px; border: 1px solid #fee2e2; }
      `}</style>

      <div className="login-container">
        <div className="login-card">
          <h2 style={{ margin: "0 0 10px 0", color: "#1e293b" }}>{isRegister ? "建立新帳號 🚀" : "會員登入 🔐"}</h2>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>登入以同步您的個人雲端學習錯題本</p>
          
          {errorMsg && <div className="err-msg">⚠️ {errorMsg}</div>}

          <form onSubmit={handleAuth}>
            <input 
              type="email" 
              className="login-input" 
              placeholder="電子郵件 (Email)" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              disabled={isSubmitting}
            />
            <input 
              type="password" 
              className="login-input" 
              placeholder="密碼 (Password)" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              disabled={isSubmitting}
            />
            <button type="submit" className="btn-login" disabled={isSubmitting}>
              {isSubmitting ? "處理中..." : (isRegister ? "註冊並登入" : "立即登入")}
            </button>
          </form>

          <button 
            className="toggle-link" 
            onClick={() => { setIsRegister(!isRegister); setErrorMsg(""); setEmail(""); setPassword(""); }}
            disabled={isSubmitting}
          >
            {isRegister ? "已經有帳號？前往登入" : "還沒有帳號？按此註冊"}
          </button>
        </div>
      </div>
    </>
  );
}