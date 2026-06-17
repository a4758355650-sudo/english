"use client";

import { useState } from "react";
import { allVocabularyWords } from "@/utils/words";

export default function Page1() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(true);

  const totalWords = allVocabularyWords.length;
  const currentWord = allVocabularyWords[currentIndex] || ["", ""];

  const nextWord = () => {
    if (currentIndex < totalWords - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <>
<style jsx global>{`
  :root { --bg: #f7f3ea; --ink: #0f172a; --muted: #334155; --primary: #2f6f73; --primary-dark: #1e3a3b; --line: #64748b; }
  body { background: var(--bg); min-height: 100vh; font-family: Arial, sans-serif; }
  .shell { background: white; border: 2px solid var(--line); border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); padding: 32px; text-align: center; }
  .flashcard { background: white; border: 3px solid var(--primary); border-radius: 12px; padding: 50px 20px; margin: 30px 0; }
  .eng { font-size: 52px; font-weight: 900; color: #000000; margin-bottom: 20px; }
  .ch { font-size: 32px; color: #1e293b; min-height: 40px; font-weight: 800; }
  .btn-group { display: flex; justify-content: center; gap: 12px; margin-top: 24px; }
  .btn { padding: 14px 28px; background: var(--primary); color: white; border: none; border-radius: 6px; font-weight: 900; font-size: 16px; cursor: pointer; }
  .btn-sec { background: transparent; color: var(--primary); border: 2px solid var(--primary); font-weight: 900; }
  .progress-text { color: var(--muted); font-size: 16px; font-weight: 700; }
`}</style>

      <main style={{ width: "min(650px, calc(100% - 32px))", margin: "50px auto" }}>
        <div className="shell">
          <h2>📖 全部單字地毯式複習</h2>
          <p className="progress-text">進度：<strong>{currentIndex + 1}</strong> / {totalWords}</p>

          <div className="flashcard">
            <div className="eng">{currentWord[0]}</div>
            <div className="ch" style={{ opacity: showMeaning ? 1 : 0 }}>
              {currentWord[1]}
            </div>
          </div>

          <div className="btn-group">
            <button className="btn btn-sec" onClick={() => setShowMeaning(!showMeaning)}>
              {showMeaning ? "👁️ 隱藏中文" : "👀 顯示中文"}
            </button>
          </div>

          <div className="btn-group">
            <button className="btn" onClick={prevWord} disabled={currentIndex === 0}>
              ⬅️ 上一個
            </button>
            <button className="btn" onClick={nextWord} disabled={currentIndex === totalWords - 1}>
              下一個 ➡️
            </button>
          </div>
        </div>
      </main>
    </>
  );
}