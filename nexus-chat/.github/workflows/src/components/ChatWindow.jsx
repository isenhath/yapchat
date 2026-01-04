import React, { useState, useEffect, useRef } from 'react';
import { Phone, Video, MoreVertical, Send, Paperclip, Mic, Smile, ThumbsUp, Heart } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

const ChatWindow = ({ user, selectedChat, messages }) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        // Scroll to bottom when messages change
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="chat-window">
            <div className="chat-header">
                <div className="user-meta">
                    <div className="chat-avatar" style={{ width: '40px', height: '40px' }}>
                        {selectedChat?.avatar || 'CJ'}
                    </div>
                    <div>
                        <div className="chat-name">
                            {selectedChat?.name || 'Chat Group'} <span className="user-status"></span>
                        </div>
                    </div>
                </div>
                <div className="header-actions">
                    <Video size={20} />
                    <Phone size={20} />
                    <MoreVertical size={20} />
                </div>
            </div>

            <div className="chat-messages" ref={scrollRef}>
                <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)', margin: '10px 0' }}>January 27, 2023</div>

                {messages.map(msg => {
                    const isMe = msg.senderId === user?.uid || msg.isLocal;
                    return (
                        <div key={msg.id} className={`message-bubble-wrapper ${isMe ? 'me' : 'other'}`}>
                            <div className="message-bubble" style={isMe ? { background: 'var(--chat-bubble-me)' } : { background: 'var(--chat-bubble-other)' }}>
                                {msg.text}
                            </div>
                            {(msg.time || msg.isLocal) && (
                                <div className="chat-time" style={{ marginTop: '4px', alignSelf: isMe ? 'flex-end' : 'flex-start' }}>
                                    {isMe ? 'Today ' : ''}{msg.time || (msg.isLocal ? 'Sending...' : '')}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ChatWindow;
