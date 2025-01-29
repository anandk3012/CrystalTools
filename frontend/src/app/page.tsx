'use client';

import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-grow flex items-center justify-center py-10 px-4 mt-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Crystal Structure Analysis Toolkit
          </h1>
          <p className="text-gray-300 text-lg">
            Select a tool from the navigation menu to get started
          </p>
        </div>
      </div>
    </div>
  );
}