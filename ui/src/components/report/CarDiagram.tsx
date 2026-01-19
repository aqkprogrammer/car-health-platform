"use client";

import React from "react";

export interface CarPart {
  id: string;
  name: string;
  score: number;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  side?: "left" | "right" | "center" | "front" | "rear";
  shape?: "rect" | "polygon";
  points?: string; // For polygon shapes
}

interface CarDiagramProps {
  parts: CarPart[];
  selectedPart?: string | null;
  onPartClick?: (partId: string) => void;
  viewMode?: "top" | "side";
}

export default function CarDiagram({
  parts,
  selectedPart,
  onPartClick,
  viewMode = "top",
}: CarDiagramProps) {
  const getPartFillColor = (score: number) => {
    if (score >= 4.0) return "#22c55e"; // green-500
    if (score >= 3.0) return "#eab308"; // yellow-500
    if (score >= 2.0) return "#f97316"; // orange-500
    return "#ef4444"; // red-500
  };

  const getPartStrokeColor = (score: number) => {
    if (score >= 4.0) return "#16a34a"; // green-600
    if (score >= 3.0) return "#ca8a04"; // yellow-600
    if (score >= 2.0) return "#ea580c"; // orange-600
    return "#dc2626"; // red-600
  };

  if (viewMode === "top") {
    return (
      <div className="relative w-full max-w-3xl mx-auto">
        <svg
          viewBox="0 0 500 250"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Car Body - Clear Rectangular Shape */}
          <g id="car-body">
            {/* Main car body - light gray rectangle */}
            <rect
              x="80"
              y="100"
              width="340"
              height="70"
              rx="8"
              fill="#e5e7eb"
              stroke="#d1d5db"
              strokeWidth="2"
              className="dark:fill-gray-800 dark:stroke-gray-600"
            />
            
            {/* Internal structural lines - subtle dividers */}
            <line x1="200" y1="100" x2="200" y2="170" stroke="#d1d5db" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
            <line x1="300" y1="100" x2="300" y2="170" stroke="#d1d5db" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
          </g>

          {/* Wheels - Four circles at car corners */}
          <g id="wheels">
            <circle cx="120" cy="85" r="18" fill="#1f2937" className="dark:fill-gray-200" />
            <circle cx="380" cy="85" r="18" fill="#1f2937" className="dark:fill-gray-200" />
            <circle cx="120" cy="185" r="18" fill="#1f2937" className="dark:fill-gray-200" />
            <circle cx="380" cy="185" r="18" fill="#1f2937" className="dark:fill-gray-200" />
          </g>

          {/* Front Bumper - Green Bar at Top */}
          {parts.filter(p => p.id === "front-bumper").map((part) => {
            const isSelected = selectedPart === part.id;
            const fillColor = getPartFillColor(part.score);
            const strokeColor = getPartStrokeColor(part.score);
            
            return (
              <g key={part.id} className="cursor-pointer" onClick={() => onPartClick?.(part.id)}>
                {/* Front Bumper Bar */}
                <rect
                  x="80"
                  y="92"
                  width="340"
                  height="8"
                  rx="4"
                  fill={fillColor}
                  fillOpacity={isSelected ? 0.5 : 0.4}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition-all"
                />
                
                {/* Score badge on front bumper */}
                <g transform="translate(250, 96)">
                  <rect
                    x="-20"
                    y="-10"
                    width="40"
                    height="20"
                    rx="10"
                    fill="#dcfce7"
                    stroke={strokeColor}
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#15803d"
                    className="text-xs font-bold pointer-events-none"
                    style={{ fontSize: '11px', fontWeight: 'bold' }}
                  >
                    {part.score.toFixed(1)}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Hood - Large Orange/Yellow Area Inside Car Body */}
          {parts.filter(p => p.id === "hood").map((part) => {
            const isSelected = selectedPart === part.id;
            const fillColor = getPartFillColor(part.score);
            const strokeColor = getPartStrokeColor(part.score);
            const opacity = isSelected ? 0.5 : 0.4;
            
            return (
              <g key={part.id} className="cursor-pointer" onClick={() => onPartClick?.(part.id)}>
                {/* Large hood area - organic shape covering front-center */}
                <path
                  d="M 90 105 Q 100 102 120 103 Q 150 104 180 105 Q 220 106 250 107 Q 280 107 310 106 Q 340 105 360 104 Q 380 103 390 105 L 390 150 Q 380 152 360 151 Q 340 150 310 150 Q 280 150 250 150 Q 220 150 180 149 Q 150 148 120 147 Q 100 146 90 148 Z"
                  fill={fillColor}
                  fillOpacity={opacity}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 3 : 2.5}
                  className="transition-all"
                  style={{
                    filter: isSelected ? 'brightness(1.1)' : 'none',
                    cursor: 'pointer'
                  }}
                />
                
                {/* Score badge on hood - centered */}
                <g transform="translate(250, 127)">
                  <rect
                    x="-20"
                    y="-11"
                    width="40"
                    height="22"
                    rx="11"
                    fill={part.score >= 4.0 ? "#dcfce7" : part.score >= 3.0 ? "#fef9c3" : part.score >= 2.0 ? "#ffedd5" : "#fee2e2"}
                    stroke={strokeColor}
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={part.score >= 4.0 ? "#15803d" : part.score >= 3.0 ? "#854d0e" : part.score >= 2.0 ? "#c2410c" : "#991b1b"}
                    className="text-xs font-bold pointer-events-none"
                    style={{ fontSize: '11px', fontWeight: 'bold' }}
                  >
                    {part.score.toFixed(1)}
                  </text>
                </g>
                
                {isSelected && (
                  <text
                    x="250"
                    y="95"
                    textAnchor="middle"
                    className="text-sm font-semibold fill-gray-800 dark:fill-gray-200 pointer-events-none"
                  >
                    {part.name}
                  </text>
                )}
              </g>
            );
          })}

          {/* Right Side - Continuous Green Strip with Segmented Parts */}
          {parts.filter(p => p.side === "right" && ["right-fender", "rf-door", "rr-door", "right-quarter"].includes(p.id)).map((part) => {
            const isSelected = selectedPart === part.id;
            const fillColor = getPartFillColor(part.score);
            const strokeColor = getPartStrokeColor(part.score);
            const opacity = isSelected ? 0.5 : 0.4;
            
            // Calculate position for continuous strip along right edge
            const baseX = 410; // Right edge of car body
            const baseY = 100;
            const partHeight = part.id === "right-fender" ? 18 : part.id === "rf-door" ? 22 : part.id === "rr-door" ? 22 : 18;
            const partY = part.id === "right-fender" ? baseY : 
                         part.id === "rf-door" ? baseY + 18 :
                         part.id === "rr-door" ? baseY + 40 :
                         baseY + 62;
            
            return (
              <g key={part.id} className="cursor-pointer" onClick={() => onPartClick?.(part.id)}>
                {/* Segmented right side part - vertical strip */}
                <rect
                  x={baseX}
                  y={partY}
                  width={20}
                  height={partHeight}
                  rx="3"
                  fill={fillColor}
                  fillOpacity={opacity}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition-all"
                  style={{
                    filter: isSelected ? 'brightness(1.15)' : 'none',
                    cursor: 'pointer'
                  }}
                />
                
                {/* Score badge - positioned outside right edge */}
                <g transform={`translate(${baseX + 30}, ${partY + partHeight / 2})`}>
                  <rect
                    x="-18"
                    y="-10"
                    width="36"
                    height="20"
                    rx="10"
                    fill="#dcfce7"
                    stroke={strokeColor}
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#15803d"
                    className="text-xs font-bold pointer-events-none"
                    style={{ fontSize: '10px', fontWeight: 'bold' }}
                  >
                    {part.score.toFixed(1)}
                  </text>
                </g>
                
                {isSelected && (
                  <text
                    x={baseX + 50}
                    y={partY + partHeight / 2}
                    textAnchor="start"
                    dominantBaseline="middle"
                    className="text-xs font-semibold fill-gray-700 dark:fill-gray-300 pointer-events-none"
                  >
                    {part.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  return null;
}
