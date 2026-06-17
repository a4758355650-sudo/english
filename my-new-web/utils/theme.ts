// src/utils/theme.ts
export const theme = {
  // 這是給頁面主要容器用的樣式
  container: {
    maxWidth: "600px",
    margin: "50px auto",
    padding: "40px",
    background: "#ffffff",
    border: "1px solid #e0e0e0",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  // 這是給按鈕用的統一樣式
  button: {
    display: "block",
    width: "100%",
    padding: "16px",
    margin: "10px 0",
    background: "#ffffff",
    border: "1px solid #d1d1d1",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    textAlign: "center" as const,
  }
};