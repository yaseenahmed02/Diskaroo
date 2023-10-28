import React, { useState } from "react";

function Progress() {
  const [progress, setProgress] = useState(60);

  // Function to update the progress
  const updateProgress = (newProgress) => {
    setProgress(newProgress);
  };

  return (
    <div className="Progress">
      <h1>Progress Page</h1>
      <div className="progress-bar">
        <div
          className="progress-indicator"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p>Currently viewing in memory...</p>
      <div>
        <button onClick={() => updateProgress(30)}>Pause</button>
        <button onClick={() => updateProgress(0)}>Cancel</button>
      </div>
    </div>
  );
}

export default Progress;