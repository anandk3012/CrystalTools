"use client";

import React, { useState } from "react";

const caseOptions = [
  { label: "Vp > 0, Vg < 0", value: "vp-pos-vg-neg" },
  { label: "Vp > 0, Vg > 0", value: "vp-pos-vg-pos" },
  { label: "Vp > 0, Vg = 0", value: "vp-pos-vg-zero" },
];

const PhaseGroupVelocityVisualizer = () => {
  const [selectedCase, setSelectedCase] = useState("vp-pos-vg-neg");

  return (
    <div className="p-[1rem] w-full ">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Phase and Group Velocity Visualizer
      </h1>

      <select
        value={selectedCase}
        onChange={(e) => setSelectedCase(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded-md text-black mx-auto"
      >
         {caseOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* <div className="relative pb-40 h-0 overflow-auto border-black border-1 border-solid border-r-8" > */}
      <div
        style={{
          position: "relative",
          paddingBottom: "56.25%",
          height: 0,
          overflow: "hidden",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <iframe
          src={`/animations/${selectedCase}.html`}
          title={`Visualizer for ${selectedCase}`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: "none",
          }}
        />
      </div>
    </div>
  );
};

export default PhaseGroupVelocityVisualizer;
