"use client";

import { useEffect, useState, useCallback } from "react";
import { allVocabularyWords } from "@/utils/words";
import { auth, db } from "@/utils/firebase";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { speak } from "@/utils/tts"; 

// 取得等級的輔助函式
const getLevel = (index: number) => {
  if (index < 50) return "A1";
  if (index < 100) return "A2";
  if (index < 150) return "B1";
  if (index < 200) return "B2";
  if (index < 250) return "C1";
  return "C2";
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function Page2() {
  const [quizList, setQuizList] = useState<string[][]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  
  const [questionCount, setQuestionCount] = useState<number | "all">(30);
  const [mode, setMode] = useState<"all" | "wrong">("all");
  const [levelFilter, setLevelFilter] = useState<string>("全部"); // 新增等級狀態

  const initQuiz = useCallback(async (count: number | "all", currentMode: "all" | "wrong", level: string) => {
    let sourceWords: string[][] = [];

    if (currentMode === "all") {
      // 依等級過濾資料
      sourceWords = allVocabularyWords.filter((_, index) => 
        level === "全部" || getLevel(index) === level
      );
    } else {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const snap = await getDocs(collection(db, "users", currentUser.uid, "wrongWords"));
        snap.forEach((doc) => { sourceWords.push([doc.id, doc.data().meaning]); });
      }
    }

    if (sourceWords.length === 0) {
      alert("該篩選條件下目前無可用單字");
      setLevelFilter("全部");
      setMode("all");
      return;
    }

    const shuffledSource = shuffleArray(sourceWords);
    const finalCount = count === "all" ? shuffledSource.length : Math.min(count, shuffledSource.length);
    
    setQuizList(shuffledSource.slice(0, finalCount));
    setCurrentQuizIndex(0);
    setScore(0);
    setQuizFinished(false);
    setIsAnswered(false);
    setSelectedOption(null);
  }, []);

  useEffect(() => {
    if (quizList.length > 0 && quizList[currentQuizIndex]) {
      speak(quizList[currentQuizIndex][0]);
    }
  }, [currentQuizIndex, quizList]);

  // 當模式、題數或等級變更時，重新初始化
  useEffect(() => { initQuiz(questionCount, mode, levelFilter); }, [initQuiz, questionCount, mode, levelFilter]);

  useEffect(() => {
    if (quizList.length === 0 || quizFinished) return;
    const currentWord = quizList[currentQuizIndex];
    const others = allVocabularyWords.filter((w) => w[0] !== currentWord[0]);
    const wrongAnswers = shuffleArray(others).slice(0, 3).map(w => w[1]);
    setOptions(shuffleArray([currentWord[1], ...wrongAnswers]));
    setSelectedOption(null);
    setIsAnswered(false);
  }, [quizList, currentQuizIndex, quizFinished]);

  const handleOptionClick = async (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);
    const currentWord = quizList[currentQuizIndex];

    if (opt === currentWord[1]) {
      setScore((prev) => prev + 1);
    } else {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userWrongDocRef = doc(db, "users", currentUser.uid, "wrongWords", currentWord[0]);
        await setDoc(userWrongDocRef, { meaning: currentWord[1], count: 3 });
      }
    }
  };

  return (
    <main style={{ width: "min(700px, calc(100% - 32px))", margin: "40px auto" }}>
      <div className="shell">
        {!quizFinished ? (
          <div>
            <div style={{ textAlign: "center", marginBottom: 30, background: "#f4f4f4", padding: "20px", borderRadius: "12px" }}>
              <div style={{ marginBottom: 15 }}>
                <button className={`btn ${mode === "all" ? "active" : "btn-secondary"}`} onClick={() => setMode("all")}>📖 全部單字</button>
                <button className={`btn ${mode === "wrong" ? "active" : "btn-secondary"}`} onClick={() => setMode("wrong")} style={{ marginLeft: 10 }}>🎯 不熟悉單字</button>
              </div>
              
              {/* 等級篩選按鈕區 */}
              <div style={{ marginBottom: 15 }}>
                <p style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "8px" }}>篩選等級：</p>
                {["全部", "A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
                  <button key={lvl} className={`btn ${levelFilter === lvl ? "active" : "btn-secondary"}`} onClick={() => setLevelFilter(lvl)} style={{ margin: "2px" }}>
                    {lvl}
                  </button>
                ))}
              </div>

              {currentQuizIndex === 0 && !isAnswered && (
                <div>
                  <p style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "10px" }}>選擇測驗題數：</p>
                  <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                    {[10, 30, 50, "all"].map((num) => (
                      <button key={num} className={`count-btn ${questionCount === num ? "active" : ""}`} onClick={() => setQuestionCount(num as number | "all")}>
                        {num === "all" ? "全部" : `${num} 題`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, fontSize: "1.1rem" }}>
              <div>範圍：<strong>{mode === "all" ? `${levelFilter} 範圍` : "不熟悉單字"}</strong></div>
              <div>進度：<strong>{currentQuizIndex + 1} / {quizList.length}</strong></div>
            </div>
            
            <div className="q-title" style={{ fontSize: "2.5rem", textAlign: "center", margin: "30px 0", fontWeight: "bold" }}>
              {quizList[currentQuizIndex]?.[0]}
              <button onClick={() => speak(quizList[currentQuizIndex][0])} style={{ marginLeft: "15px", cursor: "pointer", background: "transparent", border: "none", fontSize: "1.8rem" }} title="播放發音">🔊</button>
            </div>
            
            <div className="options-grid">
              {options.map((opt, i) => (
                <button key={i} className={`opt-btn ${isAnswered ? (opt === quizList[currentQuizIndex][1] ? "correct" : selectedOption === opt ? "wrong" : "") : ""}`} onClick={() => handleOptionClick(opt)} disabled={isAnswered}>
                  {opt}
                </button>
              ))}
            </div>
            
            {isAnswered && (
              <button className="btn" style={{ width: "100%", marginTop: 30, padding: "15px" }} onClick={() => currentQuizIndex === quizList.length - 1 ? setQuizFinished(true) : setCurrentQuizIndex((p) => p + 1)}>
                {currentQuizIndex === quizList.length - 1 ? "查看結果" : "下一題 ➡️"}
              </button>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 60, background: "#fff", border: "1px solid #ddd" }}>
            <h2>🎉 測驗完成！</h2>
            <p style={{ fontSize: "1.5rem" }}>最終得分：{score} / {quizList.length}</p>
            <button className="btn" style={{ marginTop: 20 }} onClick={() => initQuiz(questionCount, mode, levelFilter)}>再挑戰一次</button>
          </div>
        )}
      </div>
    </main>
  );
}