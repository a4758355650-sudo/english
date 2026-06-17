// my-new-web/utils/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 這裡是用你剛剛拿到的真實金鑰
const firebaseConfig = {
  apiKey: "AIzaSyAH-3k4ZPRL1tR11euaByyQf4Coq_ofpx8",
  authDomain: "asas-9ed23.firebaseapp.com",
  projectId: "asas-9ed23",
  storageBucket: "asas-9ed23.firebasestorage.app",
  messagingSenderId: "256064494240",
  appId: "1:256064494240:web:21a4a4df60fa6adc1a87c5",
  measurementId: "G-Q5PECWCCLP"
};

// 防止 Next.js 在開發環境重複初始化 Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 匯出驗證服務與資料庫，給其他頁面使用
export const auth = getAuth(app);
export const db = getFirestore(app);