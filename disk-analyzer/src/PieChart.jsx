import React from 'react';
import { dialog } from '@tauri-apps/api';

function LegendItem({ color, label, itemNames }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
      <div
        style={{
          width: '20px',
          height: '20px',
          backgroundColor: color,
          marginRight: '5px',
        }}
      ></div>
      <span>{itemNames[label]}</span>
    </div>
  );
}

function PieChart( {data, colors, labels, percent, itemNames }) {
  const radius = 150;
  const strokeWidth = 3;
  const stroke = '#fff';

  const getAnglePoint = (startAngle, endAngle) => {
    const x = radius;
    const y = radius;

    const x1 = x + radius * Math.cos((Math.PI * startAngle) / 180);
    const y1 = y + radius * Math.sin((Math.PI * startAngle) / 180);
    const x2 = x + radius * Math.cos((Math.PI * endAngle) / 180);
    const y2 = y + radius * Math.sin((Math.PI * endAngle) / 180);

    return { x1, y1, x2, y2 };
  };

  const sum = data.reduce((carry, current) => carry + current, 0);
  let startAngle = 0;


  return (
    <div>
      <svg id="pieChart" width={2 * radius} height={2 * radius} viewBox={`0 0 ${2 * radius} ${2 * radius}`} xmlns="http://www.w3.org/2000/svg" version="1.1">
        {data.map((slice, sliceIndex) => {
          const angle = (slice / sum) * 360;
          const percentValue = ((slice / sum) * 100).toFixed(1); // Round to one decimal point

          const anglePoints = getAnglePoint(startAngle, startAngle + angle);
          const largeArcFlag = angle > 180 ? 1 : 0;

          const midAngle = (startAngle + startAngle + angle) / 2;
          const xText = radius + 0.6 * radius * Math.cos((Math.PI * midAngle) / 180); // Adjusted text position
          const yText = radius + 0.6 * radius * Math.sin((Math.PI * midAngle) / 180); // Adjusted text position

          const pathData = `M ${anglePoints.x1} ${anglePoints.y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${anglePoints.x2} ${anglePoints.y2} L ${radius} ${radius} Z`;

          startAngle += angle;

          return (
            
            <g overflow="hidden" key={sliceIndex}>
              <path
                d={pathData}
                fill={colors[sliceIndex % colors.length]}
                stroke={stroke}
                strokeWidth={strokeWidth}
              />
              {labels && percentValue > 5 ? (
                <text x={xText} y={yText} fill="black" textAnchor="middle">
                  {percent ? percentValue + '%' : slice}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      <div style={{ marginTop: '20px' }} id="legend">
        <h3>Legend:</h3>
        {colors.map((color, index) => (
          <LegendItem key={index} color={color} label={index} itemNames={itemNames} />
        ))}
      </div>
     
    </div>
  );
}

export default PieChart;
