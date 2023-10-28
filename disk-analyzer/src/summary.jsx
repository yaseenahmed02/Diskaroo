import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import PieChart from "./PieChart";
import BarChart from "./BarChart";

function Summary() {
  const [diskData, setDiskData] = useState(null);
  const [showGraph, setShowGraph] = useState(false);

  function handleAnalyze(event) {
    event.preventDefault();

    // Call the analyze_disk command from the backend
    invoke("analyze_disk")
      .then((responseString) => {
        // Parse the JSON response and set it in the state
        try {
          const parsedData = JSON.parse(responseString);
          setDiskData(parsedData);
          setShowGraph(true); // Show the "View Graph" button after analysis
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
    setShowGraph(false); // Hide the chart when clearing
  }

  return (
    <div className="Summary">
      <header className="Summary-header">
        <h1>Disk Analyzer</h1>
      </header>
      <main>
        <button onClick={handleAnalyze}>Show</button>
        {diskData && (
          <div>
            <h2>Disk Analysis</h2>
            <p>Disk Name: {diskData.disk_name}</p>
            <p>File System: {diskData.file_system}</p>
            <p>Total Space: {diskData.total_space} bytes</p>
            <p>Used Space: {diskData.used_space} bytes</p>
            <p>Free Space: {diskData.free_space} bytes</p>
            <p>Biggest 10 files in the system:</p>
          </div>
        )}
        {showGraph && (
          <div>
            <button onClick={handleClear}>Clear</button>
            <button onClick={() => setShowGraph(false)}>Hide Graph</button>
          </div>
        )}
      </main>
      <div className="ChartsContainer">
      {showGraph && <PieChart />}
      {showGraph && <BarChart />}
      </div>
    </div>
  );
}

export default Summary;
