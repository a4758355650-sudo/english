// src/utils/tts.ts
export const speak = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US"; // 設定美式英語
  utterance.rate = 0.9;     // 語速稍微放慢一點，聽起來更清晰
  window.speechSynthesis.speak(utterance);
};