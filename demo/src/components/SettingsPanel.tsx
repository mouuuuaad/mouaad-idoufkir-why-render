import React, { useState } from 'react';
import { useWhyRender } from '@mouaad_idoufkir/why-render';

interface Settings {
    theme: {
        mode: 'dark' | 'light';
        accent: string;
    };
    notifications: {
        email: boolean;
        push: boolean;
        frequency: 'daily' | 'weekly';
    };
    display: {
        currency: string;
        showBalance: boolean;
    };
}

export const SettingsPanel: React.FC = () => {
    const [settings, setSettings] = useState<Settings>({
        theme: { mode: 'dark', accent: 'blue' },
        notifications: { email: true, push: false, frequency: 'daily' },
        display: { currency: 'USD', showBalance: true },
    });

    const updateSetting = (section: keyof Settings, key: string, value: any) => {
        // ISSUE: Updating deep nested state often causes complex diffs
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };

    useWhyRender({ settings }, 'SettingsPanel', { verbose: true });

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 col-span-1">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Settings</h2>

            <div className="space-y-6">
                {/* Theme Section */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Theme</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-300">Accent Color</span>
                        <select
                            value={settings.theme.accent}
                            onChange={(e) => updateSetting('theme', 'accent', e.target.value)}
                            className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-slate-200"
                        >
                            <option value="blue">Blue</option>
                            <option value="purple">Purple</option>
                            <option value="green">Green</option>
                        </select>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Notifications</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-300">Email Alerts</span>
                        <button
                            onClick={() => updateSetting('notifications', 'email', !settings.notifications.email)}
                            className={`w-10 h-5 rounded-full transition-colors relative ${settings.notifications.email ? 'bg-blue-500' : 'bg-slate-600'
                                }`}
                        >
                            <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${settings.notifications.email ? 'left-6' : 'left-1'
                                }`} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-300">Push Notifications</span>
                        <button
                            onClick={() => updateSetting('notifications', 'push', !settings.notifications.push)}
                            className={`w-10 h-5 rounded-full transition-colors relative ${settings.notifications.push ? 'bg-blue-500' : 'bg-slate-600'
                                }`}
                        >
                            <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${settings.notifications.push ? 'left-6' : 'left-1'
                                }`} />
                        </button>
                    </div>
                </div>

                {/* Display Section */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Display</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-300">Currency</span>
                        <div className="flex gap-2">
                            {['USD', 'EUR', 'GBP'].map(curr => (
                                <button
                                    key={curr}
                                    onClick={() => updateSetting('display', 'currency', curr)}
                                    className={`px-2 py-1 text-xs rounded border ${settings.display.currency === curr
                                        ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                        : 'border-slate-600 text-slate-400'
                                        }`}
                                >
                                    {curr}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
