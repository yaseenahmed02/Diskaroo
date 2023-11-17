import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Progress() {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Initializing...");
  const navigate = useNavigate();
  const location = useLocation(); // Add this to receive the directory path
  const dirPath = location.state?.dirPath; // Extract the directory path

  useEffect(() => {
    if (progress < 50) {
      const interval = setInterval(() => {
        const newProgress = progress + 10;
        setProgress(newProgress);

        switch (newProgress) {
          case 10:
            setMessage("Accessing memory...");
            break;
          case 20:
            setMessage("Scanning disk...");
            break;
          case 30:
            setMessage("Analyzing data blocks...");
            break;
          case 40:
            setMessage("Finalizing scan...");
            break;
          case 50:
            setMessage("Scan complete!");
            clearInterval(interval);
            navigate("/summary", { state: { dirPath } }); // Pass the directory path to Summary
            break;
          default:
            break;
        }
      }, 200);

      return () => {
        clearInterval(interval);
      };
    }
  }, [progress, navigate, dirPath]); // Include dirPath in the dependency array

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
