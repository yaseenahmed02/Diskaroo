import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import PieChart from "./PieChart";
import BarChart from "./BarChart";
import { useLocation } from "react-router-dom";
import GraphsDisplay from "./GraphsDisplay";
import { useNavigate } from "react-router-dom";
import DirectoryTree from "./Directory";
import { dialog } from "@tauri-apps/api";
import html2canvas from 'html2canvas';
import { toPng, toJpeg } from 'html-to-image';
import Pdf from 'react-to-pdf';
import format from 'date-fns/format';

const TreeNode = ({ node }) => {
  const [collapsed, setCollapsed] = useState(true);
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const icon = node.type === 'folder' ? '📁' : '📄';
  const name = node.name.split('/').pop();

  return (
    <div key={node.name}>
      <div onClick={toggleCollapse}>
        {node.type === 'folder' ? collapsed ? '➡️' : '⬇️' : ''} {`${icon} ${name}`}
      </div>
      {!collapsed && node.children && (
        <div style={{ marginLeft: '1rem' }}>
          {node.children.map((child) => (
            <TreeNode key={child.name} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};


function Summary() {
  const [diskData, setDiskData] = useState(null);
  const [showBarGraph, setShowBarGraph] = useState(false);
  const [showPieChart, setShowPieChart] = useState(false); // State for pie chart visibility
  const [dirData, setDirData] = useState(null);
  const [activeTab, setActiveTab] = useState(null); // 'disk' or 'directory'

  const location = useLocation();
  const navigate = useNavigate();
  const dirPath = location.state?.dirPath;
  const [showDirectoryTree, setShowDirectoryTree] = useState(false); // tree
  const [directoryData, setDirectoryData] = useState(null);
  const [exportDir, setExportDir] = useState("");
  useEffect(() => {
    // Automatically trigger disk analysis on component mount
    handleAnalyze();
  }, []);


  function handleAnalyze() {
    invoke("analyze_disk")
      .then((responseString) => {
        const parsedData = JSON.parse(responseString);
        setDiskData(parsedData);
      })
      .catch((error) => {
        console.error("Error calling analyze_disk:", error);
      });
  }

  function handleDirectoryAnalyze() {
    invoke("analyze_directory", { dirPath: dirPath })
      .then((responseString) => {
        const parsedData = JSON.parse(responseString);
        setDirData(parsedData);
      })
      .catch((error) => {
        console.error("Error calling analyze_directory:", error);
      });
  }

  const handleShowTree = () => {
    invoke("get_directory_data", { dirPath: dirPath })
      .then((responseString) => {
        if (responseString === null) {
          console.log("NULL");
        }
        const parsedData = JSON.parse(responseString);
        setDirectoryData(parsedData);
        console.log(parsedData);
      })
      .catch((error) => {
        console.error("Error calling get_directory_data:", error);
      });
  };
  

  const renderTree = (node) => {
    if (!node) return null;
  
    const icon = node.type === 'folder' ? '📁' : '📄';
    const name = node.name.split('/').pop(); // Extract the folder/file name
  
    return (
      <div key={node.name}>
        <div>{`${icon} ${name}`}</div>
        {node.children && (
          <div style={{ marginLeft: '1rem' }}>
            {node.children.map((child) => renderTree(child))}
          </div>
        )}
      </div>
    );
  };

  

  function navigateToHome() {
    navigate("/");
  }

  function handleClear() {
    setDiskData(null);
    setShowBarGraph(false);
  }

  function bytesToGB(bytes) {
    const ONE_GB = 1_073_741_824; // Bytes in one GB
    if (bytes < ONE_GB) {
      // If size is less than 1 GB, show in MB with 2 decimal places
      return (bytes / 1_048_576).toFixed(2) + " MB";
    } else {
      // If size is 1 GB or more, show in GB with 3 decimal places
      return (bytes / ONE_GB).toFixed(3) + " GB";
    }
  }

  const [pieChartRef, setPieChartRef] = useState(null);
  const handleExportPieChart = async () => {
    try {
      if (!pieChartRef) {
        console.error("PieChart reference not found.");
        return;
      }

      // Save as PNG
      const pngDataUrl = await toPng(pieChartRef, { cacheBust: true });
      const pngLink = document.createElement("a");
      pngLink.download = `${getFileName("png")}`;
      pngLink.href = pngDataUrl;
      pngLink.click();

      // Save as PDF
      const pdfDataUrl = await new Promise((resolve) => {
        // Create a temporary div to render the component for PDF export
        const tempDiv = document.createElement("div");
        tempDiv.appendChild(pieChartRef.cloneNode(true));

        // Use html2canvas to capture the cloned component as an image
        html2canvas(tempDiv).then((canvas) => {
          // Convert the canvas to data URL
          const dataUrl = canvas.toDataURL("image/png");
          resolve(dataUrl);
        });
      });

      // Save the PDF data URL to a Blob
      const pdfBlob = await (await fetch(pdfDataUrl)).blob();

      // Create a link for PDF download
      const pdfLink = document.createElement("a");
      pdfLink.download = `${getFileName("pdf")}`;
      pdfLink.href = URL.createObjectURL(pdfBlob);
      pdfLink.click();

      console.log("PieChart exported successfully!");
    } catch (error) {
      console.error("Error exporting PieChart:", error);
    }
  };


  const handleExportBarGraph = async () => {
    try {
      const path = await dialog.open({ directory: true });
      if (path) {
        console.log("Export Directory chosen:", path);
        setExportDir(path);
        // Now you can pass exportDir to your export function or store it for later use
      } else {
        console.error("No export directory selected.");
      }
    } catch (error) {
      console.error("Error selecting export directory:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
    <header className="my-6">
      <h1 className="text-4xl font-bold text-left">Disk Analyzer</h1>
      <div className="flex justify-start space-x-4 my-4">
        {/*back button */}
        <button
          className={`px-4 py-2 rounded ${
          activeTab === "disk" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => {
            navigateToHome();
          }}
        >Back</button>
        <button
          className={`px-4 py-2 rounded ${
          activeTab === "disk" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => {
            setActiveTab("disk");
            if (!diskData) {
              handleAnalyze();
            }
          }}
        >
          Disk Analysis
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "directory"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => {
            setActiveTab("directory");
            handleDirectoryAnalyze();
          }}
        >
          Directory Analysis
        </button>
        {/* Directory Tree Tab */}
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "directoryTree"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => {
            setActiveTab("directoryTree");
            handleShowTree();
          }}
        >
          Directory Tree
        </button>
        {/* End Directory Tree Tab */}
      </div>
      </header>
      <main>
        {/* Disk Analysis Tab */}
        {activeTab === "disk" && diskData && (
          <div
            className="card bg-white shadow-lg p-4 rounded"
            style={{ textAlign: "left" }}
          >
            <h2>Disk Analysis</h2>
            <p>Disk Name: {diskData.disk_name}</p>
            <p>File System: {diskData.file_system}</p>
            <p>Disk Type: {diskData.disk_type}</p>
            <p>Mount Point: {diskData.mount_point}</p>
            <p>Total Space: {bytesToGB(diskData.total_space)}</p>
            <p>Used Space: {bytesToGB(diskData.used_space)}</p>
            <p>Free Space: {bytesToGB(diskData.free_space)}</p>
            <p>Percentage Used: {diskData.percentage_used.toFixed(2)}%</p>
            <div className="actions flex space-x-2 mt-4">
              <button
                onClick={handleClear}
                className="action-button bg-red-500 text-white px-4 py-2 rounded"
              >
                Clear
              </button>
              <button
                onClick={() => setShowBarGraph(!showBarGraph)}
                className="action-button bg-green-500 text-white px-4 py-2 rounded"
              >
                {showBarGraph ? "Hide" : "Show"} Bar Graph
              </button>
              <button
                onClick={() => setShowPieChart(!showPieChart)}
                className="action-button bg-blue-500 text-white px-4 py-2 rounded"
              >
                {showPieChart ? "Hide" : "Show"} Pie Chart
              </button>
            </div>
            {showBarGraph && <BarChart />}
    
            {showPieChart && (
        <div>
          <PieChart
            data={diskData}
            id="pieChartContainer"
            ref={(ref) => setPieChartRef(ref)}
          />
          <button
            onClick={handleExportPieChart}
            className="action-button bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Export Pie Chart
          </button>
        </div>
      )}
            
          </div>
        )}

        {/* Directory Analysis Tab */}
        {activeTab === "directory" && dirData && (
          <div
            className="card bg-white shadow-lg p-4 rounded"
            style={{ textAlign: "left" }}
          >
            <h2>Directory Analysis</h2>
            <h3>Largest 10 Files:</h3>
            <ul>
              {dirData.largest_files.map((file, index) => (
                <li key={index}>
                  Path: {file.path}
                  <br />
                  Size: {bytesToGB(file.size)}
                  <br />
                  Last Modified: {new Date(file.last_modified).toLocaleString()}
                </li>
              ))}
            </ul>
            <h3>Largest File:</h3>
            <p>
              Path: {dirData.largest_file.path}
              <br />
              Size: {bytesToGB(dirData.largest_file.size)}
              <br />
              Last Modified:{" "}
              {new Date(dirData.largest_file.last_modified).toLocaleString()}
            </p>
            <h3>Smallest File:</h3>
            <p>
              Path: {dirData.smallest_file.path}
              <br />
              Size: {bytesToGB(dirData.smallest_file.size)}
              <br />
              Last Modified:{" "}
              {new Date(dirData.smallest_file.last_modified).toLocaleString()}
            </p>
          </div>
        )}
        {/* Directory Tree Component */}
        <div className="card bg-white shadow-lg p-4 rounded" style={{ textAlign: "left" }}>
          {directoryData && activeTab === "directoryTree" && (
            <TreeNode node={directoryData} />
          )}
        </div>
      </main>
    </div>
  );
}

export default Summary;
