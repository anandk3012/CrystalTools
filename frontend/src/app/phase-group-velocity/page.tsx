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
    <div className="p-4 w-full max-w-3xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center">
        Phase and Group Velocity Visualizer
      </h1>

      <div className="mb-4 flex justify-center">
        <select
          value={selectedCase}
          onChange={(e) => setSelectedCase(e.target.value)}
          className="p-2 border border-gray-300 rounded-md text-black w-full max-w-xs"
        >
          {caseOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Responsive wrapper */}
      <div
        className="relative w-full overflow-hidden rounded-lg border border-gray-300"
        style={{
          // Mobile = portrait-ish (4:5), Desktop = landscape (16:9)
          paddingBottom: "125%", // fallback
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            aspectRatio: "16/9",
          }}
        >
          <iframe
            src={`/animations/${selectedCase}.html`}
            title={`Visualizer for ${selectedCase}`}
            className="w-full h-full border-none"
          />
        </div>

        {/* Fallback for mobile where aspect-ratio might not be supported */}
        <style jsx>{`
          @media (max-width: 767px) {
            div[style*="aspectRatio"] {
              aspect-ratio: 4 / 5;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PhaseGroupVelocityVisualizer;
