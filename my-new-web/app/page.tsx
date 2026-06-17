export default function HomePage() {
  return (
    <main style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "80vh", 
      textAlign: "center",
      padding: "20px"
    }}>
      <h1 style={{ fontSize: "3rem", color: "#1e293b", marginBottom: "1rem" }}>
        歡迎來到多益單字高效學習系統
      </h1>
      <p style={{ color: "#64748b", fontSize: "1.2rem" }}>
        專為精準衝刺多益單字設計，結合智慧錯題追蹤，幫你省下重複背誦已知單字的時間。
      </p>
    </main>
  );
}