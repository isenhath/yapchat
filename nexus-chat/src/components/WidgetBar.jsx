import React, { useState } from 'react';
import { Archive, Image, Link, FileText, ChevronDown, XCircle, Globe, Users, Camera, Mic, MapPin, Grid, Plus, Check, Edit2, Calendar } from 'lucide-react';

const WidgetBar = ({ setTheme, onOpenThemePicker, messageCount = 0, reminders = [], onAddReminder, onToggleReminder, onDeleteReminder, visibleWidgets = {}, onOpenWidgetEditor, notes, setNotes }) => {
    const [isAddingReminder, setIsAddingReminder] = useState(false);
    const [newReminderText, setNewReminderText] = useState('');
    const [newReminderPriority, setNewReminderPriority] = useState('medium');

    const handleAdd = () => {
        if (newReminderText.trim()) {
            onAddReminder(newReminderText, newReminderPriority);
            setNewReminderText('');
            setIsAddingReminder(false);
        }
    };

    const getPriorityColor = (p) => {
        if (p === 'high') return 'var(--accent-pink)';
        if (p === 'low') return 'var(--accent-blue)';
        return '#f59e0b'; // medium
    };

    return (
        <div className="widget-bar">
            {/* Search and Notifications at top */}
            <div className="widget-top-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginBottom: '20px' }}>
                <Globe size={20} className="icon-secondary" />
                <Archive size={20} className="icon-secondary" />
            </div>

            {visibleWidgets['Chat Files'] && (
                <div className="widget" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
                    <div className="widget-header">
                        <h3>Chat Files</h3>
                        <XCircle size={16} />
                    </div>
                    <div className="widget-content">
                        <div className="file-item">
                            <Image size={18} />
                            <span>{messageCount > 0 ? `${messageCount} Messages` : 'No Messages'}</span>
                            <ChevronDown size={14} style={{ marginLeft: 'auto' }} />
                        </div>
                        <div className="file-item">
                            <Link size={18} />
                            <span>13 Links</span>
                            <ChevronDown size={14} style={{ marginLeft: 'auto' }} />
                        </div>
                        <div className="file-item">
                            <FileText size={18} />
                            <span>72 Attachments</span>
                            <ChevronDown size={14} style={{ marginLeft: 'auto' }} />
                        </div>
                    </div>
                </div>
            )}

            {visibleWidgets['Reminders'] && (
                <div className="widget" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
                    <div className="widget-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3>Reminders</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Plus
                                size={16}
                                style={{ cursor: 'pointer', opacity: 0.7 }}
                                onClick={() => setIsAddingReminder(!isAddingReminder)}
                            />
                            <XCircle size={16} style={{ cursor: 'pointer', opacity: 0.7 }} />
                        </div>
                    </div>

                    {isAddingReminder && (
                        <div className="glass-card" style={{ padding: '12px', marginBottom: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)' }}>
                            <input
                                type="text"
                                placeholder="New reminder..."
                                value={newReminderText}
                                onChange={(e) => setNewReminderText(e.target.value)}
                                style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', padding: '4px', marginBottom: '8px', color: 'var(--text-primary)', outline: 'none' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <select
                                    value={newReminderPriority}
                                    onChange={(e) => setNewReminderPriority(e.target.value)}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer' }}
                                >
                                    <option value="high">High Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="low">Low Priority</option>
                                </select>
                                <button onClick={handleAdd} style={{ background: 'var(--accent-blue)', border: 'none', borderRadius: '4px', padding: '4px 8px', color: 'white', cursor: 'pointer', fontSize: '12px' }}>Add</button>
                            </div>
                        </div>
                    )}

                    <div className="widget-content">
                        {reminders.map(reminder => (
                            <div key={reminder.id} className="reminder-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', opacity: reminder.checked ? 0.5 : 1 }}>
                                <div
                                    onClick={() => onToggleReminder && onToggleReminder(reminder.id)}
                                    style={{
                                        width: '18px', height: '18px',
                                        border: `2px solid ${getPriorityColor(reminder.priority)}`,
                                        borderRadius: '4px',
                                        background: reminder.checked ? getPriorityColor(reminder.priority) : 'transparent',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    {reminder.checked && <Check size={12} color="white" />}
                                </div>
                                <span style={{ fontSize: '14px', textDecoration: reminder.checked ? 'line-through' : 'none' }}>{reminder.text}</span>
                                <XCircle
                                    size={14}
                                    style={{ marginLeft: 'auto', opacity: 0, cursor: 'pointer' }}
                                    className="delete-btn"
                                    onClick={() => onDeleteReminder && onDeleteReminder(reminder.id)}
                                />
                            </div>
                        ))}
                        {reminders.length === 0 && <div style={{ opacity: 0.5, fontSize: '13px', textAlign: 'center', padding: '10px' }}>No reminders</div>}
                    </div>
                </div>
            )}

            {visibleWidgets['Tool Box'] && (
                <div className="widget" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
                    <div className="widget-header">
                        <h3 style={{ color: 'var(--text-primary)' }}>Tool Box</h3>
                        <XCircle size={16} color="#ccc" />
                    </div>
                    <div className="tool-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'center' }}>
                        <div className="tool-item">
                            <Users size={20} />
                            <div style={{ fontSize: '10px', marginTop: '4px' }}>Contacts</div>
                        </div>
                        <div className="tool-item">
                            <Camera size={20} />
                            <div style={{ fontSize: '10px', marginTop: '4px' }}>Camera</div>
                        </div>
                        <div className="tool-item">
                            <Mic size={20} />
                            <div style={{ fontSize: '10px', marginTop: '4px' }}>Mic</div>
                        </div>
                    </div>
                </div>
            )}

            {visibleWidgets['Notes'] && (
                <div className="widget" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
                    <div className="widget-header">
                        <h3>Notes</h3>
                        <XCircle size={16} />
                    </div>
                    <div className="glass-card" style={{ padding: '0', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Type your notes here..."
                            style={{
                                width: '100%',
                                height: '100px',
                                background: 'transparent',
                                border: 'none',
                                padding: '12px',
                                color: 'var(--text-primary)',
                                resize: 'none',
                                outline: 'none',
                                fontSize: '13px',
                                lineHeight: '1.5'
                            }}
                        />
                    </div>
                </div>
            )}

            {visibleWidgets['Calendar'] && (
                <div className="widget" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
                    <div className="widget-header">
                        <h3>Calendar</h3>
                        <Calendar size={16} style={{ opacity: 0.7 }} />
                    </div>
                    <div className="glass-card" style={{ padding: '12px', background: 'rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
                            <span>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                            <span>&gt;</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '12px' }}>
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d} style={{ opacity: 0.5 }}>{d}</span>)}
                            {(() => {
                                const today = new Date();
                                const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
                                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
                                const days = [];
                                for (let i = 0; i < firstDay; i++) days.push(<span key={`empty-${i}`}></span>);
                                for (let i = 1; i <= daysInMonth; i++) {
                                    const isToday = i === today.getDate();
                                    days.push(
                                        <span key={i} style={{
                                            background: isToday ? 'var(--accent-blue)' : 'transparent',
                                            borderRadius: '50%',
                                            color: isToday ? 'white' : 'inherit',
                                            width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'
                                        }}>
                                            {i}
                                        </span>
                                    );
                                }
                                return days;
                            })()}
                        </div>
                    </div>
                </div>
            )}

            <div className="theme-switcher-container" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="widget-header" style={{ marginBottom: 0 }}>
                    <h3>APPEARANCE</h3>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className="theme-btn"
                        onClick={onOpenThemePicker}
                        style={{ flex: 1 }}
                    >
                        <Grid size={16} />
                        Theme
                    </button>
                    <button
                        className="theme-btn"
                        onClick={onOpenWidgetEditor}
                        style={{ flex: 1 }}
                    >
                        <Edit2 size={16} />
                        Widgets
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WidgetBar;
