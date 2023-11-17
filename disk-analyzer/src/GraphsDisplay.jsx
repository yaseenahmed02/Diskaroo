import React from "react";
import { useLocation } from "react-router-dom";
import PieChart from "./PieChart";
import BarChart from "./BarChart";

function GraphsDisplay() {
  const location = useLocation();
  const { diskData, dirData } = location.state;

  return (
    <div className="GraphsDisplay">
      <h1>Graphical Analysis</h1>
      {diskData && (
        <div>
          <h2>Disk Data</h2>
          <PieChart data={diskData} />
        </div>
      )}
      {dirData && (
        <div>
          <h2>Directory Data</h2>
          <BarChart data={dirData} />
        </div>
      )}
    </div>
  );
}

export default GraphsDisplay;
