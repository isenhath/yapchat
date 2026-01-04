import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, Lock } from 'lucide-react';
import { initializeGemini, streamGeminiResponse } from '../services/gemini';

const AIChat = () => {
    // Global Key for all users
    const apiKey = "AIzaSyCl55onthwVPmuYvICVjvxpLq_Tx8pAxuc";

    const [messages, setMessages] = useState([
        { id: 1, role: 'ai', text: 'Hello! I am Gemini. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    // Initialize immediately
    useEffect(() => {
        initializeGemini(apiKey);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const text = input;
        const userMsg = { id: Date.now(), role: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Create a placeholder AI message
            const aiMsgId = Date.now() + 1;
            setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', text: '' }]);

            let fullText = "";
            await streamGeminiResponse(text, (chunk) => {
                fullText += chunk;
                setMessages(prev => prev.map(msg =>
                    msg.id === aiMsgId ? { ...msg, text: fullText } : msg
                ));
            });

            setIsTyping(false);
        } catch (error) {
            console.error(error);
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: Date.now() + 2,
                role: 'ai',
                text: "Sorry, I encountered an error. Please try again later."
            }]);
        }
    };

    return (
        <div className="ai-chat-container animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent' }}>
            <div className="chat-header" style={{
                padding: '20px',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'rgba(255,255,255,0.05)'
            }}>
                <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Sparkles size={24} />
                </div>
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Gemini AI</h2>
                    <div style={{ fontSize: '12px', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span>
                        Working
                    </div>
                </div>
            </div>

            <div className="chat-messages" ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {messages.map(msg => (
                    <div key={msg.id} style={{
                        display: 'flex',
                        gap: '12px',
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '80%'
                    }}>
                        {msg.role === 'ai' && (
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Bot size={18} />
                            </div>
                        )}
                        <div style={{
                            padding: '12px 16px',
                            borderRadius: '16px',
                            background: msg.role === 'user' ? 'var(--accent-blue)' : 'var(--glass-bg)',
                            color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                            border: msg.role === 'ai' ? '1px solid var(--glass-border)' : 'none',
                            borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                            borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '16px',
                            backdropFilter: 'blur(var(--glass-blur-soft))'
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            <div className="chat-footer-full">
                <div className="input-container-full">
                    <input
                        type="text"
                        placeholder="Ask Gemini anything..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button className="send-btn" onClick={handleSend}>
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIChat;
