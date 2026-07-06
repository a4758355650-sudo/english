"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
// 👇 新增這行：引入系統中已經寫好的發音工具
import { speak } from "@/utils/tts"; 

export default function ReviewPage() {
  const [wrongWordsList, setWrongWordsList] = useState<Array<{word: string, meaning: string, count: number}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const querySnapshot = await getDocs(collection(db, "users", user.uid, "wrongWords"));
          const words: Array<{word: string, meaning: string, count: number}> = [];
          
          querySnapshot.forEach((doc) => {
            words.push({
              word: doc.id,
              meaning: doc.data().meaning,
              count: doc.data().count
            });
          });
          
          setWrongWordsList(words);
        } catch (error) {
          console.error("讀取單字失敗:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p style={{ textAlign: "center", marginTop: "50px" }}>載入中...</p>;

  return (
    <main style={{ maxWidth: "700px", margin: "40px auto", padding: "0 20px" }}>
      <div className="shell" style={{ padding: "30px" }}>
        <h2 style={{ textAlign: "center", color: "#1e293b", marginBottom: "20px" }}>不熟悉單字總覽</h2>
        
        {wrongWordsList.length > 0 ? (
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {wrongWordsList.map((item, index) => (
              <li key={index} style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", /* 讓按鈕與文字垂直置中 */
                padding: "15px", 
                borderBottom: "1px solid #e2e8f0",
                background: index % 2 === 0 ? "#f8fafc" : "#ffffff"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <strong style={{ fontSize: "1.2rem", color: "#334155" }}>{item.word}</strong>
                  
                  {/* 👇 新增這個發音按鈕，點擊時呼叫 speak() 函式 */}
                  <button 
                    onClick={() => speak(item.word)} 
                    style={{
                      cursor: "pointer",
                      background: "#e2e8f0",
                      border: "none",
                      borderRadius: "50%",
                      width: "30px",
                      height: "30px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1rem",
                      transition: "background 0.2s"
                    }}
                    title="聽發音"
                  >
                    🔊
                  </button>
                </div>

                <span style={{ fontSize: "1.1rem", color: "#64748b" }}>{item.meaning}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ textAlign: "center", color: "#64748b" }}>目前沒有不熟悉的單字喔！繼續保持！</p>
        )}
      </div>
    </main>
  );
}