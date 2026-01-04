import React from 'react';
import { X, Check } from 'lucide-react';

const WidgetEditor = ({ widgets, onToggle, onClose }) => {
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="glass-card animate-fade-in" style={{
                padding: '30px', maxWidth: '350px', width: '90%',
                background: 'var(--glass-bg)', backdropFilter: 'blur(var(--glass-blur-strong))',
                border: '1px solid var(--glass-border)', borderRadius: '24px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Edit Widgets</h2>
                    <X size={24} onClick={onClose} style={{ cursor: 'pointer' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
                    {Object.keys(widgets).map(key => (
                        <div
                            key={key}
                            onClick={() => onToggle(key)}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '16px', borderRadius: '16px',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                                cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>{key}</span>
                            <div style={{
                                width: 24, height: 24, borderRadius: '50%',
                                background: widgets[key] ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid var(--glass-border)'
                            }}>
                                {widgets[key] && <Check size={14} color="white" />}
                            </div>
                        </div>
                    ))}
                </div>

                <button className="theme-btn" onClick={onClose}>Done</button>
            </div>
        </div>
    );
};

export default WidgetEditor;
