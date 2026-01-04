import React from 'react';
import { MessageSquare, Video, Users, Folder, Calendar, Star, Settings, Briefcase, Layout, Bot, FileText } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, setActivePage }) => {
    return (
        <div className="sidebar">
            <div
                className={`sidebar-icon ${activeTab === 'chats' ? 'active' : ''}`}
                onClick={() => { setActiveTab('chats'); setActivePage('portal'); }}
            >
                <MessageSquare size={24} />
                <span className="badge">1</span>
            </div>

            <div
                className={`sidebar-icon ${activeTab === 'video' ? 'active' : ''}`}
                onClick={() => setActiveTab('video')}
            >
                <Video size={24} />
            </div>

            <div
                className={`sidebar-icon ${activeTab === 'contacts' ? 'active' : ''}`}
                onClick={() => { setActiveTab('contacts'); setActivePage('contacts'); }}
            >
                <Users size={24} />
            </div>

            <div
                className={`sidebar-icon ${activeTab === 'ai' ? 'active' : ''}`}
                onClick={() => { setActiveTab('ai'); setActivePage('portal'); }}
            >
                <Bot size={24} />
            </div>

            <div
                className={`sidebar-icon ${activeTab === 'notes' ? 'active' : ''}`}
                onClick={() => { setActiveTab('notes'); setActivePage('notes'); }}
            >
                <FileText size={24} />
            </div>

            <div style={{ flex: 1 }} />

            <div
                className={`sidebar-icon ${activeTab === 'calendar' ? 'active' : ''}`}
                onClick={() => setActiveTab('calendar')}
            >
                <Calendar size={24} />
            </div>

            <div
                className={`sidebar-icon ${activeTab === 'star' ? 'active' : ''}`}
                onClick={() => setActiveTab('star')}
            >
                <Star size={24} />
            </div>

            <div
                className={`sidebar-icon ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => { setActiveTab('settings'); setActivePage('settings'); }}
            >
                <Settings size={24} />
            </div>

            <div
                className={`sidebar-icon ${activeTab === 'briefcase' ? 'active' : ''}`}
                onClick={() => setActiveTab('briefcase')}
            >
                <Briefcase size={24} />
            </div>

            <div className="sidebar-icon" onClick={() => setActivePage('portal')}>
                <Layout size={24} />
            </div>
        </div>
    );
};

export default Sidebar;
