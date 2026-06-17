"use client";

import { useEffect, useState, useCallback } from "react";
import { allVocabularyWords } from "@/utils/words";
import { auth, db } from "@/utils/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function Page2() {
  const [quizList, setQuizList] = useState<string[][]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [questionCount, setQuestionCount] = useState(30);

  const initQuiz = useCallback((count: number) => {
    const shuffled = [...allVocabularyWords].sort(() => 0.5 - Math.random());
    setQuizList(shuffled.slice(0, Math.min(count, shuffled.length)));
    setCurrentQuizIndex(0); 
    setScore(0); 
    setQuizFinished(false); 
    setIsAnswered(false); 
    setSelectedOption(null);
  }, []);

  useEffect(() => { initQuiz(30); }, [initQuiz]);

  useEffect(() => {
    if (quizList.length === 0 || quizFinished) return;
    const currentWord = quizList[currentQuizIndex];
    const wrongAnswers = allVocabularyWords
      .filter((w) => w[0] !== currentWord[0]).map((w) => w[1])
      .sort(() => 0.5 - Math.random()).slice(0, 3);
    setOptions([currentWord[1], ...wrongAnswers].sort(() => 0.5 - Math.random()));
    setSelectedOption(null); setIsAnswered(false);
  }, [quizList, currentQuizIndex, quizFinished]);

  const handleOptionClick = async (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt); setIsAnswered(true);
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

  if (quizList.length === 0 && !quizFinished) return <div style={{ textAlign: "center", padding: 50 }}>載入中...</div>;

  return (
    <main style={{ width: "min(700px, calc(100% - 32px))", margin: "40px auto" }}>
      <div className="shell">
        {!quizFinished ? (
          <div>
            {currentQuizIndex === 0 && !isAnswered && (
              <div style={{ textAlign: "center", marginBottom: 25 }}>
                <p style={{ fontWeight: 800, marginBottom: 10 }}>請選擇測驗題數：</p>
                <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                  {[10, 30, 50].map((num) => (
                    <button key={num} className={`count-btn ${questionCount === num ? "active" : ""}`} onClick={() => { setQuestionCount(num); initQuiz(num); }}>
                      {num} 題
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div style={{ display: "flex", justifyContent: "space-between", background: "#e7f0ef", padding: 15, borderRadius: 8, marginBottom: 20 }}>
              <div>題目：<strong>{currentQuizIndex + 1}</strong> / {quizList.length}</div>
              <div>得分：<strong>{score}</strong></div>
            </div>
            
            <div className="q-title">{quizList[currentQuizIndex][0]}</div>
            
            <div className="options-grid">
              {options.map((opt, i) => (
                <button key={i} className={`opt-btn ${isAnswered ? (opt === quizList[currentQuizIndex][1] ? "correct" : selectedOption === opt ? "wrong" : "") : ""}`} onClick={() => handleOptionClick(opt)} disabled={isAnswered}>
                  {opt}
                </button>
              ))}
            </div>
            
            {isAnswered && (
              <button style={{ display: "block", width: "100%", padding: "12px", background: "#000", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 800, marginTop: 20 }} 
                onClick={() => currentQuizIndex === quizList.length - 1 ? setQuizFinished(true) : setCurrentQuizIndex((p) => p + 1)}>
                下一題 ➡️
              </button>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 40 }}>
            <h2>🎉 測驗完成！分數：{score} / {quizList.length}</h2>
            <button style={{ padding: "10px 20px", background: "#000", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 800, marginTop: 20 }} onClick={() => initQuiz(questionCount)}>再挑戰一次</button>
          </div>
        )}
      </div>
    </main>
  );
}