import React from 'react';
import { useWhyRender } from '../../src/hooks/useWhyRender';
import { DashboardLayout } from './components/DashboardLayout';
import { CryptoTicker } from './components/CryptoTicker';
import { TransactionList } from './components/TransactionList';
import { PortfolioChart } from './components/PortfolioChart';
import { SettingsPanel } from './components/SettingsPanel';

function App() {
    // Track the main App component
    useWhyRender({}, 'App');

    return (
        <DashboardLayout>
            {/* Top Row: Ticker & Chart */}
            <CryptoTicker />
            <PortfolioChart />

            {/* Bottom Row: Transactions & Settings */}
            <TransactionList />
            <SettingsPanel />

            {/* Instructions Overlay */}
            <div>
                <h3>🔍 Demo Instructions</h3>
                <ul>
                    <li>Open DevTools: <kbd>Cmd+Shift+D</kbd></li>
                    <li><strong>Ticker:</strong> Updates every 1s (watch Timeline)</li>
                    <li><strong>Chart:</strong> Simulates slow renders (~40ms)</li>
                    <li><strong>Transactions:</strong> Adds items (watch list re-renders)</li>
                    <li><strong>Settings:</strong> Deep object updates (watch Diff)</li>
                </ul>
            </div>
        </DashboardLayout>
    );
}

export default App;
