import React from 'react';
import { User, Mail, LogOut, X, Settings, Shield, Bell } from 'lucide-react';

const Account = ({ user, onSignOut, onClose }) => {
    return (
        <div className="account-page animate-fade-in" style={{ padding: '0', color: 'var(--text-primary)', height: '100%', width: '100%' }}>
            <div className="glass-card" style={{ padding: '40px', width: '100%', height: '100%', borderRadius: '0', border: 'none', background: 'transparent', margin: '0' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                    <X size={24} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img
                            src={user.photoURL}
                            alt="Profile"
                            style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid var(--accent-blue)', padding: '4px' }}
                        />
                        <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'var(--accent-blue)', color: 'white', padding: '6px', borderRadius: '50%', display: 'flex' }}>
                            <Settings size={16} />
                        </div>
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', marginTop: '20px' }}>{user.displayName || 'Nexus User'}</h1>
                    <p style={{ opacity: 0.7 }}>Member since Jan 2026</p>
                </div>

                <div className="settings-section" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="settings-item glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: 'none', background: 'rgba(255,255,255,0.05)' }}>
                        <Mail size={20} style={{ color: 'var(--accent-blue)' }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', opacity: 0.6 }}>Email Address</div>
                            <div style={{ fontWeight: '500' }}>{user.email}</div>
                        </div>
                    </div>

                    <div className="settings-item glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: 'none', background: 'rgba(255,255,255,0.05)' }}>
                        <Shield size={20} style={{ color: 'var(--accent-blue)' }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', opacity: 0.6 }}>Security</div>
                            <div style={{ fontWeight: '500' }}>Password & MFA</div>
                        </div>
                    </div>

                    <div className="settings-item glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: 'none', background: 'rgba(255,255,255,0.05)' }}>
                        <Bell size={20} style={{ color: 'var(--accent-blue)' }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', opacity: 0.6 }}>Notifications</div>
                            <div style={{ fontWeight: '500' }}>Push & Sound Settings</div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '40px' }}>
                    <button
                        onClick={onSignOut}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '16px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            cursor: 'pointer'
                        }}
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Account;
