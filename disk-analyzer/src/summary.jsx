import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

function Summary() {
  const [diskData, setDiskData] = useState(null);

  function handleAnalyze(event) {
    event.preventDefault();

    // Call the analyze_disk command from the backend
    invoke("analyze_disk")
      .then((responseString) => {
        // Parse the JSON response and set it in the state
        try {
          const parsedData = JSON.parse(responseString);
          setDiskData(parsedData);
        } catch (error) {
          console.error("Error parsing JSON response:", error);
        }
      })
      .catch((error) => {
        console.error("Error calling analyze_disk:", error);
      });
  }

  function handleClear() {
    // Clear the diskData state
    setDiskData(null);
  }

  return (
    <div className="Summary">
      <header className="Summary-header">
        <h1>Disk Analyzer</h1>
      </header>
      <main>
        <button onClick={handleAnalyze}>Analyze Disk</button>
        <button onClick={handleClear}>Clear</button>
        {diskData && (
          <div>
            <h2>Disk Analysis</h2>
            <p>Disk Name: {diskData.disk_name}</p>
            <p>File System: {diskData.file_system}</p>
            <p>Total Space: {diskData.total_space} bytes</p>
            <p>Used Space: {diskData.used_space} bytes</p>
            <p>Free Space: {diskData.free_space} bytes</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Summary;
