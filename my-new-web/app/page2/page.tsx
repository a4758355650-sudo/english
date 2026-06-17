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
  // 新增：題數選擇 state
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

  // 初始載入
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
    <>
<style jsx global>{`
  /* 直接寫死顏色，不依賴 :root 變數，避免讀取錯誤 */
  body { 
    background-color: #f7f3ea !important; 
    font-family: Arial, sans-serif; 
    color: #000000 !important; 
  }
  
  .shell { 
    background-color: #ffffff !important; 
    border: 2px solid #64748b !important; 
    border-radius: 12px; 
    padding: 32px; 
    box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
  }
  
  .q-title { 
    font-size: 40px !important; 
    font-weight: 900 !important; 
    text-align: center; 
    margin: 25px 0; 
    color: #000000 !important; 
  }
  
  .options-grid { 
    display: grid !important; 
    grid-template-columns: 1fr 1fr !important; 
    gap: 16px !important; 
    margin: 25px 0; 
  }
  
  .opt-btn { 
    padding: 20px !important; 
    background-color: #ffffff !important; 
    border: 2px solid #334155 !important; 
    border-radius: 8px !important; 
    font-size: 20px !important; 
    font-weight: 900 !important; 
    color: #000000 !important; 
    cursor: pointer; 
    text-align: center; 
  }

  .count-btn { 
    padding: 10px 20px !important; 
    border: 2px solid #2f6f73 !important; 
    background-color: #ffffff !important; 
    color: #2f6f73 !important; 
    font-weight: 900 !important; 
    cursor: pointer; 
    border-radius: 6px !important; 
  }
  
  .count-btn.active { 
    background-color: #2f6f73 !important; 
    color: #ffffff !important; 
  }
`}</style>

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
              
              <div style={{ display: "flex", justifyContent: "space-between", background: "#e7f0ef", padding: 15, borderRadius: 8 }}>
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
              {isAnswered && <button style={{ float: "right", padding: "10px 20px", background: "var(--primary)", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 800 }} onClick={() => currentQuizIndex === quizList.length - 1 ? setQuizFinished(true) : setCurrentQuizIndex((p) => p + 1)}>下一題 ➡️</button>}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 40 }}>
              <h2>🎉 測驗完成！分數：{score} / {quizList.length}</h2>
              <button style={{ padding: "10px 20px", background: "var(--primary)", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 800 }} onClick={() => initQuiz(questionCount)}>再挑戰一次</button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}