import React from 'react';

const WeightTrackerChart = ({formData }) => {

  console.log(formData);
  // Data points for the weight tracking
  const weightData = [
   
    { month: '1st month', weight: formData.weight },
    { month: '2nd month', weight: formData.secondMonthGoal },
    { month: '3rd month', weight: formData.thirdMonthGoal },
    { month: '4th month', weight: formData.fourthMonthGoal },
   
  ];
  
  // Chart dimensions - reduced padding
  const chartWidth = 800;
  const chartHeight = 400;
  const padding = { top: 10, right: 40, bottom: 40, left: 40 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;
  
  // Calculate positions for plotting
  const maxWeight = Math.max(...weightData.map(d => d.weight));
  const minWeight = Math.min(...weightData.map(d => d.weight));
  const buffer = 5; // Reduced buffer
  
  // Scale functions
  const getXPosition = (index) => {
    const spacing = graphWidth / (weightData.length - 1); // spread across full graph
    return padding.left + index * spacing;
  };
  
  const getYPosition = (weight) => {
    const yScale = graphHeight / (maxWeight - minWeight + buffer * 2);
    return padding.top + graphHeight - ((weight - minWeight + buffer) * yScale);
  };
  
  // Create SVG path for the line
  const createLinePath = () => {
    return weightData.map((point, index) => {
      const x = getXPosition(index);
      const y = getYPosition(point.weight);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  return (
    <div className="container p-0">
      <div className="border-custom">
        <div className="card-body p-0">
          <h5 className="text-center class-primary mb-2">Your Weight (LBS)</h5>
          <div className='chart-width'>
          <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            {/* Horizontal grid lines */}
            {[...Array(4)].map((_, i) => (
              <line 
                key={`grid-h-${i}`}
                x1={padding.left} 
                y1={padding.top + i * (graphHeight / 3)} 
                x2={padding.left + graphWidth}
                y2={padding.top + i * (graphHeight / 3)}
                stroke="#e0e0e0" 
                strokeWidth="1"
              />
            ))}
            
            {/* Vertical axis (left) */}
            <line 
              x1={padding.left} 
              y1={padding.top} 
              x2={padding.left} 
              y2={padding.top + graphHeight}
              stroke="#888787" 
              strokeWidth="4"
            />
            
            {/* Horizontal axis (bottom) */}
            <line 
              x1={padding.left} 
              y1={padding.top + graphHeight} 
              x2={padding.left + graphWidth} 
              y2={padding.top + graphHeight}
              stroke="#888787" 
              strokeWidth="4"
            />
            
            {/* Line graph */}
            <path 
              d={createLinePath()} 
              fill="none" 
              stroke="#2FBAAC" 
              strokeWidth="8"
              strokeLinecap="round"
            />
            
            {/* Data points */}
            {weightData.map((point, index) => (
              <g key={`point-${index}`}>
                <circle 
                  cx={getXPosition(index)} 
                  cy={getYPosition(point.weight)} 
                  r={index === weightData.length - 1 ? 30 : 8}
                  fill={index === weightData.length - 1 ? "#2FBAAC" : "white"} 
                  stroke="#2FBAAC"
                  strokeWidth="8"
                />
                <text 
                  x={getXPosition(index)} 
                  y={getYPosition(point.weight) + (index === weightData.length - 1 ? 6 : -65)} 
                  textAnchor="middle" 
                  fill={index === weightData.length - 1 ? "white" : "#2FBAAC"}
                  fontWeight="bold"
                  fontSize={index === weightData.length - 1 ? "28px" : "28px"}
                >
                  {point.weight}
                </text>
                
                {/* Month labels */}
                <text 
                  x={getXPosition(index)} 
                  y={padding.top + graphHeight + 35} 
                  textAnchor="middle" 
                  fill="#2F827A"
                  fontSize={18}
                >
                  {point.month}
                </text>
              </g>
            ))}
            
          
          </svg>
          </div>
          <div className="text-center mt-class">
            <span className="d-inline-flex align-items-center">
              <span className="badge rounded-circle bg-primary me-2" style={{width: "12px", height: "12px"}}></span>
              EaseMD Patient Journey
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeightTrackerChart;