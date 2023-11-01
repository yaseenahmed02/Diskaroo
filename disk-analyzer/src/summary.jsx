import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import PieChart from "./PieChart";
import BarChart from "./BarChart";
import { useLocation } from "react-router-dom";

function Summary() {
  const [diskData, setDiskData] = useState(null);
  const [showBarGraph, setShowBarGraph] = useState(false);
  const [dirData, setDirData] = useState(null);

  const location = useLocation();
  const dirPath = location.state?.dirPath;

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

  function handleDirectoryAnalyze(event) {
    console.log("handleDirectoryAnalyze was called");
    event.preventDefault();

    // Call the analyze_directory command from the backend
    invoke("analyze_directory", { dirPath: dirPath })
      .then((responseString) => {
        const parsedData = JSON.parse(responseString);
        console.log(parsedData);
        setDirData(parsedData);
      })
      .catch((error) => {
        console.error("Error calling analyze_directory:", error);
      });
  }

  function handleClear() {
    setDiskData(null);
    setShowBarGraph(false);
  }

  function bytesToGB(bytes) {
    return (bytes / 1_073_741_824).toFixed(2); // This will give you a result with two decimal places
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

        <button
          onClick={handleDirectoryAnalyze} // Assuming you've defined this function
          className="mb-4 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        >
          View Directory Data
        </button>

        {diskData && (
          <div className="flex">
            <div className="mr-8">
              <h2>Disk Analysis</h2>
              <p>Disk Name: {diskData.disk_name}</p>
              <p>File System: {diskData.file_system}</p>
              <p>Disk Type: {diskData.disk_type}</p>
              <p>Mount Point: {diskData.mount_point}</p>
              <p>Total Space: {bytesToGB(diskData.total_space)} GB</p>
              <p>Used Space: {bytesToGB(diskData.used_space)} GB</p>
              <p>Free Space: {bytesToGB(diskData.free_space)} GB</p>
              <p>Percentage Used: {diskData.percentage_used.toFixed(2)}%</p>
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

        {dirData && (
          <div className="flex mt-8">
            <div className="mr-8">
              <h2>Directory Analysis</h2>
              <h3>Largest 10 Files:</h3>
              <ul>
                {dirData.largest_files.map((file, index) => (
                  <li key={index}>
                    Path: {file.path}
                    <br />
                    Size: {bytesToGB(file.size)} GB
                    <br />
                    Last Modified:{" "}
                    {new Date(file.last_modified).toLocaleString()}
                  </li>
                ))}
              </ul>
              <h3>Largest File:</h3>
              <p>
                Path: {dirData.largest_file.path}
                <br />
                Size: {bytesToGB(dirData.largest_file.size)} GB
                <br />
                Last Modified:{" "}
                {new Date(dirData.largest_file.last_modified).toLocaleString()}
              </p>
              <h3>Smallest File:</h3>
              <p>
                Path: {dirData.smallest_file.path}
                <br />
                Size: {bytesToGB(dirData.smallest_file.size)} GB
                <br />
                Last Modified:{" "}
                {new Date(dirData.smallest_file.last_modified).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </main>
      <div className="ChartsContainer mt-8">{showBarGraph && <BarChart />}</div>
    </div>
  );
}

export default Summary;
