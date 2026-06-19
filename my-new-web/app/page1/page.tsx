"use client";

import { useEffect, useState } from "react";
import { allVocabularyWords } from "@/utils/words";
import { speak } from "@/utils/tts";

export default function Page1() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(true);
  const [isReverse, setIsReverse] = useState(false); // 新增：是否倒序

  const totalWords = allVocabularyWords.length;
  
  // 根據是否倒序，決定要取哪一個單字
  // 如果是倒序，索引計算為：總數 - 1 - 目前索引
  const displayIndex = isReverse ? (totalWords - 1 - currentIndex) : currentIndex;
  const currentWord = allVocabularyWords[displayIndex] || ["", ""];

  useEffect(() => {
    speak(currentWord[0]);
  }, [currentIndex, isReverse, currentWord]);

  // 切換模式時，重置索引到 0
  const toggleReverse = () => {
    setIsReverse(!isReverse);
    setCurrentIndex(0);
  };

  return (
    <main style={{ maxWidth: "700px", margin: "40px auto", padding: "0 20px" }}>
      <div className="shell" style={{ padding: "40px" }}>
        <h2>📖 全部單字地毯式複習</h2>
        
        {/* 切換正序/倒序按鈕 */}
        <div style={{ marginBottom: "15px" }}>
          <button className="btn" onClick={toggleReverse}>
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