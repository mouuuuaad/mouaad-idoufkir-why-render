import React, { useState, useEffect } from 'react';
import { useWhyRender } from '../../../src/hooks/useWhyRender';

interface PriceData {
    symbol: string;
    price: number;
    change: number;
}

const COINS = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'];

export const CryptoTicker: React.FC = () => {
    const [prices, setPrices] = useState<PriceData[]>([]);

    // Simulate real-time price updates
    useEffect(() => {
        const interval = setInterval(() => {
            setPrices(COINS.map(symbol => ({
                symbol,
                price: Math.random() * 1000 + 100,
                change: (Math.random() * 10) - 5
            })));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // ISSUE: Passing new object reference 'style' every render
    const style = { padding: '1rem' };

    useWhyRender({ prices, style }, 'CryptoTicker', { verbose: true });

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-100">Live Prices</h2>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded animate-pulse">
                    Live
                </span>
            </div>
            <div className="space-y-3">
                {prices.map(coin => (
                    <TickerItem key={coin.symbol} data={coin} />
                ))}
            </div>
        </div>
    );
};

// ISSUE: Missing React.memo, re-renders even if data doesn't change (though here it does)
const TickerItem = ({ data }: { data: PriceData }) => {
    useWhyRender({ data }, `TickerItem:${data.symbol}`);

    return (
        <div className="flex justify-between items-center p-2 hover:bg-slate-700/50 rounded transition-colors">
            <div className="font-medium">{data.symbol}</div>
            <div className="text-right">
                <div className="font-mono">${data.price.toFixed(2)}</div>
                <div className={`text-xs ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {data.change > 0 ? '+' : ''}{data.change.toFixed(2)}%
                </div>
            </div>
        </div>
    );
};
