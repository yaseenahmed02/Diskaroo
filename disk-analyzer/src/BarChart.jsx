import React from 'react';
import CanvasJSReact from '@canvasjs/react-charts';

const CanvasJS = CanvasJSReact.CanvasJS;
const CanvasJSChart = CanvasJSReact.CanvasJSChart;

function BarChart({ chartData, title }) {
  const options = {
    animationEnabled: true,
    theme: "light2",
    title: {
      text: title || "Bar Chart Title", // Use the provided title or a default value
    },
    axisX: {
      title: "Name",
      reversed: true,
    },
    axisY: {
      title: "Size (GB)",
      includeZero: true,
      labelFormatter: addSymbols,
    },
    data: [
      {
        type: "bar",
        dataPoints: chartData || [], // Use the provided chart data or an empty array
      },
    ],
  };

  function addSymbols(e) {
    const suffixes = ["", "K", "M", "B"];
    const order = Math.max(Math.floor(Math.log(Math.abs(e.value)) / Math.log(1000), 0));
    const index = Math.min(order, suffixes.length - 1);
    const suffix = suffixes[index];
    return CanvasJS.formatNumber(e.value / Math.pow(1000, order)) + suffix;
  }

  return (
    <div>
      <CanvasJSChart options={options} />
    </div>
  );
}

export default BarChart;
