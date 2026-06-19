"use client";

import { useEffect, useState } from "react";
import { allVocabularyWords } from "@/utils/words";
import { speak } from "@/utils/tts"; // 匯入發音工具

export default function Page1() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(true);

  const totalWords = allVocabularyWords.length;
  const currentWord = allVocabularyWords[currentIndex] || ["", ""];

  // 當 currentIndex 改變時，自動呼叫 speak 播放當前單字
  useEffect(() => {
    speak(currentWord[0]);
  }, [currentIndex, currentWord]);

  return (
    <main style={{ maxWidth: "700px", margin: "40px auto", padding: "0 20px" }}>
      <div className="shell" style={{ padding: "40px" }}>
        <h2>📖 全部單字地毯式複習</h2>
        <p>進度：<strong>{currentIndex + 1}</strong> / {totalWords}</p>

        {/* 使用 flashcard 樣式 */}
        <div className="flashcard" style={{ padding: "40px 20px", margin: "20px 0", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "15px" }}>
            {currentWord[0]}
            {/* 發音按鈕（手動重播用） */}
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