import React from 'react';
import { Search, Edit3 } from 'lucide-react';

const ChatPanel = ({ selectedChat, setSelectedChat, chats, onCreateChat }) => {
    return (
        <div className="chat-panel">
            <div className="chat-panel-header">
                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input type="text" placeholder="Search" />
                </div>
            </div>

            <div className="chat-list-container">
                <div style={{ padding: '0 20px 20px' }}>
                    <button
                        onClick={onCreateChat}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'var(--accent-blue)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0, 132, 255, 0.2)'
                        }}
                    >
                        <Edit3 size={18} />
                        Create Chat
                    </button>
                </div>

                <div className="chat-list">
                    {chats.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                            <p>No chats yet.</p>
                            <p style={{ fontSize: '12px', marginTop: '8px' }}>Start a conversation to get going!</p>
                        </div>
                    ) : (
                        chats.map(chat => (
                            <div
                                key={chat.id}
                                className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                                onClick={() => setSelectedChat(chat)}
                            >
                                <div className="chat-avatar" style={{ background: chat.color || 'var(--accent-blue)' }}>{chat.avatar}</div>
                                <div className="chat-info">
                                    <div className="chat-name-row">
                                        <span className="chat-name">{chat.name}</span>
                                        <span className="chat-time">{chat.time || 'now'}</span>
                                    </div>
                                    <div className="chat-msg-row">
                                        <span className="chat-msg">{chat.msg}</span>
                                        {chat.count && <span className="chat-unread">{chat.count}</span>}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>


        </div>
    );
};

export default ChatPanel;
