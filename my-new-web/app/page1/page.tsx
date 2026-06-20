"use client";

import { useEffect, useState, useMemo } from "react";
import { allVocabularyWords } from "@/utils/words";
import { speak } from "@/utils/tts";

// 輔助函式：判斷等級 (請確保 utils/words.ts 也有此函式)
const getLevel = (index: number) => {
  if (index < 50) return "A1";
  if (index < 100) return "A2";
  if (index < 150) return "B1";
  if (index < 200) return "B2";
  if (index < 250) return "C1";
  return "C2";
};

export default function Page1() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(true);
  const [isReverse, setIsReverse] = useState(false);
  const [levelFilter, setLevelFilter] = useState<string>("全部"); // 新增：等級篩選

  // 使用 useMemo 計算篩選後的單字庫
  const filteredWords = useMemo(() => {
    if (levelFilter === "全部") return allVocabularyWords;
    return allVocabularyWords.filter((_, index) => getLevel(index) === levelFilter);
  }, [levelFilter]);

  const totalWords = filteredWords.length;
  
  // 處理索引變化與重新篩選時的歸零
  useEffect(() => {
    setCurrentIndex(0);
  }, [levelFilter]);

  const displayIndex = isReverse ? (totalWords - 1 - currentIndex) : currentIndex;
  const currentWord = filteredWords[displayIndex] || ["", ""];

  useEffect(() => {
    if (currentWord[0]) speak(currentWord[0]);
  }, [currentIndex, isReverse, currentWord, levelFilter]);

  return (
    <main style={{ maxWidth: "700px", margin: "40px auto", padding: "0 20px" }}>
      <div className="shell" style={{ padding: "40px" }}>
        <h2>📖 全部單字地毯式複習</h2>
        
        {/* 等級篩選按鈕區 */}
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <p style={{ fontWeight: "bold", fontSize: "14px" }}>篩選等級範圍：</p>
          {["全部", "A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
            <button 
              key={lvl} 
              className={`btn ${levelFilter === lvl ? "active" : "btn-secondary"}`} 
              onClick={() => setLevelFilter(lvl)} 
              style={{ margin: "5px", padding: "8px 15px" }}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <button className="btn" onClick={() => { setIsReverse(!isReverse); setCurrentIndex(0); }}>
            {isReverse ? "🔄 目前模式：從後面往前面背" : "🔄 目前模式：從前面往後面背"}
          </button>
        </div>

        <p>進度：<strong>{currentIndex + 1}</strong> / {totalWords}</p>

        <div className="flashcard" style={{ padding: "40px 20px", margin: "20px 0", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "15px" }}>
            {currentWord[0]}
            <button 
              onClick={() => speak(currentWord[0])}
              style={{ marginLeft: "15px", cursor: "pointer", background: "transparent", border: "none", fontSize: "1.8rem" }}
              title="播放發音"
            >
              🔊
            </button>
          </div>
          <div style={{ fontSize: "1.5rem", color: "#475569", opacity: showMeaning ? 1 : 0, transition: "opacity 0.3s" }}>
            {currentWord[1]}
          </div>
        </div>

        <div className="btn-group" style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button className="btn" onClick={() => setShowMeaning(!showMeaning)}>
            {showMeaning ? "👁️ 隱藏中文" : "👀 顯示中文"}
          </button>
        </div>

        <div className="btn-group" style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
          <button className="btn" onClick={() => setCurrentIndex(i => Math.max(0, i - 1))} disabled={currentIndex === 0}>
            ⬅️ 上一個
          </button>
          <button className="btn" onClick={() => setCurrentIndex(i => Math.min(totalWords - 1, i + 1))} disabled={currentIndex === totalWords - 1}>
            下一個 ➡️
          </button>
        </div>
      </div>
    </main>
  );
}