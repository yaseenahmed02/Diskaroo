import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import PieChart from "./PieChart";
import BarChart from "./BarChart";

function Summary() {
  const [diskData, setDiskData] = useState(null);
  const [showBarGraph, setShowBarGraph] = useState(false);

  function handleAnalyze(event) {
    event.preventDefault();

    // Call the analyze_disk command from the backend
    invoke("analyze_disk")
      .then((responseString) => {
        const parsedData = JSON.parse(responseString);
        setDiskData(parsedData);
      })
      .catch((error) => {
        console.error("Error calling analyze_disk:", error);
      });
  }

  function handleClear() {
    setDiskData(null);
    setShowBarGraph(false);
  }

  return (
    <div className="Summary">
      <header className="Summary-header mb-4">
        <h1>Disk Analyzer</h1>
      </header>
      <main className="flex flex-col items-start">
        <button
          onClick={handleAnalyze}
          className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Click to View Results
        </button>
        {diskData && (
          <div className="flex">
            <div className="mr-8">
              <h2>Disk Analysis</h2>
              <p>Disk Name: {diskData.disk_name}</p>
              <p>File System: {diskData.file_system}</p>
              <p>Total Space: {diskData.total_space} bytes</p>
              <p>Used Space: {diskData.used_space} bytes</p>
              <p>Free Space: {diskData.free_space} bytes</p>
              <p>Biggest 10 files in the system:</p>
              <div>
                <button
                  onClick={handleClear}
                  className="mr-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowBarGraph(!showBarGraph)}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  {showBarGraph ? "Hide" : "Show"} Bar Graph
                </button>
              </div>
            </div>
            <div>
              <PieChart />
            </div>
          </div>
        )}
      </main>
      <div className="ChartsContainer mt-8">{showBarGraph && <BarChart />}</div>
    </div>
  );
}

export default Summary;
