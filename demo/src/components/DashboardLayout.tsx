import React from 'react';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
            <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">W</span>
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Why Render Demo
                    </h1>
                </div>
                <div className="text-sm text-slate-400">
                    Crypto Dashboard v1.0
                </div>
            </nav>
            <main className="p-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {children}
                </div>
            </main>
        </div>
    );
};
