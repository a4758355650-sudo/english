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
        :root {
          --bg: #f7f3ea;
          --ink: #1e293b;
          --muted: #64748b;
          --primary: #2f6f73;
          --primary-dark: #24585b;
          --line: #d8dee8;
          --shadow: 0 18px 50px rgba(30, 41, 59, 0.12);
        }
        body {
          background: linear-gradient(135deg, rgba(47, 111, 115, 0.1), transparent 40%), var(--bg);
          min-height: 100vh;
          font-family: Arial, sans-serif;
        }
        .shell {
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid var(--line);
          border-radius: 12px;
          box-shadow: var(--shadow);
          padding: 32px;
          text-align: center;
        }
        .flashcard {
          background: white;
          border: 2px solid var(--primary);
          border-radius: 12px;
          padding: 60px 20px;
          margin: 30px 0;
          box-shadow: 0 8px 20px rgba(0,0,0,0.02);
        }
        .eng {
          font-size: 48px;
          font-weight: bold;
          color: var(--ink);
          margin-bottom: 20px;
          letter-spacing: 1px;
        }
        .ch {
          font-size: 24px;
          color: var(--primary);
          min-height: 36px;
          font-weight: 500;
        }
        .btn-group {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 24px;
        }
        .btn {
          padding: 12px 24px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn:hover { background: var(--primary-dark); }
        .btn:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
        }
        .btn-sec {
          background: transparent;
          color: var(--primary);
          border: 2px solid var(--primary);
        }
        .btn-sec:hover {
          background: rgba(47, 111, 115, 0.08);
        }
        .progress-text {
          color: var(--muted);
          font-size: 14px;
        }
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