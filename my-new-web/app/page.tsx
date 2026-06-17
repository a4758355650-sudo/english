// my-new-web/src/app/page.tsx
export default function Home() {
  return (
    // 這裡放你原本寫好的漂亮首頁內容
    <div style={{ maxWidth: "1200px", margin: "30px auto", padding: "0 20px" }}>
      {/* 這個結構可以完全保留你原本的首頁排版 */}
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <h1 style={{ color: "#12343b", fontSize: "32px", fontWeight: "bold" }}>歡迎來到多益單字高效學習系統</h1>
        <p style={{ color: "#64748b", marginTop: "10px" }}>專為精準衝刺多益單字設計，結合智慧錯題追蹤，幫你省下重複背誦已知單字的時間。</p>
      </div>
    </div>
  );
}