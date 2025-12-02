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
        <div>
            <div>
                <h2>Live Prices</h2>
                <span>
                    Live
                </span>
            </div>
            <div>
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
        <div>
            <div>{data.symbol}</div>
            <div>
                <div>${data.price.toFixed(2)}</div>
                <div>
                    {data.change > 0 ? '+' : ''}{data.change.toFixed(2)}%
                </div>
            </div>
        </div>
    );
};
