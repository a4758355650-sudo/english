"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { allVocabularyWords, WORDS_PER_GROUP, getGroupName, getTotalGroups } from "@/utils/words";
import { speak } from "@/utils/tts";

export default function Page1() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const selectedGroup = searchParams.get("group") || "全部";
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(true);
  const [isReverse, setIsReverse] = useState(false);

  const groupButtons = ["全部", ...Array.from({ length: getTotalGroups() }, (_, i) => getGroupName(i * WORDS_PER_GROUP))];

  const filteredWords = useMemo(() => {
    if (selectedGroup === "全部") return allVocabularyWords;
    const groupNum = parseInt(selectedGroup.replace("第 ", "").replace(" 組", ""));
    const startIndex = (groupNum - 1) * WORDS_PER_GROUP;
    return allVocabularyWords.slice(startIndex, startIndex + WORDS_PER_GROUP);
  }, [selectedGroup]);

  const totalWords = filteredWords.length;

  const handleGroupChange = (group: string) => {
    setCurrentIndex(0);
    router.push(`?group=${encodeURIComponent(group)}`);
  };

  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedGroup]);

  const displayIndex = isReverse ? (totalWords - 1 - currentIndex) : currentIndex;
  const currentWord = filteredWords[displayIndex] || ["", ""];

  useEffect(() => {
    if (currentWord[0]) speak(currentWord[0]);
  }, [currentIndex, isReverse, currentWord, selectedGroup]);

  return (
    <main>
      <div className="shell">
        <h2 style={{ textAlign: "center", marginBottom: "30px" }}>📖 全部單字地毯式複習</h2>
        
        {/* 組別按鈕區域：統一使用 .btn 類別，選中時加上 .active */}
        <div style={{ marginBottom: "30px", textAlign: "center" }}>
          <p style={{ fontWeight: "bold", fontSize: "14px", color: "#64748b", marginBottom: "10px" }}>選擇單字分組：</p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px" }}>
            {groupButtons.map((groupName) => (
              <button 
                key={groupName} 
                className={`btn ${selectedGroup === groupName ? "active" : ""}`} 
                onClick={() => handleGroupChange(groupName)}
              >
                {groupName}
              </button>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <button className="btn" onClick={() => { setIsReverse(!isReverse); setCurrentIndex(0); }}>
            {isReverse ? "🔄 目前模式：倒序" : "🔄 目前模式：正序"}
          </button>
        </div>

        <p style={{ textAlign: "center", color: "#475569" }}>
          當前分組：<strong>{selectedGroup}</strong> | 進度：<strong>{currentIndex + 1}</strong> / {totalWords}
        </p>

        <div className="flashcard" style={{ padding: "40px 20px", margin: "20px 0" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "15px" }}>
            {currentWord[0]}
            <button onClick={() => speak(currentWord[0])} style={{ marginLeft: "15px", cursor: "pointer", background: "transparent", border: "none", fontSize: "1.8rem" }}>🔊</button>
          </div>
          <div style={{ fontSize: "1.5rem", color: "#475569", opacity: showMeaning ? 1 : 0, transition: "opacity 0.3s" }}>
            {currentWord[1]}
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button className="btn" onClick={() => setShowMeaning(!showMeaning)}>
            {showMeaning ? "👁️ 隱藏中文" : "👀 顯示中文"}
          </button>
        </div>

        <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
          <button className="btn" onClick={() => setCurrentIndex(i => Math.max(0, i - 1))} disabled={currentIndex === 0}>⬅️ 上一個</button>
          <button className="btn" onClick={() => setCurrentIndex(i => Math.min(totalWords - 1, i + 1))} disabled={currentIndex === totalWords - 1}>下一個 ➡️</button>
        </div>
      </div>
    </main>
  );
}