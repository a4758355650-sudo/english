"use client";

import { useEffect, useState, useCallback } from "react";
import { allVocabularyWords } from "@/utils/words";
import { auth, db } from "@/utils/firebase";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";

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

  const initQuiz = useCallback(async (count: number | "all", currentMode: "all" | "wrong") => {
    let sourceWords: string[][] = [];

    if (currentMode === "all") {
      sourceWords = [...allVocabularyWords];
    } else {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const snap = await getDocs(collection(db, "users", currentUser.uid, "wrongWords"));
        snap.forEach((doc) => { sourceWords.push([doc.id, doc.data().meaning]); });
      }
    }

    if (sourceWords.length === 0) {
      alert("該模式目前無可用單字");
      setMode("all");
      return;
    }

    // 計算實際題數：如果是 "all" 就取全部長度
    const finalCount = count === "all" ? sourceWords.length : Math.min(count, sourceWords.length);
    
    const shuffled = [...sourceWords].sort(() => 0.5 - Math.random());
    setQuizList(shuffled.slice(0, finalCount));
    
    setCurrentQuizIndex(0);
    setScore(0);
    setQuizFinished(false);
    setIsAnswered(false);
    setSelectedOption(null);
  }, []);

  useEffect(() => { initQuiz(questionCount, mode); }, [initQuiz, questionCount, mode]);

  useEffect(() => {
    if (quizList.length === 0 || quizFinished) return;
    const currentWord = quizList[currentQuizIndex];
    const others = allVocabularyWords.filter((w) => w[0] !== currentWord[0]);
    const wrongAnswers = others.sort(() => 0.5 - Math.random()).slice(0, 3).map(w => w[1]);
    setOptions([currentWord[1], ...wrongAnswers].sort(() => 0.5 - Math.random()));
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
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div className="btn-group" style={{ marginBottom: 15 }}>
                <button className={`btn ${mode === "all" ? "active" : ""}`} onClick={() => setMode("all")}>📖 全部單字</button>
                <button className={`btn ${mode === "wrong" ? "active" : ""}`} onClick={() => setMode("wrong")}>🎯 不熟悉單字</button>
              </div>
              
              {currentQuizIndex === 0 && !isAnswered && (
                <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                  {[10, 30, 50, "all"].map((num) => (
                    <button key={num} className={`count-btn ${questionCount === num ? "active" : ""}`} onClick={() => setQuestionCount(num as number | "all")}>
                      {num === "all" ? "全部" : `${num} 題`}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="q-title" style={{ fontSize: "2rem", textAlign: "center", margin: "20px 0" }}>{quizList[currentQuizIndex]?.[0]}</div>
            
            <div className="options-grid">
              {options.map((opt, i) => (
                <button key={i} className={`opt-btn ${isAnswered ? (opt === quizList[currentQuizIndex][1] ? "correct" : selectedOption === opt ? "wrong" : "") : ""}`} onClick={() => handleOptionClick(opt)} disabled={isAnswered}>
                  {opt}
                </button>
              ))}
            </div>
            
            {isAnswered && (
              <button className="btn" style={{ width: "100%", marginTop: 20 }} onClick={() => currentQuizIndex === quizList.length - 1 ? setQuizFinished(true) : setCurrentQuizIndex((p) => p + 1)}>
                下一題 ➡️
              </button>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 40 }}>
            <h2>🎉 測驗完成！得分：{score} / {quizList.length}</h2>
            <button className="btn" style={{ marginTop: 20 }} onClick={() => initQuiz(questionCount, mode)}>再挑戰一次</button>
          </div>
        )}
      </div>
    </main>
  );
}