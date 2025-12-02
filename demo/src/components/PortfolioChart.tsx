import React, { useState } from 'react';
import { useWhyRender } from '../../../src/hooks/useWhyRender';

export const PortfolioChart: React.FC = () => {
    const [timeRange, setTimeRange] = useState('1D');

    // ISSUE: Heavy computation inside render body blocks the main thread
    const generateChartData = () => {
        const start = performance.now();
        const data = [];
        // Simulate heavy work (e.g., complex math, parsing large datasets)
        while (performance.now() - start < 40) {
            data.push(Math.random());
        }
        return data;
    };

    const data = generateChartData();

    useWhyRender({ timeRange, dataPointCount: data.length }, 'PortfolioChart', { verbose: true });

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 col-span-1 md:col-span-2 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-100">Portfolio Performance</h2>
                <div className="flex bg-slate-700/50 rounded-lg p-1">
                    {['1H', '1D', '1W', '1M', '1Y'].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1 text-sm rounded-md transition-all ${timeRange === range
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-64 flex items-end justify-between gap-1 px-2">
                {/* Visual representation of the "chart" */}
                {Array.from({ length: 40 }).map((_, i) => {
                    const height = 20 + Math.random() * 80;
                    return (
                        <div
                            key={i}
                            className="w-full bg-gradient-to-t from-blue-500/20 to-blue-500 rounded-t-sm transition-all duration-500"
                            style={{ height: `${height}%` }}
                        />
                    );
                })}
            </div>
            <div className="mt-4 text-center text-xs text-slate-500">
                ⚠️ This component simulates a slow render (~40ms) to demonstrate performance warnings.
            </div>
        </div>
    );
};
