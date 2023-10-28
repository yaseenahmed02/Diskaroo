import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Progress() {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Initializing...");
  const navigate = useNavigate(); // Hook to programmatically navigate

  useEffect(() => {
    if (progress < 100) {
      const interval = setInterval(() => {
        const newProgress = progress + 10;
        setProgress(newProgress);

        switch (newProgress) {
          case 10:
            setMessage("Accessing memory...");
            break;
          case 30:
            setMessage("Scanning disk...");
            break;
          case 60:
            setMessage("Analyzing data blocks...");
            break;
          case 90:
            setMessage("Finalizing scan...");
            break;
          case 100:
            setMessage("Scan complete!");
            clearInterval(interval); // Clear the interval when scan is complete
            navigate("/summary"); // Navigate to the summary page
            break;
          default:
            break;
        }
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [progress, navigate]);

  return (
    <div className="Progress">
      <h1>Progress Page</h1>
      <div className="progress-bar">
        <div
          className="progress-indicator"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p>{message}</p>
      <div>
        <button onClick={() => setProgress(progress - 10)}>Pause</button>
        <button onClick={() => setProgress(0)}>Cancel</button>
      </div>
    </div>
  );
}

export default Progress;
