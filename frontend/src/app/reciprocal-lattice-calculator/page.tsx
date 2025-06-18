'use client';

import ReciprocalLattice from "./reciprocal-lattice";

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col pb-10">
      <div className="flex-grow flex items-center justify-center py-10 px-4 mt-16">
        <ReciprocalLattice />
      </div>
    </div>
  );
}