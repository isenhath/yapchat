import React, { useState, useRef, useEffect } from 'react';
import { Book, Mic, MicOff, Plus, Trash2, StickyNote, Move, X, Sparkles, Maximize2, Folder, Search, Archive, Settings, HelpCircle } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { streamGeminiResponse, initializeGemini } from '../services/gemini';

const GEMINI_KEY = "AIzaSyCl55onthwVPmuYvICVjvxpLq_Tx8pAxuc";

const NotesPage = ({ user }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [notebooks, setNotebooks] = useState([]);
    const [folders, setFolders] = useState([]);
    const [activeNote, setActiveNote] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isThinking, setIsThinking] = useState(false);

    // Whiteboard State
    const [stickies, setStickies] = useState([]);
    const [draggingId, setDraggingId] = useState(null);
    const dragOffset = useRef({ x: 0, y: 0 });
    const saveTimeoutRef = useRef(null);

    useEffect(() => {
        initializeGemini(GEMINI_KEY);
    }, []);

    // Subscribe to Notebooks
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'users', user.uid, 'notebooks'), orderBy('updatedAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotebooks(notes);

            // Group by folder
            const folderMap = {};
            notes.forEach(note => {
                const folder = note.folder || 'Personal';
                if (!folderMap[folder]) folderMap[folder] = [];
                folderMap[folder].push(note);
            });
            setFolders(Object.keys(folderMap).map(name => ({ name, count: folderMap[name].length })));
        });
        return () => unsubscribe();
    }, [user]);

    // Subscribe to Whiteboard Stickies
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'users', user.uid, 'stickies'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setStickies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [user]);

    const createNotebook = async () => {
        const title = prompt("Notebook Title:");
        if (title && user) {
            try {
                const newNote = {
                    title,
                    content: '',
                    folder: 'Personal',
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                };
                const docRef = await addDoc(collection(db, 'users', user.uid, 'notebooks'), newNote);
                setActiveNote({ id: docRef.id, ...newNote });
                setActiveTab('editor');
            } catch (err) {
                console.error("Error creating notebook:", err);
            }
        }
    };

    const deleteNotebook = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Delete this notebook?")) return;

        try {
            await deleteDoc(doc(db, 'users', user.uid, 'notebooks', id));
            if (activeNote?.id === id) setActiveNote(null);
        } catch (err) {
            console.error("Error deleting notebook:", err);
        }
    };

    const handleNoteChange = (key, value) => {
        if (!activeNote) return;
        const updatedNote = { ...activeNote, [key]: value };
        setActiveNote(updatedNote);
        setNotebooks(prev => prev.map(n => n.id === activeNote.id ? updatedNote : n));

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                const noteRef = doc(db, 'users', user.uid, 'notebooks', activeNote.id);
                await updateDoc(noteRef, { [key]: value, updatedAt: serverTimestamp() });
            } catch (err) {
                console.error("Error auto-saving note:", err);
            }
        }, 1000);
    };

    const handleAIAction = async (action) => {
        if (!activeNote || !activeNote.content) return;
        setIsThinking(true);
        try {
            let prompt = "";
            if (action === 'summarize') prompt = `Summarize these notes into a concise bulleted list:\n\n${activeNote.content}`;
            if (action === 'expand') prompt = `Expand on the following notes, adding more detail and context:\n\n${activeNote.content}`;

            let aiSection = `\n\n--- AI ${action === 'summarize' ? 'Summary' : 'Expansion'} ---\n`;
            let accumulated = "";

            await streamGeminiResponse(prompt, (chunk) => {
                accumulated += chunk;
                const newContent = activeNote.content + aiSection + accumulated;
                setActiveNote(prev => ({ ...prev, content: newContent }));
                setNotebooks(prev => prev.map(n => n.id === activeNote.id ? { ...n, content: newContent } : n));
            });

            const finalContent = activeNote.content + aiSection + accumulated;
            handleNoteChange('content', finalContent);
        } catch (err) {
            console.error("AI Error:", err);
            alert("AI Failed: " + err.message);
        } finally {
            setIsThinking(false);
        }
    };

    const toggleRecording = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Speech recognition not supported in this browser.");
            return;
        }

        if (isRecording) {
            setIsRecording(false);
        } else {
            setIsRecording(true);
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onresult = (event) => {
                const text = event.results[0][0].transcript;
                if (activeNote) {
                    const newContent = (activeNote.content || '') + '\n' + text;
                    handleNoteChange('content', newContent);
                }
                setIsRecording(false);
            };

            recognition.onerror = () => setIsRecording(false);
            recognition.start();
        }
    };

    // Whiteboard Logic
    const addSticky = async () => {
        const colors = ['#fef3c7', '#dcfce7', '#dbeafe', '#fae8ff'];
        if (!user) return;

        try {
            await addDoc(collection(db, 'users', user.uid, 'stickies'), {
                x: Math.random() * 300 + 50,
                y: Math.random() * 300 + 50,
                text: 'New Idea',
                color: colors[Math.floor(Math.random() * colors.length)],
                createdAt: serverTimestamp()
            });
        } catch (err) {
            console.error("Error adding sticky:", err);
        }
    };

    const updateSticky = async (id, data) => {
        try {
            await updateDoc(doc(db, 'users', user.uid, 'stickies', id), data);
        } catch (err) {
            console.error("Error updating sticky:", err);
        }
    };

    const deleteSticky = async (id) => {
        try {
            await deleteDoc(doc(db, 'users', user.uid, 'stickies', id));
        } catch (err) {
            console.error("Error deleting sticky:", err);
        }
    };

    const handleMouseDown = (e, id) => {
        setDraggingId(id);
        const sticky = stickies.find(s => s.id === id);
        dragOffset.current = { x: e.clientX - sticky.x, y: e.clientY - sticky.y };
    };

    const handleMouseMove = (e) => {
        if (draggingId) {
            setStickies(stickies.map(s =>
                s.id === draggingId
                    ? { ...s, x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y }
                    : s
            ));
        }
    };

    const handleMouseUp = async () => {
        if (draggingId) {
            const sticky = stickies.find(s => s.id === draggingId);
            if (sticky) {
                await updateSticky(draggingId, { x: sticky.x, y: sticky.y });
            }
            setDraggingId(null);
        }
    };

    useEffect(() => {
        if (activeTab === 'whiteboard') {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [activeTab, draggingId, stickies]);

    const getFolderColor = (index) => {
        const colors = ['#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#8b5cf6'];
        return colors[index % colors.length];
    };

    return (
        <div className="notes-page" style={{ height: '100%', display: 'flex', background: 'var(--glass-bg)', color: 'var(--text-primary)' }}>
            {/* Sidebar */}
            <div style={{ width: '250px', borderRight: '1px solid var(--glass-border)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Book size={20} color="#fff" />
                    </div>
                    <div>
                        <div style={{ fontWeight: '700', fontSize: '16px' }}>My Notes</div>
                        <div style={{ fontSize: '12px', opacity: 0.6 }}>{user?.displayName}</div>
                    </div>
                </div>

                <button onClick={createNotebook} className="theme-btn" style={{ width: '100%', justifyContent: 'center' }}>
                    <Plus size={16} style={{ marginRight: '6px' }} /> Create Note
                </button>

                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Search size={16} style={{ opacity: 0.5 }} />
                    <input placeholder="Search" style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', width: '100%' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button onClick={() => setActiveTab('overview')} style={{ border: 'none', padding: '8px 12px', textAlign: 'left', cursor: 'pointer', borderRadius: '8px', background: activeTab === 'overview' ? 'rgba(255,255,255,0.1)' : 'transparent', color: 'var(--text-primary)' }}>
                        <Archive size={16} style={{ marginRight: '8px' }} />
                        Archives
                    </button>
                </div>

                <div style={{ marginTop: '20px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', opacity: 0.5, marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>FOLDERS</span>
                        <Plus size={14} style={{ cursor: 'pointer' }} />
                    </div>
                    {folders.map((folder, i) => (
                        <div key={folder.name} style={{ padding: '8px 12px', marginBottom: '4px', cursor: 'pointer', borderRadius: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Folder size={16} color={getFolderColor(i)} />
                            {folder.name}
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button style={{ background: 'none', border: 'none', padding: '8px', textAlign: 'left', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        <HelpCircle size={16} style={{ marginRight: '8px' }} />
                        Help
                    </button>
                    <button style={{ background: 'none', border: 'none', padding: '8px', textAlign: 'left', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        <Settings size={16} style={{ marginRight: '8px' }} />
                        Settings
                    </button>
                </div>
            </div >

            {/* Main Content */}
            < div style={{ flex: 1, overflow: 'auto' }}>
                {activeTab === 'overview' && (
                    <div style={{ padding: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h2 style={{ fontSize: '28px', fontWeight: '700' }}>My Notes</h2>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {['Today', 'This Week', 'This Month'].map(period => (
                                    <button key={period} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                        {period}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recent Notes Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                            {notebooks.slice(0, 4).map(note => (
                                <div
                                    key={note.id}
                                    onClick={() => { setActiveNote(note); setActiveTab('editor'); }}
                                    className="glass-card"
                                    style={{ padding: '20px', cursor: 'pointer', minHeight: '150px', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)', backdropFilter: 'blur(var(--glass-blur))', border: '1px solid rgba(255,255,255,0.1)' }}
                                >
                                    <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '8px' }}>{note.folder || 'Personal'}</div>
                                    <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>{note.title}</div>
                                    <div style={{ fontSize: '13px', opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{note.content || 'Empty note...'}</div>
                                    <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Sparkles size={16} color="#22c55e" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Folders */}
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Recent Folders</h3>
                <div style={{ display: 'flex', gap: '20px', overflowX: 'auto' }}>
                    {folders.map((folder, i) => (
                        <div key={folder.name} className="glass-card" style={{ minWidth: '140px', padding: '20px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.03)' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: `${getFolderColor(i)}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '20px', fontWeight: '700', color: getFolderColor(i) }}>
                                {folder.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>{folder.name}</div>
                            <div style={{ fontSize: '12px', opacity: 0.6 }}>{folder.count} notes</div>
                        </div>
                    ))}
                </div>

                {/* Whiteboard Section */}
                <button onClick={() => setActiveTab('whiteboard')} className="theme-btn" style={{ marginTop: '30px', padding: '10px 20px' }}>
                    <StickyNote size={16} style={{ marginRight: '6px' }} /> Open Whiteboard
                </button>
            </div>
        )}

            {activeTab === 'editor' && activeNote && (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '40px' }}>
                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <input
                            value={activeNote.title}
                            onChange={(e) => handleNoteChange('title', e.target.value)}
                            style={{ background: 'none', border: 'none', fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)', width: '100%', outline: 'none' }}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleAIAction('summarize')} className="theme-btn" disabled={isThinking} style={{ padding: '8px', opacity: isThinking ? 0.5 : 1 }} title="Summarize">
                                <Sparkles size={18} />
                            </button>
                            <button onClick={() => handleAIAction('expand')} className="theme-btn" disabled={isThinking} style={{ padding: '8px', opacity: isThinking ? 0.5 : 1 }} title="Expand">
                                <Maximize2 size={18} />
                            </button>
                            <button onClick={toggleRecording} className={`theme-btn ${isRecording ? 'pulse' : ''}`} style={{ background: isRecording ? 'var(--accent-pink)' : 'var(--glass-bg)', padding: '8px' }} title="Record">
                                {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                            </button>
                        </div>
                    </div>
                    <textarea
                        value={activeNote.content}
                        onChange={(e) => handleNoteChange('content', e.target.value)}
                        placeholder="Start typing or use the microphone..."
                        style={{ flex: 1, width: '100%', background: 'transparent', border: 'none', fontSize: '16px', lineHeight: '1.6', resize: 'none', outline: 'none', color: 'var(--text-primary)' }}
                    />
                </div>
            )}

            {activeTab === 'whiteboard' && (
                <div style={{ height: '100%', position: 'relative', overflow: 'hidden', cursor: draggingId ? 'grabbing' : 'grab' }}>
                    <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
                        <button onClick={addSticky} className="theme-btn">
                            <Plus size={16} style={{ marginRight: '6px' }} /> Add Sticky
                        </button>
                    </div>
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(var(--text-secondary) 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.1 }}></div>
                    {stickies.map(s => (
                        <div key={s.id} onMouseDown={(e) => handleMouseDown(e, s.id)} style={{ position: 'absolute', left: s.x, top: s.y, width: '200px', minHeight: '150px', background: s.color, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '12px', borderRadius: '4px', transform: s.id === draggingId ? 'scale(1.02)' : 'scale(1)', transition: 'transform 0.1s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', cursor: 'grab' }}>
                )}

                                {activeTab === 'editor' && activeNote && (
                                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '40px' }}>
                                        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <input
                                                value={activeNote.title}
                                                onChange={(e) => handleNoteChange('title', e.target.value)}
                                                style={{ background: 'none', border: 'none', fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)', width: '100%', outline: 'none' }}
                                            />
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => handleAIAction('summarize')} className="theme-btn" disabled={isThinking} style={{ padding: '8px', opacity: isThinking ? 0.5 : 1 }} title="Summarize">
                                                    <Sparkles size={18} />
                                                </button>
                                                <button onClick={() => handleAIAction('expand')} className="theme-btn" disabled={isThinking} style={{ padding: '8px', opacity: isThinking ? 0.5 : 1 }} title="Expand">
                                                    <Maximize2 size={18} />
                                                </button>
                                                <button onClick={toggleRecording} className={`theme-btn ${isRecording ? 'pulse' : ''}`} style={{ background: isRecording ? 'var(--accent-pink)' : 'var(--glass-bg)', padding: '8px' }} title="Record">
                                                    {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                        <textarea
                                            value={activeNote.content}
                                            onChange={(e) => handleNoteChange('content', e.target.value)}
                                            placeholder="Start typing or use the microphone..."
                                            style={{ flex: 1, width: '100%', background: 'transparent', border: 'none', fontSize: '16px', lineHeight: '1.6', resize: 'none', outline: 'none', color: 'var(--text-primary)' }}
                                        />
                                    </div>
                                )}

                                {activeTab === 'whiteboard' && (
                                    <div style={{ height: '100%', position: 'relative', overflow: 'hidden', cursor: draggingId ? 'grabbing' : 'grab' }}>
                                        <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
                                            <button onClick={addSticky} className="theme-btn">
                                                <Plus size={16} style={{ marginRight: '6px' }} /> Add Sticky
                                            </button>
                                        </div>
                                        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(var(--text-secondary) 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.1 }}></div>
                                        {stickies.map(s => (
                                            <div key={s.id} onMouseDown={(e) => handleMouseDown(e, s.id)} style={{ position: 'absolute', left: s.x, top: s.y, width: '200px', minHeight: '150px', background: s.color, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '12px', borderRadius: '4px', transform: s.id === draggingId ? 'scale(1.02)' : 'scale(1)', transition: 'transform 0.1s' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', cursor: 'grab' }}>
                                                    <Move size={14} style={{ opacity: 0.5 }} />
                                                    <X size={14} style={{ opacity: 0.5, cursor: 'pointer' }} onClick={() => deleteSticky(s.id)} />
                                                </div>
                                                <textarea value={s.text} onChange={(e) => setStickies(stickies.map(st => st.id === s.id ? { ...st, text: e.target.value } : st))} onBlur={(e) => updateSticky(s.id, { text: e.target.value })} style={{ width: '100%', height: '100px', background: 'transparent', border: 'none', resize: 'none', color: '#000', fontSize: '14px', outline: 'none' }} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
};

                    export default NotesPage;
