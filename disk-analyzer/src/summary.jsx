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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === "c") {
        // Check if CMD+SHIFT+C keys are pressed to collapse
        if (!collapsed) {
          setCollapsed(true);
        }
      } else if ((event.metaKey || event.ctrlKey) && event.key === "u") {
        // Check if CMD+U keys are pressed to uncollapse
        if (collapsed) {
          setCollapsed(false);
        }
      }
    };

    // Attach the event listener for keydown
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup: Remove the event listener when component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [collapsed]); 

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
  const [showBarGraph, setShowBarGraph] = useState(false);
  const [showPieChart, setShowPieChart] = useState(false); // State for pie chart visibility
  const [activeTab, setActiveTab] = useState(null); // 'disk' or 'directory'

  const location = useLocation();
  const navigate = useNavigate();
  const dirPath = location.state?.dirPath;
  const directoryData = location.state?.directoryData;
  const dirData = location.state?.dirData;
  const diskData = location.state?.diskData;
  const [exportDir, setExportDir] = useState("");

  const [showTotalSpacePieChart, setShowTotalSpacePieChart] = useState(false);
const [showUsedSpacePieChart, setShowUsedSpacePieChart] = useState(false);
  useEffect(() => {
    // Automatically trigger disk analysis on component mount
    setActiveTab("disk");
    const handleKeyDown = (event) => {
      // Check for CMD (Meta key for Mac) and corresponding key combinations
      if ((event.metaKey || event.ctrlKey) && event.key === "d") {
        // Perform directory analysis action (CMD+D)
        setActiveTab("directory");
        console.log("CMD+D pressed - Directory Analysis triggered");
        // Call your directory analysis function here
      } else if ((event.metaKey || event.ctrlKey) && event.key === "t") {
        // Perform directory tree action (CMD+T)
        setActiveTab("directoryTree");
        console.log("CMD+T pressed - Directory Tree triggered");
        // Call your directory tree function here
      } else if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === "a") {
        // Perform disk analysis action (CMD+A)
        setActiveTab("disk");
        console.log("CMD+A pressed - Disk Analysis triggered");
        // Call your disk analysis function here
      }else if ((event.metaKey || event.ctrlKey) && event.key === "p") {
        // Perform disk analysis action (CMD+A)
        setShowPieChart(!showPieChart);
        setShowUsedSpacePieChart(!showUsedSpacePieChart);
        console.log("CMD+P pressed - Pie Chart triggered");
        // Call your disk analysis function here
      }else if ((event.metaKey || event.ctrlKey) && event.key === "b") {
        setShowBarGraph(!showBarGraph);
        console.log("CMD+B pressed - Bar chart triggered");
        // Call your disk analysis function here
      }
    };

    // Attach the event listener for keydown
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup: Remove the event listener when component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);




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
  onClick={() => setShowUsedSpacePieChart(!showUsedSpacePieChart)}
  className="action-button bg-green-500 text-white px-4 py-2 rounded"
>
  {showUsedSpacePieChart ? "Hide" : "Show"} Used Space Pie Chart
</button>
              
              
            </div>
            
            {showTotalSpacePieChart && (
  <div>
    {/* Render PieChart for Total Space */}
    <PieChart
      data={[diskData.total_space, diskData.used_space]}
      colors={['#43A19E', '#FF9824']}
      labels={true}
      percent={true}
      id="totalSpacePieChartContainer"
      ref={(ref) => setTotalSpacePieChartRef(ref)}
      itemNames={['Total Space', 'Used Space']}
    />
  </div>
)}

{showUsedSpacePieChart && (
  <div>
    {/* Render PieChart for Used Space */}
    <PieChart
      data={[diskData.used_space, diskData.total_space - diskData.used_space]}
      colors={['#7B43A1', '#F2317A']}
      labels={true}
      percent={true}
      id="usedSpacePieChartContainer"
      ref={(ref) => setUsedSpacePieChartRef(ref)}
      itemNames={['Used Space', 'Free Space']}
    />
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
            <button
                onClick={() => setShowPieChart(!showPieChart)}
                className="action-button bg-blue-500 text-white px-4 py-2 rounded"
              >
                {showPieChart ? "Hide" : "Show"} Pie Chart
              </button>
              <button
                onClick={() => setShowBarGraph(!showBarGraph)}
                className="action-button bg-green-500 text-white px-4 py-2 rounded"
              >
                {showBarGraph ? "Hide" : "Show"} Bar Graph
              </button>
            {showPieChart && (
              <div>
  <PieChart
    data={dirData.largest_files.map((file) => file.size)}
    colors={['#43A19E', '#7B43A1', '#F2317A', '#FF9824', '#58CF6C']}
    labels={true}
    percent={true}
    id="pieChartContainer"
    ref={(ref) => setPieChartRef(ref)}
    itemNames={dirData.largest_files.map((file) => file.path.split('/').pop())}
  />
</div>

)}
{showBarGraph && (
              <BarChart
                chartData={dirData.largest_files.map((file) => ({ y: file.size, label: file.path.split('/').pop() }))}
                title="Biggest Files On System"
              />
            )}
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
