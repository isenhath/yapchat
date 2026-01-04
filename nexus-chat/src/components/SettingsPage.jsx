import React, { useState } from 'react';
import { User, Moon, Sun, Monitor, Bell, Shield, LogOut, ChevronRight, X, Trash2 } from 'lucide-react';
import AvatarSelector from './AvatarSelector';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const SettingsPage = ({ user, theme, setTheme, themeMode, setThemeMode, onSignOut, onClose }) => {
    const [activeSection, setActiveSection] = useState('profile');
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);

    const themes = [
        { id: 'theme-midnight', name: 'Midnight', color: '#4c66b3' },
        { id: 'theme-crystal', name: 'Crystal', color: '#6d7bd6' },
        { id: 'theme-sky', name: 'Sky', color: '#4b97c9' },
        { id: 'theme-mint', name: 'Mint', color: '#35a389' },
        { id: 'theme-rose', name: 'Rose', color: '#c96b8c' },
        { id: 'theme-slate', name: 'Slate', color: '#5f7087' }
    ];

    const clearCache = () => {
        if (confirm("Clear local cache? This will reset theme preferences on this device.")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const handleAvatarSelect = async (selection, type) => {
        try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                photoURL: type === 'image' ? selection : `https://ui-avatars.com/api/?name=${user.displayName?.charAt(0) || 'U'}&background=${selection.replace('#', '')}&color=fff&size=200`,
                theme: theme,
                themeMode: themeMode
            }, { merge: true });

            // Force update user object (would need to refresh auth state in real app)
            window.location.reload();
        } catch (err) {
            console.error("Error updating avatar:", err);
        }
    };

    return (
        <div className="settings-page animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', color: 'var(--text-primary)' }}>
            {showAvatarSelector && (
                <AvatarSelector
                    onSelect={handleAvatarSelect}
                    onSkip={() => setShowAvatarSelector(false)}
                    theme={theme}
                />
            )}

            <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Settings</h2>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <X size={24} />
                </button>
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Sidebar */}
                <div style={{ width: '250px', borderRight: '1px solid var(--glass-border)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                        { id: 'profile', icon: User, label: 'Profile' },
                        { id: 'appearance', icon: Monitor, label: 'Appearance' },
                        { id: 'privacy', icon: Shield, label: 'Privacy' },
                        { id: 'notifications', icon: Bell, label: 'Notifications' }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                                borderRadius: '12px', border: 'none', cursor: 'pointer',
                                background: activeSection === item.id ? 'var(--accent-blue)' : 'transparent',
                                color: activeSection === item.id ? 'white' : 'var(--text-primary)',
                                textAlign: 'left', fontWeight: '500', transition: 'all 0.2s'
                            }}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}

                    <div style={{ flex: 1 }}></div>

                    <button onClick={clearCache} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                        Clear Cache
                    </button>
                    <button onClick={onSignOut} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', color: 'var(--accent-pink)', background: 'rgba(255,0,0,0.05)', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
                    {activeSection === 'profile' && (
                        <div className="animate-fade-in">
                            <h3 style={{ marginBottom: '20px' }}>Profile Settings</h3>
                            <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                                <img src={user.photoURL} alt="User" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid var(--accent-blue)' }} />
                                <div>
                                    <h4 style={{ fontSize: '18px', marginBottom: '4px' }}>{user.displayName}</h4>
                                    <p style={{ opacity: 0.6 }}>{user.email}</p>
                                    <button
                                        onClick={() => setShowAvatarSelector(true)}
                                        className="theme-btn"
                                        style={{ fontSize: '12px', marginTop: '8px', padding: '6px 12px' }}
                                    >
                                        Change Avatar
                                    </button>
                                </div>
                            </div>
                            {/* Additional profile options */}
                            <div className="glass-card" style={{ padding: '20px' }}>
                                <h4 style={{ marginBottom: '12px' }}>Account Information</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div>
                                        <label style={{ fontSize: '12px', opacity: 0.7, display: 'block', marginBottom: '4px' }}>Display Name</label>
                                        <input
                                            type="text"
                                            value={user.displayName || ''}
                                            readOnly
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '12px', opacity: 0.7, display: 'block', marginBottom: '4px' }}>Email</label>
                                        <input
                                            type="email"
                                            value={user.email || ''}
                                            readOnly
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'appearance' && (
                        <div className="animate-fade-in">
                            <h3 style={{ marginBottom: '20px' }}>Appearance</h3>

                            <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px' }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>Theme Mode</div>
                                        <div style={{ fontSize: '12px', opacity: 0.7 }}>Use system or override on this device.</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.08)', padding: '6px', borderRadius: '999px' }}>
                                        {[
                                            { id: 'light', label: 'Light', icon: Sun },
                                            { id: 'system', label: 'System', icon: Monitor },
                                            { id: 'dark', label: 'Dark', icon: Moon }
                                        ].map(option => (
                                            <button
                                                key={option.id}
                                                onClick={() => setThemeMode(option.id)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '6px 12px',
                                                    borderRadius: '999px',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    background: themeMode === option.id ? 'var(--accent-blue)' : 'transparent',
                                                    color: themeMode === option.id ? '#fff' : 'var(--text-primary)',
                                                    fontWeight: 600
                                                }}
                                            >
                                                <option.icon size={14} />
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <h4>Theme Color</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '15px', marginTop: '15px' }}>
                                    {themes.map(t => (
                                        <div
                                            key={t.id}
                                            onClick={() => setTheme(t.id)}
                                            style={{
                                                padding: '10px', borderRadius: '12px', cursor: 'pointer',
                                                border: theme === t.id ? '2px solid var(--accent-blue)' : '1px solid transparent',
                                                background: 'rgba(255,255,255,0.05)', textAlign: 'center'
                                            }}
                                        >
                                            <div style={{ width: '100%', height: '40px', borderRadius: '8px', background: t.color, marginBottom: '8px', opacity: 0.8 }}></div>
                                            <span style={{ fontSize: '14px' }}>{t.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'privacy' && (
                        <div className="animate-fade-in">
                            <h3 style={{ marginBottom: '20px' }}>Privacy</h3>
                            <div className="glass-card" style={{ padding: '20px' }}>
                                <p>Privacy settings coming soon...</p>
                            </div>
                        </div>
                    )}
                    {activeSection === 'notifications' && (
                        <div className="animate-fade-in">
                            <h3 style={{ marginBottom: '20px' }}>Notifications</h3>
                            <div className="glass-card" style={{ padding: '20px' }}>
                                <p>Notification settings coming soon...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
