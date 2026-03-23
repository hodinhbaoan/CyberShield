import { useState } from "react";
import "./App.css";
import { ConfidenceBar, SafetyPie, HistoryLine } from "./components/Charts";

function App() {
  const [activeTab, setActiveTab] = useState("email");
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const API = "http://127.0.0.1:8000";

  const handleScan = async () => {
    // ✅ BLOCK EMPTY INPUT
    if (!input || input.trim() === "") {
      setErrorMsg("⚠️ Please enter some content first.");
      return;
    }

    setLoading(true);
    setResult(null);
    setErrorMsg("");

    try {
      let endpoint = "";
      let payload = {};

      if (activeTab === "email") {
        endpoint = "/predict-email";
        payload = { text: input.trim() }; // ✅ always trimmed
      } else {
        endpoint = "/predict-url";
        payload = { url: input.trim() };
      }

      console.log("Sending:", payload); // DEBUG

      const response = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // ✅ HANDLE BACKEND ERRORS BETTER
      if (!response.ok) {
        let errText = "Server error";
        try {
          const errData = await response.json();
          errText = errData.detail || errText;
        } catch {}
        throw new Error(errText);
      }

      const data = await response.json();
      console.log("Response:", data);

      const conf = data.confidence
        ? Math.round(data.confidence * 100)
        : data.prediction === "Spam" || data.prediction === "Phishing"
        ? 85
        : 92;

      setResult(data.prediction);
      setConfidence(conf);

      const newEntry = {
        type: activeTab,
        input: input,
        prediction: data.prediction,
        confidence: conf,
        time: new Date().toLocaleTimeString(),
      };

      setHistory((prev) => [newEntry, ...prev]);

    } catch (error) {
      console.error(error);
      setResult("error");
      setErrorMsg(error.message || "Something went wrong");
    }

    setLoading(false);
  };

  const isDanger =
    result === "Spam" || result === "Phishing" || result === "Scam";

  const switchTab = (tab) => {
    setActiveTab(tab);
    setInput("");
    setResult(null);
    setConfidence(0);
    setErrorMsg("");
  };

  const exportCSV = () => {
    if (history.length === 0) {
      setErrorMsg("No data to export.");
      return;
    }

    const rows = [
      ["Type", "Input", "Prediction", "Confidence", "Time"],
      ...history.map((h) => [
        h.type,
        `"${h.input.replace(/"/g, '""')}"`,
        h.prediction,
        h.confidence + "%",
        h.time,
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "scan_history.csv";
    link.click();
  };

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <div className="brand">
          <div className="icon">🛡️</div>
          <div>
            <h1>CyberShield</h1>
            <span>Smart Detection for Spam & Phishing</span>
          </div>
        </div>
        <div className="badges">
          <span>⚡ AI-Powered</span>
          <span>🔒 Secure</span>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <h2>Protect Your Digital Space</h2>
        <p>
          Detect spam emails and phishing URLs using machine learning in
          real-time
        </p>
      </section>

      {/* MAIN */}
      <main className="content">
        {/* LEFT PANEL */}
        <div className="panel">
          <h3>Scan Content</h3>

          <div className="tabs">
            <button
              className={`tab ${activeTab === "email" ? "active" : ""}`}
              onClick={() => switchTab("email")}
            >
              📄 Email Detection
            </button>
            <button
              className={`tab ${activeTab === "url" ? "active" : ""}`}
              onClick={() => switchTab("url")}
            >
              🌐 URL Detection
            </button>
          </div>

          {activeTab === "email" && (
            <>
              <label>Paste email content</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter email text..."
              />
            </>
          )}

          {activeTab === "url" && (
            <>
              <label>Enter URL</label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="https://example.com"
              />
            </>
          )}

          {/* ✅ ERROR MESSAGE UI */}
          {errorMsg && (
            <div style={{ color: "#f87171", marginBottom: "10px" }}>
              {errorMsg}
            </div>
          )}

          <button
            className="primary-btn"
            onClick={handleScan}
            disabled={loading || !input.trim()}
            style={{
              opacity: loading || !input.trim() ? 0.6 : 1,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Scanning..." : "Scan Now"}
            {loading && <span className="btn-loader"></span>}
          </button>

          <button className="secondary-btn" onClick={exportCSV}>
            Export History
          </button>
        </div>

        {/* RIGHT PANEL */}
        <div className="panel result">
          <h3>Analysis Results</h3>

          {!result && !loading && (
            <div className="result-box">
              <h4>Ready to Scan</h4>
              <p>Enter input to start detection</p>
            </div>
          )}

          {loading && (
            <div className="result-box">
              <h4>Scanning...</h4>
            </div>
          )}

          {result && result !== "error" && (
            <>
              <div className="analysis-card">
                <div className="analysis-header">
                  <div className="status">
                    <div className="status-icon">
                      {isDanger ? "⚠️" : "✅"}
                    </div>
                    <div>
                      <h4>
                        {isDanger ? "Threat Detected" : "Content is Safe"}
                      </h4>
                      <span>Analysis complete</span>
                    </div>
                  </div>

                  <div
                    className={isDanger ? "danger-badge" : "secure-badge"}
                  >
                    {isDanger ? "Warning" : "Secure"}
                  </div>
                </div>

                <div className="confidence-box">
                  <div className="confidence-title">
                    <span>Confidence</span>
                    <span>{confidence}%</span>
                  </div>

                  <div className="confidence-bar">
                    <div
                      className={`confidence-fill ${
                        isDanger ? "danger" : "safe"
                      }`}
                      style={{ width: `${confidence}%` }}
                    ></div>
                  </div>
                </div>

                <p style={{ opacity: 0.7 }}>
                  {isDanger
                    ? "This content contains suspicious patterns."
                    : "No threats detected. Looks safe."}
                </p>
              </div>

              <ConfidenceBar confidence={confidence} />
              <SafetyPie result={result} />
            </>
          )}

          {result === "error" && (
            <div className="result-box">
              <h4>❌ {errorMsg || "Connection Error"}</h4>
            </div>
          )}

          {history.length > 0 && (
            <>
              <div className="history">
                <h4>Recent Scans</h4>
                {history.slice(0, 5).map((h, i) => (
                  <div key={i} className="history-item">
                    <span>{h.type}</span>
                    <span>{h.prediction}</span>
                    <span>{h.confidence}%</span>
                  </div>
                ))}
              </div>

              <HistoryLine history={history.slice(0, 10)} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;