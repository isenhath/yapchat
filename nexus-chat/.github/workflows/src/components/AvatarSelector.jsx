import React, { useState } from 'react';
import { X } from 'lucide-react';

const AVATAR_OPTIONS = [
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Tigger',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Boo',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Coco',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Milo'
];

const COLORS = [
    '#f87171', '#fb923c', '#facc15', '#4ade80', '#2dd4bf',
    '#60a5fa', '#818cf8', '#a78bfa', '#e879f9', '#fb7185'
];

const AvatarSelector = ({ onSelect, onSkip, theme }) => {
    const [mode, setMode] = useState('presets');
    const [selected, setSelected] = useState(null);
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="glass-card animate-fade-in" style={{
                padding: '30px', maxWidth: '400px', width: '90%',
                textAlign: 'center', background: 'var(--glass-bg)',
                backdropFilter: 'blur(var(--glass-blur-strong))', border: '1px solid var(--glass-border)'
            }}>
                <h2 style={{ marginBottom: '10px' }}>Choose your Avatar</h2>
                <p style={{ marginBottom: '20px', opacity: 0.7 }}>Pick an animated character or skip to use your initials.</p>

                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
                    <button style={{ background: 'none', border: 'none', color: mode === 'presets' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer', paddingBottom: '5px', borderBottom: mode === 'presets' ? '2px solid var(--accent-blue)' : 'none' }} onClick={() => setMode('presets')}>Presets</button>
                    <button style={{ background: 'none', border: 'none', color: mode === 'monogram' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer', paddingBottom: '5px', borderBottom: mode === 'monogram' ? '2px solid var(--accent-blue)' : 'none' }} onClick={() => setMode('monogram')}>Monogram</button>
                </div>

                {mode === 'presets' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
                        {AVATAR_OPTIONS.map(avi => (
                            <button
                                key={avi}
                                onClick={() => setSelected(avi)}
                                style={{
                                    padding: '5px',
                                    background: selected === avi ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)',
                                    border: 'none', borderRadius: '50%', cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    width: '80px', height: '80px', overflow: 'hidden'
                                }}
                            >
                                <img src={avi} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                            </button>
                        ))}
                    </div>
                ) : (
                    <div style={{ marginBottom: '30px' }}>
                        <div style={{ width: '100px', height: '100px', margin: '0 auto 20px auto', borderRadius: '40%', background: selectedColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 'bold', color: 'white', border: '2px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(var(--glass-blur-soft))', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}>
                            NJ
                        </div>
                        <p style={{ fontSize: '12px', marginBottom: '10px' }}>Select Backround Color</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setSelectedColor(c)}
                                    style={{
                                        width: '24px', height: '24px', borderRadius: '50%',
                                        background: c, border: selectedColor === c ? '2px solid white' : 'none',
                                        cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => mode === 'presets' ? onSelect(selected) : onSelect(null, selectedColor)}
                        disabled={mode === 'presets' && !selected}
                        className="theme-btn"
                        style={{ flex: 1, opacity: (mode === 'presets' && !selected) ? 0.5 : 1 }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvatarSelector;
