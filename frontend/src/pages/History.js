import React from "react";

export default function History({ history }) {
  return (
    <div className="page">
      <h1>Scan History</h1>

      {history.length === 0 ? (
        <p>No scans yet</p>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>Text</th>
              <th>Result</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, i) => (
              <tr key={i}>
                <td>{item.text}</td>
                <td>{item.result}</td>
                <td>{item.confidence}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}