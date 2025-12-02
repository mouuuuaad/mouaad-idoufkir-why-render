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
        <div>
            <div>
                <h2>Portfolio Performance</h2>
                <div>
                    {['1H', '1D', '1W', '1M', '1Y'].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                {/* Visual representation of the "chart" */}
                {Array.from({ length: 40 }).map((_, i) => {
                    const height = 20 + Math.random() * 80;
                    return (
                        <div
                            key={i}
                            style={{ height: `${height}%` }}
                        />
                    );
                })}
            </div>
            <div>
                ⚠️ This component simulates a slow render (~40ms) to demonstrate performance warnings.
            </div>
        </div>
    );
};
