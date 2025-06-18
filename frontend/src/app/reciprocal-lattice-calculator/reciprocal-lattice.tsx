'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

import axios from 'axios';
import Navbar from '@/components/Navbar';

type NumericVec3 = [number, number, number];
type InputVec3 = [string, string, string];

interface LatticeData {
  reciprocal_lattice: { x: number[]; y: number[]; z: number[] };
  reciprocal_vectors: { b1: number[]; b2: number[]; b3: number[] };
}

export default function ReciprocalLattice() {
  // --- STRING states only until submit
  const [spacingInput, setSpacingInput] = useState<string>('1');
  const [a1Input, setA1Input] = useState<InputVec3>(['1', '0', '0']);
  const [a2Input, setA2Input] = useState<InputVec3>(['0', '1', '0']);
  const [a3Input, setA3Input] = useState<InputVec3>(['0', '0', '1']);

  const [latticeData, setLatticeData] = useState<LatticeData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // centralized error + modal state
  const [error, setError] = useState<string>('');
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);

  // auto‐open modal whenever error is set
  useEffect(() => {
    if (error) setShowErrorModal(true);
  }, [error]);

  // determinant of 3×3 numeric vectors
  const det = (v1: NumericVec3, v2: NumericVec3, v3: NumericVec3): number =>
    v1[0] * (v2[1] * v3[2] - v2[2] * v3[1]) -
    v1[1] * (v2[0] * v3[2] - v2[2] * v3[0]) +
    v1[2] * (v2[0] * v3[1] - v2[1] * v3[0]);

  // generic handler for three text inputs
  const onChangeVec = useCallback(
    (
      setter: React.Dispatch<React.SetStateAction<InputVec3>>,
      idx: number,
      val: string
    ) => {
      // allow blank or numeric string
      if (val !== '' && !/^-?\d*\.?\d*$/.test(val)) return;
      setter((prev) => {
        const next = [...prev] as InputVec3;
        next[idx] = val;
        return next;
      });
    },
    []
  );

  // handle click
  const handleCalculate = useCallback(async () => {
    console.log('🔔 handleCalculate fired');
    setError('');                // reset
    setLatticeData(null);

    // parse spacing
    const spacingNum = parseFloat(spacingInput);
    if (isNaN(spacingNum) || spacingNum <= 0) {
      setError('Spacing must be a positive number.');
      return;
    }

    // parse each vector
    const parseVec = (inp: InputVec3): NumericVec3 | null => {
      const nums = inp.map((s) => parseFloat(s));
      return nums.every((n) => !isNaN(n)) ? (nums as NumericVec3) : null;
    };
    const a1 = parseVec(a1Input),
      a2 = parseVec(a2Input),
      a3 = parseVec(a3Input);

    if (!a1 || !a2 || !a3) {
      setError('All vector components must be valid numbers.');
      return;
    }

    // check linear dependence
    if (Math.abs(det(a1, a2, a3)) < 1e-6) {
      setError('Vectors are linearly dependent. Use non-coplanar inputs.');
      return;
    }

    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const resp = await axios.post<LatticeData>(
        `${base}/calculate_lattice`,
        { spacing: spacingNum, a1, a2, a3 },
        { timeout: 10000 }
      );
      if (resp.status === 200 && resp.data) {
        setLatticeData(resp.data);
      } else {
        throw new Error(resp.statusText || 'Bad server response');
      }
    } catch (err) {
      console.error(err);
      let msg = 'Failed to calculate reciprocal lattice.';
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') msg = 'Request timed out.';
        else if (err.response?.data?.error) msg = err.response.data.error;
        else msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [spacingInput, a1Input, a2Input, a3Input]);

  // small sub‐component for 3-wide inputs
  const VectorInput = useCallback(
    ({
      label,
      value,
      onChange,
    }: {
      label: string;
      value: InputVec3;
      onChange: (i: number, v: string) => void;
    }) => (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        <div className="grid grid-cols-3 gap-2">
          {value.map((v, i) => (
            <input
              key={i}
              type="text"
              value={v}
              onChange={(e) => onChange(i, e.target.value)}
              className="w-full bg-gray-800 text-white rounded p-2 text-sm"
              placeholder="0.0"
              disabled={loading}
            />
          ))}
        </div>
      </div>
    ),
    [loading]
  );

  return (
    <>
      <Navbar />

      {/* modal */}
      {showErrorModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4 text-red-600">Error</h2>
            <p className="mb-4 text-gray-800">{error}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="bg-black min-h-screen py-8 px-4 flex justify-center">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inputs */}
          <div className="bg-gray-900 p-6 border border-gray-800 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-6">Lattice Parameters</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Spacing</label>
                <input
                  type="text"
                  value={spacingInput}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^-?\d*\.?\d*$/.test(v) || v === '') setSpacingInput(v);
                  }}
                  className="w-full bg-gray-800 text-white rounded p-2 text-sm"
                  placeholder="1.0"
                  disabled={loading}
                />
              </div>

              <VectorInput label="a₁ Vector" value={a1Input} onChange={(i, v) => onChangeVec(setA1Input, i, v)} />
              <VectorInput label="a₂ Vector" value={a2Input} onChange={(i, v) => onChangeVec(setA2Input, i, v)} />
              <VectorInput label="a₃ Vector" value={a3Input} onChange={(i, v) => onChangeVec(setA3Input, i, v)} />

              <button
                onClick={handleCalculate}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition-opacity disabled:opacity-50"
              >
                {loading ? 'Calculating…' : 'Calculate'}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-8">
            {!latticeData && !loading && (
              <p className="text-gray-400 italic">Enter parameters and click “Calculate” to see the lattice.</p>
            )}

            {latticeData && (
              <>
                <div className="bg-gray-900 p-4 border border-gray-800 rounded-lg h-[32rem]">
                  <h2 className="text-xl font-bold text-white mb-4">Reciprocal Lattice</h2>
                  <Plot
                    data={[
                      {
                        x: latticeData.reciprocal_lattice.x,
                        y: latticeData.reciprocal_lattice.y,
                        z: latticeData.reciprocal_lattice.z,
                        mode: 'markers',
                        type: 'scatter3d',
                        marker: { color: '#FF00FF', size: 6, opacity: 0.8 },
                      },
                    ]}
                    layout={{
                      title: '3D Reciprocal Lattice',
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      font: { color: '#fff' },
                      scene: {
                        aspectmode: 'data',
                        xaxis: { title: 'X', gridcolor: '#444', titlefont: { color: '#fff' }, tickfont: { color: '#fff' } },
                        yaxis: { title: 'Y', gridcolor: '#444', titlefont: { color: '#fff' }, tickfont: { color: '#fff' } },
                        zaxis: { title: 'Z', gridcolor: '#444', titlefont: { color: '#fff' }, tickfont: { color: '#fff' } },
                        bgcolor: 'rgba(0,0,0,0)',
                      },
                      margin: { t: 30, l: 0, r: 0, b: 0 },
                    }}
                    config={{ responsive: true, displaylogo: false }}
                    className="w-full h-full"
                  />
                </div>

                <div className="bg-gray-900 p-6 border border-gray-800 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Reciprocal Vectors</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {Object.entries(latticeData.reciprocal_vectors).map(([key, vals]) => (
                      <div key={key}>
                        <span className="text-gray-400">{key}:</span>
                        <pre className="text-white font-mono mt-1">
                          {(vals as number[]).map((n) => n.toFixed(3)).join('  ')}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
