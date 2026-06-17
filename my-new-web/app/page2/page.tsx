"use client";

import { useEffect, useState, useCallback } from "react";
import { allVocabularyWords } from "@/utils/words";
import { auth, db } from "@/utils/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function Page2() {
  const [quizList, setQuizList] = useState<string[][]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const initQuiz = useCallback(() => {
    const shuffled = [...allVocabularyWords].sort(() => 0.5 - Math.random());
    setQuizList(shuffled.slice(0, Math.min(30, shuffled.length)));
    setCurrentQuizIndex(0); setScore(0); setQuizFinished(false); setIsAnswered(false); setSelectedOption(null);
  }, []);

  useEffect(() => { initQuiz(); }, [initQuiz]);

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
      // 💡 答錯時，直接寫入 Firebase Cloud Firestore
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userWrongDocRef = doc(db, "users", currentUser.uid, "wrongWords", currentWord[0]);
        await setDoc(userWrongDocRef, {
          meaning: currentWord[1],
          count: 3 // 連續答對 3 次才移除
        });
      }
    }
  };

  if (quizList.length === 0) return <div style={{ textAlign: "center", padding: 50 }}>載入中...</div>;

  return (
    <>
      <style jsx global>{`
  :root { --bg: #f7f3ea; --ink: #0f172a; --muted: #1e293b; --primary: #2f6f73; --accent: #c7673c; --line: #64748b; --success: #059669; }
  .shell { background: white; border: 2px solid var(--line); border-radius: 12px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
  .q-title { font-size: 42px; font-weight: 900; text-align: center; margin: 25px 0; color: #000000; }
  .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 25px 0; }
  .opt-btn { padding: 20px; background: #ffffff; border: 2px solid #475569; border-radius: 8px; font-size: 20px; font-weight: 800; color: #0f172a; cursor: pointer; text-align: center; }
  .opt-btn.correct { background: #d1fae5; border-color: #059669; color: #064e3b; font-weight: 900; }
  .opt-btn.wrong { background: #fee2e2; border-color: #dc2626; color: #991b1b; font-weight: 900; }
`}</style>
      <main style={{ width: "min(700px, calc(100% - 32px))", margin: "40px auto" }}>
        <div className="shell">
          {!quizFinished ? (
            <div>
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
              {isAnswered && <button style={{ float: "right", padding: "10px 20px", background: "var(--primary)", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }} onClick={() => currentQuizIndex === quizList.length - 1 ? setQuizFinished(true) : setCurrentQuizIndex((p) => p + 1)}>下一題</button>}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 40 }}>
              <h2>🎉 測驗完成！分數：{score} / {quizList.length}</h2>
              <button style={{ padding: "10px 20px", background: "var(--primary)", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }} onClick={initQuiz}>再挑戰一次</button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}