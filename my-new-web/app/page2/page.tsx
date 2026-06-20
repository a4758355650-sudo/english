"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { allVocabularyWords, WORDS_PER_GROUP, getGroupName, getTotalGroups } from "@/utils/words";
import { auth, db } from "@/utils/firebase";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { speak } from "@/utils/tts"; 

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function Page2() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedGroup = searchParams.get("group") || "全部";

  const [quizList, setQuizList] = useState<string[][]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  
  const [questionCount, setQuestionCount] = useState<number | "all">(30);
  const [mode, setMode] = useState<"all" | "wrong">("all");

  const groupButtons = ["全部", ...Array.from({ length: getTotalGroups() }, (_, i) => getGroupName(i * WORDS_PER_GROUP))];

  const initQuiz = useCallback(async (count: number | "all", currentMode: "all" | "wrong", group: string) => {
    let sourceWords: string[][] = [];

    if (currentMode === "all") {
      if (group === "全部") {
        sourceWords = [...allVocabularyWords];
      } else {
        const groupNum = parseInt(group.replace("第 ", "").replace(" 組", ""));
        const startIndex = (groupNum - 1) * WORDS_PER_GROUP;
        sourceWords = allVocabularyWords.slice(startIndex, startIndex + WORDS_PER_GROUP);
      }
    } else {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const snap = await getDocs(collection(db, "users", currentUser.uid, "wrongWords"));
        snap.forEach((doc) => { sourceWords.push([doc.id, doc.data().meaning]); });
      }
    }

    if (sourceWords.length === 0) {
      alert("該條件下目前無可用單字");
      if (currentMode === "all") router.push(`?group=全部`);
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
  }, [router]);

  useEffect(() => {
    initQuiz(questionCount, mode, selectedGroup);
  }, [initQuiz, questionCount, mode, selectedGroup]);

  useEffect(() => {
    if (quizList.length > 0 && quizList[currentQuizIndex]) {
      speak(quizList[currentQuizIndex][0]);
    }
  }, [currentQuizIndex, quizList]);

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
    if (opt === quizList[currentQuizIndex][1]) setScore((prev) => prev + 1);
    else {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await setDoc(doc(db, "users", currentUser.uid, "wrongWords", quizList[currentQuizIndex][0]), { meaning: quizList[currentQuizIndex][1] });
      }
    }
  };

  return (
    <main style={{ width: "min(700px, calc(100% - 32px))", margin: "40px auto" }}>
      <div className="shell">
        {!quizFinished ? (
          <div>
            <div style={{ textAlign: "center", marginBottom: 30, background: "#f4f4f4", padding: "20px", borderRadius: "12px" }}>
              <button className={`btn ${mode === "all" ? "active" : "btn-secondary"}`} onClick={() => setMode("all")}>📖 全部單字</button>
              <button className={`btn ${mode === "wrong" ? "active" : "btn-secondary"}`} onClick={() => setMode("wrong")} style={{ marginLeft: 10 }}>🎯 不熟悉單字</button>
              
              {/* 只有在 "全部單字" 模式下才顯示分組篩選 */}
              {mode === "all" && (
                <div style={{ marginTop: 15 }}>
                  <p style={{ fontWeight: "bold", fontSize: "14px" }}>篩選分組：</p>
                  {groupButtons.map((g) => (
                    <button key={g} className={`btn ${selectedGroup === g ? "active" : "btn-secondary"}`} onClick={() => router.push(`?group=${encodeURIComponent(g)}`)} style={{ margin: "2px" }}>{g}</button>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ fontSize: "2.5rem", textAlign: "center", margin: "30px 0" }}>{quizList[currentQuizIndex]?.[0]}</div>
            <div className="options-grid">
              {options.map((opt, i) => (
                <button key={i} className={`opt-btn ${isAnswered ? (opt === quizList[currentQuizIndex][1] ? "correct" : selectedOption === opt ? "wrong" : "") : ""}`} onClick={() => handleOptionClick(opt)}>{opt}</button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 60 }}>
            <h2>🎉 測驗完成！得分：{score} / {quizList.length}</h2>
            <button className="btn" onClick={() => initQuiz(questionCount, mode, selectedGroup)}>再挑戰一次</button>
          </div>
        )}
      </div>
    </main>
  );
}