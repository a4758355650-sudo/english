"use client";

import { useEffect, useState } from "react";
import { allVocabularyWords } from "@/utils/words";
import { auth, db } from "@/utils/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

export default function Page3() {
  const [wrongWords, setWrongWords] = useState<Record<string, any>>({});
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(true);

  // 從 Firestore 雲端資料庫載入特定使用者的錯題
  const loadWrongWords = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const querySnapshot = await getDocs(collection(db, "users", currentUser.uid, "wrongWords"));
      const data: Record<string, any> = {};
      querySnapshot.forEach((doc) => {
        data[doc.id] = doc.data();
      });
      setWrongWords(data);

      const keys = Object.keys(data);
      if (keys.length > 0) {
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        setCurrentKey(randomKey);
      } else {
        setCurrentKey(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setIsAnswered(false);
      setSelectedOption(null);
    }
  };

  useEffect(() => {
    loadWrongWords();
  }, []);

  useEffect(() => {
    if (!currentKey || !wrongWords[currentKey]) return;

    const rightAnswer = wrongWords[currentKey].meaning;
    const wrongAnswers = allVocabularyWords
      .filter((w) => w[0] !== currentKey).map((w) => w[1])
      .sort(() => 0.5 - Math.random()).slice(0, 3);

    setOptions([rightAnswer, ...wrongAnswers].sort(() => 0.5 - Math.random()));
  }, [currentKey, wrongWords]);

  const handleOptionClick = async (opt: string) => {
    if (isAnswered || !currentKey) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const userWordDocRef = doc(db, "users", currentUser.uid, "wrongWords", currentKey);
    const updated = { ...wrongWords };

    if (opt === wrongWords[currentKey].meaning) {
      // 答對了，次數減 1
      updated[currentKey].count -= 1;
      if (updated[currentKey].count <= 0) {
        // 次數歸零，從雲端永久刪除
        await deleteDoc(userWordDocRef);
        delete updated[currentKey];
      } else {
        // 更新剩餘次數到雲端
        await setDoc(userWordDocRef, { ...updated[currentKey] });
      }
    } else {
      // 答錯，重置回 3 次
      updated[currentKey].count = 3;
      await setDoc(userWordDocRef, { ...updated[currentKey] });
    }
    setWrongWords(updated);
  };

  const handleClearAll = async () => {
    if (!confirm("確定要清空雲端上所有的不熟悉單字嗎？")) return;
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const querySnapshot = await getDocs(collection(db, "users", currentUser.uid, "wrongWords"));
    const deletePromises = querySnapshot.docs.map(d => deleteDoc(doc(db, "users", currentUser.uid, "wrongWords", d.id)));
    await Promise.all(deletePromises);
    
    setWrongWords({});
    setCurrentKey(null);
    alert("雲端錯題已全數清空！");
  };

  if (loading) return <div style={{ textAlign: "center", padding: 50 }}>雲端資料讀取中...</div>;

  const listKeys = Object.keys(wrongWords);

  return (
    <>
<style jsx global>{`
  /* 直接寫死顏色，不依賴 :root 變數，避免讀取錯誤 */
  body { 
    background-color: #f7f3ea !important; 
    font-family: Arial, sans-serif; 
    color: #000000 !important; 
  }
  
  .shell { 
    background-color: #ffffff !important; 
    border: 2px solid #64748b !important; 
    border-radius: 12px; 
    padding: 32px; 
    box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
  }
  
  .q-title { 
    font-size: 40px !important; 
    font-weight: 900 !important; 
    text-align: center; 
    margin: 25px 0; 
    color: #000000 !important; 
  }
  
  .options-grid { 
    display: grid !important; 
    grid-template-columns: 1fr 1fr !important; 
    gap: 16px !important; 
    margin: 25px 0; 
  }
  
  .opt-btn { 
    padding: 20px !important; 
    background-color: #ffffff !important; 
    border: 2px solid #334155 !important; 
    border-radius: 8px !important; 
    font-size: 20px !important; 
    font-weight: 900 !important; 
    color: #000000 !important; 
    cursor: pointer; 
    text-align: center; 
  }

  .count-btn { 
    padding: 10px 20px !important; 
    border: 2px solid #2f6f73 !important; 
    background-color: #ffffff !important; 
    color: #2f6f73 !important; 
    font-weight: 900 !important; 
    cursor: pointer; 
    border-radius: 6px !important; 
  }
  
  .count-btn.active { 
    background-color: #2f6f73 !important; 
    color: #ffffff !important; 
  }
`}</style>

      <main style={{ width: "min(750px, calc(100% - 32px))", margin: "40px auto" }}>
        <div className="shell">
          <h2>🎯 不熟悉單字雲端複習本</h2>
          <p style={{ color: "var(--muted)" }}>每字必須<strong>連續答對 3 次</strong>才會從雲端資料庫徹底移除！</p>

          {currentKey && wrongWords[currentKey] ? (
            <div style={{ background: "#fffbeb", padding: 24, borderRadius: 8, border: "1px solid #fef3c7" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="badge-count">還需連續答對：{wrongWords[currentKey].count} 次</span>
                <span style={{ fontSize: 14, color: "var(--muted)" }}>雲端剩餘：{listKeys.length} 字</span>
              </div>

              <div className="q-title">{currentKey}</div>

              <div className="options-grid">
                {options.map((opt, i) => {
                  let btnClass = "opt-btn";
                  if (isAnswered) {
                    if (opt === wrongWords[currentKey]?.meaning) btnClass += " correct";
                    else if (selectedOption === opt) btnClass += " wrong";
                  }
                  return (
                    <button key={i} className={btnClass} onClick={() => handleOptionClick(opt)} disabled={isAnswered}>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div style={{ textAlign: "right" }}>
                  <button className="btn-action" onClick={loadWrongWords}>下一題 ➡️</button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--success)", fontWeight: "bold", fontSize: 20 }}>
              👏 太神了！目前雲端沒有任何錯題，快去隨機抽考庫存吧！
            </div>
          )}

          {listKeys.length > 0 && (
            <div className="list-container">
              <div style={{ display: "flex", alignItems: "center", marginBottom: 15 }}>
                <h3 style={{ margin: 0 }}>📋 雲端黑名單清單 ({listKeys.length})</h3>
                <button className="btn-action btn-danger" onClick={handleClearAll}>🧹 一鍵淨空</button>
              </div>

              <div style={{ maxHeight: 300, overflowY: "auto", border: "1px solid var(--line)", borderRadius: 8 }}>
                {listKeys.map((key) => (
                  <div key={key} className="wrong-item">
                    <div>
                      <strong style={{ fontSize: 18, color: "var(--ink)" }}>{key}</strong>
                      <span style={{ color: "var(--muted)", marginLeft: 15 }}>{wrongWords[key]?.meaning}</span>
                    </div>
                    <span className="badge-count">剩餘 {wrongWords[key]?.count} 次</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}