"use client";

import { useState } from "react";
import { allVocabularyWords } from "@/utils/words";

export default function Page1() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(true);

  const totalWords = allVocabularyWords.length;
  const currentWord = allVocabularyWords[currentIndex] || ["", ""];

  return (
    <main style={{ maxWidth: "700px", margin: "40px auto", padding: "0 20px" }}>
      <div className="shell" style={{ padding: "40px" }}>
        <h2>📖 全部單字地毯式複習</h2>
        <p>進度：<strong>{currentIndex + 1}</strong> / {totalWords}</p>

        {/* 使用 flashcard 樣式 */}
        <div className="flashcard" style={{ padding: "40px 20px", margin: "20px 0" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "15px" }}>{currentWord[0]}</div>
          <div style={{ fontSize: "1.5rem", color: "#475569", opacity: showMeaning ? 1 : 0, transition: "opacity 0.3s" }}>
            {currentWord[1]}
          </div>
        </div>

        <div className="btn-group">
          <button className="btn" onClick={() => setShowMeaning(!showMeaning)}>
            {showMeaning ? "👁️ 隱藏中文" : "👀 顯示中文"}
          </button>
        </div>

        <div className="btn-group" style={{ marginTop: "20px" }}>
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