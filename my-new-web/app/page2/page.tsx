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
  
  const [mode, setMode] = useState<"all" | "wrong">("all");
  const [selectedGroup, setSelectedGroup] = useState(searchParams.get("group") || "全部");
  const [questionCount, setQuestionCount] = useState<number | "all">(30);
  
  const [quizList, setQuizList] = useState<string[][]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const groupButtons = ["全部", ...Array.from({ length: getTotalGroups() }, (_, i) => getGroupName(i * WORDS_PER_GROUP))];

  const initQuiz = useCallback(async (count: number | "all", currentMode: "all" | "wrong", group: string) => {
    let sourceWords: string[][] = [];
    if (currentMode === "all") {
      if (group === "全部") sourceWords = [...allVocabularyWords];
      else {
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

    if (sourceWords.length === 0) { alert("無可用單字"); return; }
    
    const shuffled = shuffleArray(sourceWords);
    const finalCount = count === "all" ? shuffled.length : Math.min(count as number, shuffled.length);
    
    setQuizList(shuffled.slice(0, finalCount));
    setCurrentQuizIndex(0);
    setScore(0);
    setQuizFinished(false);
    setIsAnswered(false);
  }, []);

  // 當配置變更時，強制重置練習
  const handleConfigChange = (newMode: "all" | "wrong", newGroup: string, newCount: number | "all") => {
    setMode(newMode);
    setSelectedGroup(newGroup);
    setQuestionCount(newCount);
    router.push(`?group=${encodeURIComponent(newGroup)}`);
    initQuiz(newCount, newMode, newGroup);
  };

  useEffect(() => { initQuiz(questionCount, mode, selectedGroup); }, []);

  useEffect(() => {
    if (quizList.length > 0 && quizList[currentQuizIndex]) speak(quizList[currentQuizIndex][0]);
  }, [currentQuizIndex, quizList]);

  useEffect(() => {
    if (quizList.length === 0 || quizFinished) return;
    const currentWord = quizList[currentQuizIndex];
    const others = allVocabularyWords.filter((w) => w[0] !== currentWord[0]);
    const wrongAnswers = shuffleArray(others).slice(0, 3).map(w => w[1]);
    setOptions(shuffleArray([currentWord[1], ...wrongAnswers]));
    setIsAnswered(false);
  }, [quizList, currentQuizIndex, quizFinished]);

  const handleOptionClick = async (opt: string) => {
    if (isAnswered) return;
    setIsAnswered(true);
    if (opt === quizList[currentQuizIndex][1]) setScore(p => p + 1);
    else if (auth.currentUser) {
      await setDoc(doc(db, "users", auth.currentUser.uid, "wrongWords", quizList[currentQuizIndex][0]), { meaning: quizList[currentQuizIndex][1] });
    }
  };

  return (
    <main style={{ maxWidth: "700px", margin: "40px auto", padding: "0 20px" }}>
      <div className="shell" style={{ padding: "20px" }}>
        {!quizFinished ? (
          <div>
            {/* 配置區域 */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <button className={`btn ${mode === "all" ? "active" : ""}`} onClick={() => handleConfigChange("all", selectedGroup, questionCount)}>📖 全部單字</button>
              <button className={`btn ${mode === "wrong" ? "active" : ""}`} onClick={() => handleConfigChange("wrong", selectedGroup, questionCount)} style={{ marginLeft: 10 }}>🎯 不熟悉單字</button>
              {mode === "all" && (
                <div style={{ marginTop: 10 }}>
                  <p>選擇分組：</p>
                  {groupButtons.map(g => (
                    <button key={g} className={`btn ${selectedGroup === g ? "active" : ""}`} onClick={() => handleConfigChange("all", g, questionCount)} style={{ margin: "2px" }}>{g}</button>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 10 }}>
                <p>選擇題數：</p>
                {[10, 30, 50, "all"].map(num => (
                  <button key={num} className={`btn ${questionCount === num ? "active" : ""}`} onClick={() => handleConfigChange(mode, selectedGroup, num as number | "all")} style={{ margin: "2px" }}>{num === "all" ? "全部" : `${num} 題`}</button>
                ))}
              </div>
            </div>

            {/* 進度顯示 */}
            <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "1.2rem" }}>
              範圍：{mode === "all" ? selectedGroup : "不熟悉單字"} | 進度：{currentQuizIndex + 1} / {quizList.length}
            </div>

            <div style={{ fontSize: "2.5rem", textAlign: "center", margin: "20px 0" }}>{quizList[currentQuizIndex]?.[0]}</div>
            <div className="options-grid">
              {options.map((opt, i) => (
                <button key={i} className={`opt-btn ${isAnswered ? (opt === quizList[currentQuizIndex][1] ? "correct" : "wrong") : ""}`} onClick={() => handleOptionClick(opt)} disabled={isAnswered}>{opt}</button>
              ))}
            </div>

            {isAnswered && (
              <button className="btn" style={{ width: "100%", marginTop: 20 }} onClick={() => currentQuizIndex === quizList.length - 1 ? setQuizFinished(true) : setCurrentQuizIndex(p => p + 1)}>
                {currentQuizIndex === quizList.length - 1 ? "查看結果" : "下一題 ➡️"}
              </button>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <h2>🎉 完成！得分：{score} / {quizList.length}</h2>
            <button className="btn" onClick={() => initQuiz(questionCount, mode, selectedGroup)}>再挑戰一次</button>
          </div>
        )}
      </div>
    </main>
  );
}