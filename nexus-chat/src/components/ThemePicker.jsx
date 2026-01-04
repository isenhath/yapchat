import React from 'react';

import { Moon, Sun, Monitor } from 'lucide-react';

const ThemePicker = ({ onSelect, currentTheme, themeMode }) => {
    const [mode, setMode] = React.useState(themeMode || 'system');

    const handleSelect = (themeId) => {
        onSelect(themeId, mode);
    };
    const themes = [
        {
            id: 'theme-midnight',
            name: 'Midnight',
            description: 'Deep, focused dark.',
            className: 'midnight-preview'
        },
        {
            id: 'theme-crystal',
            name: 'Crystal',
            description: 'Modern, glass finish.',
            className: 'crystal-preview'
        },
        {
            id: 'theme-sky',
            name: 'Sky',
            description: 'Pastel blue vibes.',
            className: 'sky-preview'
        },
        {
            id: 'theme-mint',
            name: 'Mint',
            description: 'Fresh pastel green.',
            className: 'mint-preview'
        },
        {
            id: 'theme-rose',
            name: 'Rose',
            description: 'Sweet pastel pink.',
            className: 'rose-preview'
        },
        {
            id: 'theme-slate',
            name: 'Slate',
            description: 'Clean, neutral grey.',
            className: 'slate-preview'
        }
    ];

    return (
        <div className="theme-picker-overlay animate-fade-in">
            <h1 style={{ fontSize: '42px', fontWeight: '700', marginBottom: '10px' }}>Choose your vibe</h1>
            <p style={{ opacity: 0.7, fontSize: '18px' }}>Select a starting theme for your workspace.</p>

            <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '999px' }}>
                {[
                    { id: 'light', label: 'Light', icon: Sun },
                    { id: 'system', label: 'System', icon: Monitor },
                    { id: 'dark', label: 'Dark', icon: Moon }
                ].map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => setMode(option.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 14px',
                            borderRadius: '999px',
                            border: 'none',
                            cursor: 'pointer',
                            background: mode === option.id ? 'rgba(255,255,255,0.2)' : 'transparent',
                            color: '#fff',
                            fontWeight: mode === option.id ? 600 : 500
                        }}
                    >
                        <option.icon size={16} />
                        {option.label}
                    </button>
                ))}
            </div>

            <div className="theme-options">
                {themes.map((t) => (
                    <div key={t.id} className="theme-card" onClick={() => handleSelect(t.id)}>
                        <div className={`theme-preview-circle ${t.className}`}></div>
                        <div style={{ textAlign: 'center' }}>
                            <h3>{t.name}</h3>
                            <p>{t.description}</p>
                        </div>
                        <button className="login-btn" style={{ marginTop: '10px' }}>Select</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ThemePicker;
