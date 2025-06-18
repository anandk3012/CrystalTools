'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

import axios from 'axios';

interface Vector3D {
    x: number;
    y: number;
    z: number;
}

export default function BrillouinCalculator() {
    const [a1, setA1] = useState<Vector3D>({ x: 1, y: 1, z: 0 });
    const [a2, setA2] = useState<Vector3D>({ x: 0, y: 1, z: 1 });
    const [a3, setA3] = useState<Vector3D>({ x: 1, y: 0, z: 1 });
    const [spacing, setSpacing] = useState(1.0);
    const [plotData, setPlotData] = useState<any[]>([]);
    const [vectors, setVectors] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/calculate_brillouin`, {
                a1: [a1.x, a1.y, a1.z],
                a2: [a2.x, a2.y, a2.z],
                a3: [a3.x, a3.y, a3.z],
                spacing
            });

            const { vertices, simplices } = response.data;
            const x = vertices.map((v: number[]) => v[0]);
            const y = vertices.map((v: number[]) => v[1]);
            const z = vertices.map((v: number[]) => v[2]);

            const meshData = {
                type: 'mesh3d',
                x,
                y,
                z,
                i: simplices.map((s: number[]) => s[0]),
                j: simplices.map((s: number[]) => s[1]),
                k: simplices.map((s: number[]) => s[2]),
                opacity: 0.6,
                color: '#007BFF',
                name: 'Brillouin Zone'
            };

            setPlotData([meshData]);
            setVectors(response.data.reciprocal_vectors);
        } catch (error) {
            console.error('Error calculating Brillouin zone:', error);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col mt-10 pb-10">
            <div className="flex-grow container mx-auto px-4 mt-16 w-[85%]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Input Form */}
                    <div className="bg-gray-900 p-6 border-2 border-gray-800 rounded-lg">
                        <h2 className="text-xl font-bold text-white mb-6">Lattice Parameters</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {([['a1', a1, setA1], ['a2', a2, setA2], ['a3', a3, setA3]] as [string, Vector3D, React.Dispatch<React.SetStateAction<Vector3D>>][]).map(([label, vec, setVec]) => (
                                <div key={label} className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">{label}</label>
                                    {['x', 'y', 'z'].map((coord) => (
                                        <input
                                            key={coord}
                                            type="number"
                                            step="0.1"
                                            value={vec[coord as keyof Vector3D]}
                                            onChange={(e) => setVec({
                                                ...vec,
                                                [coord]: parseFloat(e.target.value)
                                            })}
                                            className="w-full bg-gray-800 text-white rounded p-2 text-sm"
                                        />
                                    ))}
                                </div>
                            ))}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Spacing</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={spacing}
                                    onChange={(e) => setSpacing(parseFloat(e.target.value))}
                                    className="w-full bg-gray-800 text-white rounded p-2 text-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
                            >
                                Calculate Brillouin Zone
                            </button>
                        </form>
                    </div>

                    {/* Results Display */}
                    <div className="lg:col-span-2 space-y-8 mb">
                        <div className=" bg-gray-900 rounded-lg border-2 border-gray-800 h-[32rem] p-3">
                            <h2 className="text-xl font-bold text-white mb-6">Brillouin Zone</h2>

                            <Plot
                                data={plotData}
                                layout={{
                                    title: 'Brillouin Zone Visualization',
                                    scene: {
                                        aspectmode: 'data',
                                        xaxis: { title: 'X', gridcolor: '#444' },
                                        yaxis: { title: 'Y', gridcolor: '#444' },
                                        zaxis: { title: 'Z', gridcolor: '#444' },
                                        bgcolor: 'rgba(0,0,0,0)'
                                    },
                                    paper_bgcolor: 'rgba(0,0,0,0)',
                                    font: { color: '#fff' },
                                    margin: { t: 20 },
                                    autosize: true
                                }}
                                config={{ responsive: true }}
                                className="w-full h-full mx-auto my-auto  rounded-lg"
                            />
                        </div>

                        {vectors && (
                            <div className="bg-gray-900 p-6 border-2 border-gray-800 rounded-lg">
                                <h3 className="text-lg font-semibold text-white mb-4">Reciprocal Lattice Vectors</h3>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    {Object.entries(vectors).map(([key, value]) => (
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}