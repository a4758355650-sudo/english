"use client";

import { useEffect, useState } from "react";
import { allVocabularyWords } from "@/utils/words";
import { auth, db } from "@/utils/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

export default function Page3() {
  const [wrongWords, setWrongWords] = useState<Record<string, any>>({});
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const loadWrongWords = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const querySnapshot = await getDocs(collection(db, "users", currentUser.uid, "wrongWords"));
    const data: Record<string, any> = {};
    querySnapshot.forEach((doc) => { data[doc.id] = doc.data(); });
    setWrongWords(data);
    const keys = Object.keys(data);
    setCurrentKey(keys.length > 0 ? keys[Math.floor(Math.random() * keys.length)] : null);
    setIsAnswered(false);
    setSelectedOption(null);
  };

  useEffect(() => { loadWrongWords(); }, []);

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
    setSelectedOption(opt); setIsAnswered(true);
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const userWordDocRef = doc(db, "users", currentUser.uid, "wrongWords", currentKey);
    const updated = { ...wrongWords };
    if (opt === wrongWords[currentKey].meaning) {
      updated[currentKey].count -= 1;
      if (updated[currentKey].count <= 0) await deleteDoc(userWordDocRef), delete updated[currentKey];
      else await setDoc(userWordDocRef, { ...updated[currentKey] });
    } else {
      updated[currentKey].count = 3;
      await setDoc(userWordDocRef, { ...updated[currentKey] });
    }
    setWrongWords(updated);
  };

  const listKeys = Object.keys(wrongWords);

  return (
    <main style={{ maxWidth: "700px", margin: "40px auto", padding: "0 20px" }}>
      <div className="shell" style={{ padding: "30px" }}>
        <h2>🎯 不熟悉單字雲端複習本</h2>
        <p style={{ color: "#64748b" }}>每字必須<strong>連續答對 3 次</strong>才會移除！</p>

        {currentKey ? (
          <div style={{ background: "#fffbeb", padding: "20px", borderRadius: "12px", border: "1px solid #fef3c7", marginBottom: "30px" }}>
            <div style={{ textAlign: "right", fontSize: "0.9rem", color: "#b45309" }}>還需答對：{wrongWords[currentKey].count} 次</div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", margin: "20px 0" }}>{currentKey}</div>
            <div className="options-grid">
              {options.map((opt, i) => (
                <button key={i} className={`opt-btn ${isAnswered ? (opt === wrongWords[currentKey].meaning ? "correct" : selectedOption === opt ? "wrong" : "") : ""}`} 
                  onClick={() => handleOptionClick(opt)} disabled={isAnswered}>
                  {opt}
                </button>
              ))}
            </div>
            {isAnswered && <button className="btn" style={{ width: "100%", marginTop: "20px" }} onClick={loadWrongWords}>下一題 ➡️</button>}
          </div>
        ) : <p style={{ textAlign: "center", padding: "40px 0" }}>👏 目前沒有錯題！</p>}

        {listKeys.length > 0 && (
          <div>
            <h3>📋 雲端黑名單 ({listKeys.length})</h3>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
              {listKeys.map((key) => (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
                  <span style={{ fontWeight: 600 }}>{key}</span>
                  <span style={{ color: "#64748b" }}>{wrongWords[key].meaning} | 剩 {wrongWords[key].count} 次</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}