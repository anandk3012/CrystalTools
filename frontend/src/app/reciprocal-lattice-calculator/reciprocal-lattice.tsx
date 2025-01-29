'use client';

import { useState } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import Navbar from "@/components/Navbar";

type Vector3D = [number, number, number];

type LatticeData = {
    reciprocal_lattice: {
        x: number[];
        y: number[];
        z: number[];
    };
    reciprocal_vectors: {
        b1: number[];
        b2: number[];
        b3: number[];
    };
};

export default function ReciprocalLattice() {
    const [spacing, setSpacing] = useState<number>(1);
    const [a1, setA1] = useState<Vector3D>([1, 0, 0]);
    const [a2, setA2] = useState<Vector3D>([0, 1, 0]);
    const [a3, setA3] = useState<Vector3D>([0, 0, 1]);
    const [latticeData, setLatticeData] = useState<LatticeData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const updateVector = (setter: (v: Vector3D) => void, index: number, value: string) => {
        setter(prev => {
            const newVec = [...prev] as Vector3D;
            newVec[index] = Number(value) || 0;
            return newVec;
        });
    };

    const fetchLatticeData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post("http://localhost:5000/calculate_lattice", {
                spacing,
                a1,
                a2,
                a3
            });

            if (response.data) {
                setLatticeData(response.data);
            } else {
                throw new Error("Invalid response from backend");
            }
        } catch (err) {
            setError("Error calculating reciprocal lattice.");
        } finally {
            setLoading(false);
        }
    };

    const VectorInput = ({
        label,
        value,
        onChange
    }: {
        label: string;
        value: Vector3D;
        onChange: (index: number, value: string) => void;
    }) => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">{label}</label>
            <div className="grid grid-cols-3 gap-2">
                {['x', 'y', 'z'].map((comp, idx) => (
                    <input
                        key={comp}
                        type="number"
                        value={value[idx]}
                        onChange={(e) => onChange(idx, e.target.value)}
                        className="w-full bg-gray-800 text-white rounded p-2 text-sm"
                        step="0.1"
                    />
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black flex flex-col">
            <Navbar />
            <div className="flex-grow container mx-auto px-4 mt-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Input Section */}
                    <div className="bg-gray-900 p-6 border-2 border-gray-800 rounded-lg">
                        <h2 className="text-xl font-bold text-white mb-6">Lattice Parameters</h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Spacing</label>
                                <input
                                    type="number"
                                    value={spacing}
                                    onChange={(e) => setSpacing(Number(e.target.value) || 1)}
                                    className="w-full bg-gray-800 text-white rounded p-2 text-sm"
                                    min="0.1"
                                    step="0.1"
                                />
                            </div>

                            <VectorInput
                                label="a₁ Vector"
                                value={a1}
                                onChange={(idx, val) => updateVector(setA1, idx, val)}
                            />
                            <VectorInput
                                label="a₂ Vector"
                                value={a2}
                                onChange={(idx, val) => updateVector(setA2, idx, val)}
                            />
                            <VectorInput
                                label="a₃ Vector"
                                value={a3}
                                onChange={(idx, val) => updateVector(setA3, idx, val)}
                            />

                            <button
                                onClick={fetchLatticeData}
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50"
                            >
                                {loading ? "Calculating..." : "Calculate"}
                            </button>

                            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="lg:col-span-2 space-y-8">
                        {latticeData && (
                            <>
                                <div className="bg-gray-900 rounded-lg h-[32rem] ">
                                    <Plot
                                        data={[{
                                            x: latticeData.reciprocal_lattice.x,
                                            y: latticeData.reciprocal_lattice.y,
                                            z: latticeData.reciprocal_lattice.z,
                                            mode: "markers",
                                            type: "scatter3d",
                                            marker: { 
                                                color: '#FF00FF', 
                                                size: 8,
                                                opacity: 0.8
                                            }
                                        }]}
                                        layout={{
                                            title: 'Reciprocal Lattice Visualization',
                                            paper_bgcolor: 'rgba(0,0,0,0)',
                                            font: { color: '#fff' },
                                            scene: {
                                                aspectmode: 'data',
                                                xaxis: { 
                                                    title: 'X', 
                                                    gridcolor: '#444',
                                                    titlefont: { color: '#fff' },
                                                    tickfont: { color: '#fff' }
                                                },
                                                yaxis: { 
                                                    title: 'Y', 
                                                    gridcolor: '#444',
                                                    titlefont: { color: '#fff' },
                                                    tickfont: { color: '#fff' }
                                                },
                                                zaxis: { 
                                                    title: 'Z', 
                                                    gridcolor: '#444',
                                                    titlefont: { color: '#fff' },
                                                    tickfont: { color: '#fff' }
                                                },
                                                bgcolor: 'rgba(0,0,0,0)'
                                            },
                                            margin: { t: 40 }
                                        }}
                                        config={{ 
                                            responsive: true,
                                            displaylogo: false
                                        }}
                                        className="w-full h-full mx-auto my-auto border-2 border-gray-800 rounded-lg"
                                    />
                                </div>

                                <div className="bg-gray-900 p-6 border-2 border-gray-800 rounded-lg">
                                    <h3 className="text-lg font-semibold text-white mb-4">Reciprocal Lattice Vectors</h3>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        {Object.entries(latticeData.reciprocal_vectors).map(([key, value]) => (
                                            <div key={key}>
                                                <span className="text-gray-400">{key}:</span>
                                                <div className="text-white mt-1 space-y-1">
                                                    {(value as number[]).map((num, i) => (
                                                        <div key={i} className="font-mono">
                                                            {num.toFixed(3)}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}