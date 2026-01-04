import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Mail, MessageCircle, Send } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const Contacts = ({ user, onMessage }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Auto-search effect for responsiveness
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length >= 3) {
                handleSearch();
            } else if (searchQuery.length === 0) {
                setSearchResults([]);
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            // Client-side filtering for better partial/case-insensitive search
            // In a large app, rely on Algolia/Typesense. For this scale, fetch & filter is fine.

            const usersRef = collection(db, 'users');
            const snapshot = await getDocs(usersRef); // Fetching all (or use limit(50))

            const queryLower = searchQuery.toLowerCase();
            const results = [];

            snapshot.forEach(doc => {
                if (doc.id === user.uid) return; // Skip self
                const data = doc.data();
                const name = (data.displayName || '').toLowerCase();
                const email = (data.email || '').toLowerCase();

                if (name.includes(queryLower) || email.includes(queryLower)) {
                    results.push({ id: doc.id, ...data });
                }
            });

            setSearchResults(results);
        } catch (error) {
            console.error("Error searching users:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleInvite = () => {
        const inviteLink = `${window.location.origin}/?ref=${user.uid}`;
        navigator.clipboard.writeText(inviteLink);
        alert(`Invite link copied to clipboard!\n\n${inviteLink}`);
    };

    const handleSyncContacts = async () => {
        // Note: Google Contacts API requires OAuth scopes beyond basic Google Sign-In
        // This is a placeholder - full implementation would need Google People API
        alert("Contact sync would require additional Google API permissions. For now, share your invite link with friends!");
    };

    return (
        <div className="contacts-page animate-fade-in" style={{ padding: '0', color: 'var(--text-primary)', height: '100%', width: '100%' }}>
            <div className="glass-card" style={{ padding: '40px', width: '100%', height: '100%', borderRadius: '0', border: 'none', background: 'transparent' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: '700' }}>Find People</h1>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={handleSyncContacts} className="theme-btn" style={{ padding: '10px 16px' }}>
                            <UserPlus size={16} style={{ marginRight: '6px' }} />
                            Sync Contacts
                        </button>
                        <button onClick={handleInvite} className="theme-btn" style={{ padding: '10px 16px' }}>
                            <Send size={16} style={{ marginRight: '6px' }} />
                            Invite Link
                        </button>
                    </div>
                </div>

                <div className="search-bar" style={{ marginBottom: '30px', background: 'rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center' }}>
                    <Search size={20} style={{ marginRight: '12px', opacity: 0.6 }} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ background: 'none', border: 'none', color: 'inherit', fontSize: '16px', width: '100%', outline: 'none' }}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    {isSearching && <span style={{ fontSize: '12px', opacity: 0.7 }}>Searching...</span>}
                </div>

                <div className="contacts-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {searchResults.length > 0 ? (
                        searchResults.map(contact => (
                            <div key={contact.id} className="contact-item glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.05)', border: 'none' }}>
                                <img
                                    src={contact.photoURL || `https://ui-avatars.com/api/?name=${contact.displayName || 'User'}&background=random`}
                                    alt="Avatar"
                                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', fontSize: '16px' }}>{contact.displayName || 'Unknown User'}</div>
                                    <div style={{ fontSize: '13px', opacity: 0.7 }}>{contact.email}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => onMessage && onMessage(contact)}
                                        className="theme-btn"
                                        style={{ padding: '8px 16px', fontSize: '14px' }}
                                    >
                                        <MessageCircle size={16} style={{ marginRight: '6px' }} />
                                        Chat
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        searchQuery.length > 3 && !isSearching && (
                            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.8 }}>
                                <div style={{ marginBottom: '16px', fontSize: '16px' }}>No users found with that email.</div>
                                <button
                                    onClick={handleInvite}
                                    className="theme-btn"
                                    style={{ margin: '0 auto', background: 'var(--accent-blue)', color: 'white' }}
                                >
                                    <Mail size={16} style={{ marginRight: '8px' }} />
                                    Invite {searchQuery} to Yap Chat
                                </button>
                            </div>
                        )
                    )}

                    {/* Helper text if nothing typed */}
                    {searchQuery.length < 3 && (
                        <div style={{ textAlign: 'center', padding: '60px', opacity: 0.5 }}>
                            <UserPlus size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                            <p>Type an email address to find friends on Yap Chat.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Contacts;
