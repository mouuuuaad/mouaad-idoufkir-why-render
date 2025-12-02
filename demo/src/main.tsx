import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Import DevTools from published npm package
import { WhyRenderDevTools } from '@mouaad_idoufkir/why-render/ui';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <App />
        {/* DevTools toggle button */}
        <WhyRenderDevTools
            position="bottom-right"
            slowThreshold={16}
            toggleShortcut="Meta+Shift+D"
        />
    </React.StrictMode>
);
