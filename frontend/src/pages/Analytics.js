import React from "react";
import { HistoryLine } from "../components/Charts";

export default function Analytics({ history }) {
  return (
    <div className="page">
      <h1>Analytics</h1>

      {history.length > 0 ? (
        <HistoryLine history={history} />
      ) : (
        <p>No data yet</p>
      )}
    </div>
  );
}