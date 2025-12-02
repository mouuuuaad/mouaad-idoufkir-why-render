import React from 'react';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <div>
            <nav>
                <div>
                    <div>
                        <span>W</span>
                    </div>
                    <h1>
                        Why Render Demo
                    </h1>
                </div>
                <div>
                    Crypto Dashboard v1.0
                </div>
            </nav>
            <main>
                <div>
                    {children}
                </div>
            </main>
        </div>
    );
};
