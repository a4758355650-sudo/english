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
  /* 極簡風全域設定 */
  body {
    background-color: #ffffff !important; /* 純白背景，視覺極度乾淨 */
    color: #000000 !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    margin: 0;
  }

  /* 去除陰影，只保留細黑邊框 */
  .shell, .login-card, .flashcard {
    background-color: #ffffff !important;
    border: 1px solid #000000 !important; /* 極細黑色邊框 */
    border-radius: 0px !important;       /* 直角設計，極簡風特徵 */
    padding: 40px !important;
    box-shadow: none !important;         /* 移除陰影 */
  }

  /* 標題與文字：純黑，無贅飾 */
  .q-title, .eng, .ch {
    color: #000000 !important;
    font-weight: 700 !important;
  }

  /* 按鈕：極簡風格 */
  .opt-btn, .btn {
    padding: 16px !important;
    background-color: #ffffff !important;
    border: 1px solid #000000 !important;
    border-radius: 0px !important;
    font-size: 18px !important;
    font-weight: 600 !important;
    color: #000000 !important;
    cursor: pointer;
    transition: all 0.2s;
  }

  /* 滑鼠滑過按鈕時的反轉效果，極簡風常見互動 */
  .opt-btn:hover, .btn:hover {
    background-color: #000000 !important;
    color: #ffffff !important;
  }

  /* 答對與答錯：僅用黑色線條標示，不使用過多的紅綠色塊 */
  .opt-btn.correct { border: 2px solid #000000 !important; background: #f0f0f0 !important; }
  .opt-btn.wrong { border: 2px solid #000000 !important; text-decoration: line-through; opacity: 0.5; }
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