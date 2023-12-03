import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { invoke } from "@tauri-apps/api/tauri";

function Progress() {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Initializing...");
  const navigate = useNavigate();
  const location = useLocation();
  const dirPath = location.state?.dirPath;
  const [directoryData, setDirectoryData] = useState(null);
  const [diskData, setDiskData] = useState(null);
  const [dirData, setDirData] = useState(null);

  const fetchData = async () => {
    try {
      const [diskResponse, dirResponse, treeResponse] = await Promise.all([
        invoke("analyze_disk"),
        invoke("analyze_directory", { dirPath: dirPath }),
        invoke("get_directory_data", { dirPath: dirPath }),
      ]);

      const parsedDiskData = JSON.parse(diskResponse);
      setDiskData(parsedDiskData);

      const parsedDirData = JSON.parse(dirResponse);
      setDirData(parsedDirData);

      const parsedTreeData = JSON.parse(treeResponse);
      setDirectoryData(parsedTreeData);

      setProgress(50);
      setMessage("Scan complete!");
      navigate("/summary", {
        state: { dirPath, dirData: parsedDirData, directoryData: parsedTreeData, diskData: parsedDiskData },
      });
    } catch (error) {
      console.error("Error in fetching data:", error);
    }
  };

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
          default:
            break;
        }

        if (newProgress >= 50) {
          clearInterval(interval);
          fetchData();
        }
      }, 200);

      return () => {
        clearInterval(interval);
      };
    }
  }, [progress, navigate, dirPath]);

  return (
    <div className="Progress">
      <h1>Progress Page</h1>
      <div className="progress-bar">
        <div className="progress-indicator" style={{ width: `${progress}%` }}></div>
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
