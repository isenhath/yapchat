import React, { useState } from 'react';
import { ChevronRight, X, Sparkles, MessageSquare, Palette } from 'lucide-react';

const Tutorial = ({ onClose }) => {
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: "Welcome to Yap Chat",
            description: "Experience the future of communication with our glassmorphism-inspired workspace.",
            icon: <Sparkles size={48} color="#0084ff" />
        },
        {
            title: "Real-time Messaging",
            description: "Click 'Create Chat' to start conversations. Messages sync instantly across all your devices.",
            icon: <MessageSquare size={48} color="#ff6b6b" />
        },
        {
            title: "Stay Aesthetic",
            description: "Change your theme anytime from the appearance widget. Lavender, Midnight, or Crystal—the choice is yours.",
            icon: <Palette size={48} color="#ffdb58" />
        }
    ];

    return (
        <div className="theme-picker-overlay animate-fade-in" style={{ zIndex: 1100 }}>
            <div className="glass-card" style={{ maxWidth: '500px', width: '90%', padding: '40px', textAlign: 'center', position: 'relative' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}
                >
                    <X size={24} />
                </button>

                <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center' }}>
                    {steps[step].icon}
                </div>

                <h2 style={{ fontSize: '28px', marginBottom: '16px', color: '#fff' }}>{steps[step].title}</h2>
                <p style={{ fontSize: '16px', opacity: 0.8, color: '#fff', marginBottom: '40px', lineHeight: 1.6 }}>{steps[step].description}</p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}>
                    {steps.map((_, i) => (
                        <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: step === i ? '#fff' : 'rgba(255,255,255,0.3)', transition: 'all 0.3s' }}></div>
                    ))}
                </div>

                {step < steps.length - 1 ? (
                    <button
                        className="login-btn"
                        onClick={() => setStep(step + 1)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        Next <ChevronRight size={18} />
                    </button>
                ) : (
                    <button
                        className="login-btn"
                        onClick={onClose}
                        style={{ width: '100%', background: 'var(--accent-blue)' }}
                    >
                        Get Started
                    </button>
                )}
            </div>
        </div>
    );
};

export default Tutorial;
