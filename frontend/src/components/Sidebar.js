import React from "react";

export default function Sidebar({ setPage, page }) {
  return (
    <div className="sidebar">
      <h2>🛡️ AI Shield</h2>

      <button
        className={page === "dashboard" ? "active" : ""}
        onClick={() => setPage("dashboard")}
      >
        Dashboard
      </button>

      <button
        className={page === "analytics" ? "active" : ""}
        onClick={() => setPage("analytics")}
      >
        Analytics
      </button>

      <button
        className={page === "history" ? "active" : ""}
        onClick={() => setPage("history")}
      >
        History
      </button>
    </div>
  );
}