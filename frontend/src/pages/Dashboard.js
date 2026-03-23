import React from "react";
import { ConfidenceBar, SafetyPie } from "../components/Charts";

export default function Dashboard({ result, confidence }) {
  return (
    <div className="page">
      <h1>Dashboard</h1>

      {result && (
        <>
          <div className="grid">
            <ConfidenceBar confidence={confidence} />
            <SafetyPie result={result} />
          </div>

          <div className="result-box">
            <h2>Result: {result}</h2>
            <p>Confidence: {confidence}%</p>
          </div>
        </>
      )}
    </div>
  );
}