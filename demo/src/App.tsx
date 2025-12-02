import React from 'react';
import { useWhyRender } from '../../src/hooks/useWhyRender';
import { DashboardLayout } from './components/DashboardLayout';
import { CryptoTicker } from './components/CryptoTicker';
import { TransactionList } from './components/TransactionList';
import { PortfolioChart } from './components/PortfolioChart';
import { SettingsPanel } from './components/SettingsPanel';
import './App.css';

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
            <div className="fixed bottom-4 left-4 bg-slate-800/90 backdrop-blur border border-slate-700 p-4 rounded-lg shadow-xl max-w-sm z-50">
                <h3 className="text-blue-400 font-bold mb-2">🔍 Demo Instructions</h3>
                <ul className="text-sm text-slate-300 space-y-1 list-disc pl-4">
                    <li>Open DevTools: <kbd className="bg-slate-700 px-1 rounded">Cmd+Shift+D</kbd></li>
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
