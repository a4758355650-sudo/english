"use client";

import { useEffect, useState } from "react";
import { allVocabularyWords } from "@/utils/words";
import { auth, db } from "@/utils/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Page3() {
  const [wrongWords, setWrongWords] = useState<Record<string, any>>({});
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWrongWords = async (uid: string) => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "users", uid, "wrongWords"));
      const data: Record<string, any> = {};
      querySnapshot.forEach((doc) => { data[doc.id] = doc.data(); });
      
      setWrongWords(data);
      const keys = Object.keys(data);
      setCurrentKey(keys.length > 0 ? keys[Math.floor(Math.random() * keys.length)] : null);
      setIsAnswered(false);
      setSelectedOption(null);
    } catch (error) {
      console.error("載入錯誤:", error);
    } finally {
      setLoading(false);
    }
  };

  // 修正：監聽 Auth 狀態，確保使用者登入後才執行
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadWrongWords(user.uid);
      } else {
        setLoading(false);
        console.log("請先登入");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentKey || !wrongWords[currentKey]) return;
    const rightAnswer = wrongWords[currentKey].meaning;
    // 使用 filter 確保篩選出的選項不包含正確答案
    const wrongAnswers = allVocabularyWords
      .filter((w) => w[0] !== currentKey)
      .map((w) => w[1])
      .sort(() => 0.5 - Math.random()).slice(0, 3);
    
    setOptions([rightAnswer, ...wrongAnswers].sort(() => 0.5 - Math.random()));
  }, [currentKey, wrongWords]);

  const handleOptionClick = async (opt: string) => {
    if (isAnswered || !currentKey || !auth.currentUser) return;
    
    setSelectedOption(opt); 
    setIsAnswered(true);
    
    const uid = auth.currentUser.uid;
    const userWordDocRef = doc(db, "users", uid, "wrongWords", currentKey);
    const updated = { ...wrongWords };
    
    if (opt === wrongWords[currentKey].meaning) {
      updated[currentKey].count -= 1;
      if (updated[currentKey].count <= 0) {
        await deleteDoc(userWordDocRef);
        delete updated[currentKey];
      } else {
        await setDoc(userWordDocRef, { ...updated[currentKey] });
      }
    } else {
      updated[currentKey].count = 3;
      await setDoc(userWordDocRef, { ...updated[currentKey] });
    }
    setWrongWords(updated);
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "50px" }}>載入中...</p>;

  const listKeys = Object.keys(wrongWords);

  return (
    <main style={{ maxWidth: "700px", margin: "40px auto", padding: "0 20px" }}>
      <div className="shell" style={{ padding: "30px" }}>
        <h2>🎯 不熟悉單字雲端複習本</h2>
        {/* ... (其餘 UI 結構保持不變) ... */}
        {currentKey ? (
           <div style={{ background: "#fffbeb", padding: "20px", borderRadius: "12px" }}>
             <div style={{ textAlign: "right" }}>還需答對：{wrongWords[currentKey].count} 次</div>
             <div style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", margin: "20px 0" }}>{currentKey}</div>
             <div className="options-grid">
               {options.map((opt, i) => (
                 <button key={i} className={`opt-btn ${isAnswered ? (opt === wrongWords[currentKey].meaning ? "correct" : selectedOption === opt ? "wrong" : "") : ""}`} 
                   onClick={() => handleOptionClick(opt)} disabled={isAnswered}>
                   {opt}
                 </button>
               ))}
             </div>
             {isAnswered && <button className="btn" style={{ width: "100%", marginTop: "20px" }} onClick={() => auth.currentUser && loadWrongWords(auth.currentUser.uid)}>下一題 ➡️</button>}
           </div>
        ) : <p style={{ textAlign: "center", padding: "40px 0" }}>👏 目前沒有錯題！</p>}
        {/* ... (下方清單區塊保持不變) ... */}
      </div>
    </main>
  );
}