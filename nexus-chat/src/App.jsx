import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import ChatWindow from './components/ChatWindow';
import WidgetBar from './components/WidgetBar';
import AIChat from './components/AIChat';
import ThemePicker from './components/ThemePicker';
import Tutorial from './components/Tutorial';
import Contacts from './components/Contacts';
import Account from './components/Account';
import AvatarSelector from './components/AvatarSelector';
import NotesPage from './components/NotesPage';
import SettingsPage from './components/SettingsPage';
import WidgetEditor from './components/WidgetEditor';
import ResizeHandle from './components/ResizeHandle';
import { auth, googleProvider, db } from './firebase/config';
import { signInWithPopup, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { Search, Bell, XCircle, LogIn, UserPlus, Smile, Paperclip, Mic, Send } from 'lucide-react';
import heroImg from './assets/hero.png';
import './index.css';
import './App.css';

import YapLogo from './components/YapLogo';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('nexus_theme') || 'theme-midnight');
  const savedThemeMode = localStorage.getItem('nexus_theme_mode');
  const legacyDarkMode = localStorage.getItem('nexus_dark_mode');
  const initialThemeMode = savedThemeMode || (legacyDarkMode === null ? 'system' : (legacyDarkMode === 'true' ? 'dark' : 'light'));
  const [themeMode, setThemeMode] = useState(initialThemeMode);
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);
  const [activeTab, setActiveTab] = useState('chats');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [showWidgetEditor, setShowWidgetEditor] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState({
    'Chat Files': true,
    'Reminders': true,
    'Tool Box': true,
    'Notes': true,
    'Calendar': true
  });
  const [activePage, setActivePage] = useState('portal');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [reminders, setReminders] = useState([]);
  // Notes state
  const [notes, setNotes] = useState('Meeting notes:\n- Discuss improved UI\n- Review resizing feature');
  const isDarkMode = themeMode === 'system' ? systemPrefersDark : themeMode === 'dark';

  // Resizing State

  // Resizing State
  const [leftWidth, setLeftWidth] = useState(80);
  const [rightWidth, setRightWidth] = useState(340);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingLeft) {
        const newWidth = Math.max(60, Math.min(300, e.clientX));
        setLeftWidth(newWidth);
      }
      if (isDraggingRight) {
        const newWidth = Math.max(250, Math.min(500, window.innerWidth - e.clientX));
        setRightWidth(newWidth);
      }
    };
    const handleMouseUp = () => {
      setIsDraggingLeft(false);
      setIsDraggingRight(false);
    };

    if (isDraggingLeft || isDraggingRight) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.cursor = 'default';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isDraggingLeft, isDraggingRight]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event) => setSystemPrefersDark(event.matches);
    setSystemPrefersDark(media.matches);
    if (media.addEventListener) {
      media.addEventListener('change', handleChange);
    } else {
      media.addListener(handleChange);
    }
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', handleChange);
      } else {
        media.removeListener(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Save/update user profile in Firestore for search functionality
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          await setDoc(userRef, {
            displayName: currentUser.displayName || '',
            email: currentUser.email || '',
            photoURL: currentUser.photoURL || '',
            lastSeen: serverTimestamp()
          }, { merge: true });

          // Fetch user preferences from Firestore
          const userDoc = await getDoc(userRef);
          if (userDoc.exists() && userDoc.data().theme) {
            const userData = userDoc.data();
            setTheme(userData.theme);
            if (userData.themeMode) {
              setThemeMode(userData.themeMode);
            } else if (typeof userData.isDarkMode === 'boolean') {
              setThemeMode(userData.isDarkMode ? 'dark' : 'light');
            }
            localStorage.setItem('nexus_theme_selected', 'true');
          } else {
            setShowOnboarding(true);
            setShowOnboarding(true);
            setShowTutorial(true);
          }

          if (!currentUser.photoURL) {
            setShowAvatarSelector(true);
          }
        } catch (err) {
          console.error("Error saving/fetching user data:", err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Apply theme and dark mode
    document.body.className = `${theme} ${isDarkMode ? 'dark-mode' : ''}`;
    localStorage.setItem('nexus_theme', theme);
    localStorage.setItem('nexus_theme_mode', themeMode);
    localStorage.setItem('nexus_dark_mode', isDarkMode);

    if (user) {
      const saveTheme = async () => {
        try {
          await setDoc(doc(db, 'users', user.uid), {
            theme,
            themeMode
          }, { merge: true });
        } catch (err) {
          console.warn("Could not sync theme:", err);
        }
      };
      saveTheme();
    }
  }, [theme, themeMode, isDarkMode, user]);

  // Persist Sidebar Scratchpad
  useEffect(() => {
    if (!user) return;
    const scratchpadRef = doc(db, 'users', user.uid, 'private', 'scratchpad');

    // Load initial
    getDoc(scratchpadRef).then(snap => {
      if (snap.exists()) {
        setNotes(snap.data().content || '');
      }
    });

    // Auto-save when notes change (we'll rely on the debounced effect below or handling it here)
  }, [user]);

  // Debounced Save for Scratchpad
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(async () => {
      try {
        const scratchpadRef = doc(db, 'users', user.uid, 'private', 'scratchpad');
        await setDoc(scratchpadRef, { content: notes, updatedAt: serverTimestamp() }, { merge: true });
      } catch (err) {
        console.error("Error saving scratchpad:", err);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [notes, user]);

  // Subscribe to Reminders
  useEffect(() => {
    if (!user) {
      setReminders([]);
      return;
    }
    const q = query(collection(db, 'users', user.uid, 'reminders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbReminders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReminders(dbReminders);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }

    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        time: doc.data().timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setMessages(msgs);
    }, (err) => {
      console.warn("Firestore snapshot error (demo mode?):", err);
      if (messages.length === 0) {
        setMessages([
          { id: 1, text: 'Hey there! (Demo Mode)', senderId: 'demo', senderName: 'Amelia', avatar: 'AJ' },
          { id: 2, text: 'Once you add your Firebase keys, this chat will be live!', senderId: 'demo', senderName: 'Amelia' }
        ]);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: input,
        senderId: user.uid,
        senderName: user.displayName || user.email || 'Anonymous',
        senderPhoto: user.photoURL || '',
        timestamp: serverTimestamp()
      });
      setInput('');
    } catch (err) {
      console.error("Error sending message:", err);
      // Local fallback for demo
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: input,
        senderId: user.uid,
        senderName: user.displayName || 'Me',
        isLocal: true
      }]);
      setInput('');
    }
  };

  const handleMessageContact = (contact) => {
    // Create or find a chat for this contact
    const chatName = contact.name || contact.email;
    const newChat = {
      id: contact.id || Date.now(),
      name: chatName,
      avatar: contact.avatar || chatName.charAt(0).toUpperCase(),
      lastMessage: 'Starting a new conversation...',
      time: 'Now'
    };

    // Add to chats if not already there
    if (!chats.find(c => c.id === newChat.id)) {
      setChats(prev => [newChat, ...prev]);
    }

    setSelectedChat(newChat);
    setActivePage('portal');
    setActiveTab('chats');
  };

  // Sync theme logic moved to consolidated effect above

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        setUser({ ...userCredential.user, displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message.replace('Firebase:', ''));
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  const handleSignOut = () => signOut(auth);

  if (loading) return <div className="app-container">Loading...</div>;

  const handleThemeSelection = (selectedTheme, selectedMode = themeMode) => {
    setTheme(selectedTheme);
    setThemeMode(selectedMode);
    setShowOnboarding(false);
    localStorage.setItem('nexus_theme_selected', 'true');
  };

  const handleCreateChat = () => {
    const newChatName = prompt("Enter contact name:");
    if (!newChatName) return;
    const newChat = {
      id: Date.now(),
      name: newChatName,
      avatar: newChatName.split(' ').map(n => n[0]).join('').toUpperCase(),
      msg: 'Start of a new conversation',
      time: 'now',
      color: `hsl(${Math.random() * 360}, 70%, 70%)`
    };
    setChats([newChat, ...chats]);
    setSelectedChat(newChat);
    setSelectedChat(newChat);
    setSelectedChat(newChat);
  };

  const addReminder = async (text, priority) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'users', user.uid, 'reminders'), {
        text,
        priority,
        checked: false,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Error adding reminder:", e);
    }
  };

  const toggleReminder = async (id) => {
    if (!user) return;
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;
    try {
      const reminderRef = doc(db, 'users', user.uid, 'reminders', id);
      await updateDoc(reminderRef, { checked: !reminder.checked });
    } catch (e) {
      console.error("Error toggling reminder:", e);
    }
  };

  const deleteReminder = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'reminders', id));
    } catch (e) {
      console.error("Error deleting reminder:", e);
    }
  };

  const generateMonogram = (name, customColor) => {
    const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
    const colors = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6'];
    const color = customColor || colors[Math.floor(Math.random() * colors.length)];
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(255,255,255,0.4);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgba(255,255,255,0.1);stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="${color}" />
      <rect width="100" height="100" fill="url(#grad)" style="mix-blend-mode:overlay" />
      <text x="50" y="50" dy=".35em" text-anchor="middle" fill="white" font-size="40" font-family="Arial, sans-serif" font-weight="bold" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));">${initials}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const generateEmojiAvatar = (emoji) => {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#f3f4f6" />
      <text x="50" y="50" dy=".35em" text-anchor="middle" font-size="60">${emoji}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const handleAvatarSelect = async (selection, color) => {
    let photoURL;
    if (selection) {
      // It's a preset URL
      photoURL = selection;
    } else {
      // Generate monogram with color
      photoURL = generateMonogram(user.displayName || user.email, color);
    }

    await updateProfile(user, { photoURL });
    await setDoc(doc(db, 'users', user.uid), { photoURL }, { merge: true });
    setShowAvatarSelector(false);
    setUser({ ...user, photoURL });
  };

  const handleAvatarSkip = async () => {
    const photoURL = generateMonogram(user.displayName || user.email);
    await updateProfile(user, { photoURL });
    await setDoc(doc(db, 'users', user.uid), { photoURL }, { merge: true });
    setShowAvatarSelector(false);
    setUser({ ...user, photoURL }); // Update local state
    setUser({ ...user, photoURL }); // Update local state
  };

  const toggleWidget = (widgetName) => {
    setVisibleWidgets(prev => ({
      ...prev,
      [widgetName]: !prev[widgetName]
    }));
  };

  if (!user) {
    return (
      <div className={`app-container ${theme}`}>
        <div className="glass-card auth-split-container animate-fade-in" style={{ padding: 0 }}>
          <div className="auth-left-panel">
            <img
              src={heroImg}
              alt="Hero"
              className="auth-hero-img"
            />
          </div>
          <form className="auth-right-panel" onSubmit={handleEmailAuth}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
              <p className="signup-link" style={{ margin: 0, fontSize: '12px' }}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  style={{ background: 'none', border: 'none', color: '#000', fontWeight: '700', cursor: 'pointer', marginLeft: '6px', textDecoration: 'underline' }}
                >
                  {isSignUp ? 'Login' : 'Signup'}
                </button>
              </p>
            </div>

            <div className="auth-logo-header" style={{ marginBottom: '40px' }}>
              <YapLogo size={42} theme={theme} isDarkMode={isDarkMode} />
              <span style={{ fontWeight: '800', fontSize: '22px', letterSpacing: '-0.5px' }}>Yap Chat</span>
            </div>

            <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
            <p className="auth-subtitle">{isSignUp ? 'Start your journey with us' : 'Please login to your account'}</p>

            {error && <div style={{ color: 'var(--accent-pink)', fontSize: '12px', marginBottom: '16px', background: 'rgba(255,107,107,0.1)', padding: '8px', borderRadius: '8px' }}>{error}</div>}

            {isSignUp && (
              <div className="input-group">
                <label>Full Name</label>
                <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            )}

            <div className="input-group">
              <label>Email address</label>
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {!isSignUp && (
              <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                <a href="#" style={{ fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'none' }}>Forgot password?</a>
              </div>
            )}

            <button type="submit" className="login-btn">
              {isSignUp ? 'Sign Up' : 'Login'}
            </button>

            <div className="divider">
              <span>Or {isSignUp ? 'Sign Up' : 'Login'} with</span>
            </div>

            <div className="sso-buttons">
              <button type="button" className="sso-btn" onClick={handleGoogleSignIn}>
                <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" width="18" alt="Google" />
                Google
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container ${theme}`} style={{ overflow: 'auto' }}>
      {showOnboarding && (
        <ThemePicker
          onSelect={(t, mode) => { handleThemeSelection(t, mode); }}
          currentTheme={theme}
          themeMode={themeMode}
        />
      )}
      {showWidgetEditor && <WidgetEditor widgets={visibleWidgets} onToggle={toggleWidget} onClose={() => setShowWidgetEditor(false)} />}
      {showAvatarSelector && user && <AvatarSelector onSelect={handleAvatarSelect} onSkip={handleAvatarSkip} theme={theme} />}
      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}
      <div
        className={`main-layout animate-fade-in ${(activePage === 'contacts' || activePage === 'account' || activePage === 'notes' || activePage === 'settings') ? 'full-width-content' : ''}`}
        style={{
          gridTemplateColumns: (activePage === 'contacts' || activePage === 'account' || activePage === 'notes' || activePage === 'settings')
            ? `${leftWidth}px 1fr`
            : `${leftWidth}px 1fr ${rightWidth}px`
        }}
      >
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setActivePage('account')}>
              <img src={user.photoURL} alt="User" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--glass-border)', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, background: '#22c55e', borderRadius: '50%', border: '2px solid #fff' }}></div>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '600' }}>
              Hi, {user.displayName ? user.displayName.split(' ')[0] : (user.email ? user.email.split('@')[0] : 'there')}!
            </h2>
          </div>
          <div style={{ flex: 1, textAlign: 'center', opacity: 0.8, fontSize: '14px' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Search size={20} />
            <div style={{ position: 'relative' }}>
              <Bell size={20} />
              <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: 'var(--accent-pink)', borderRadius: '50%', border: '1px solid #fff' }}></div>
            </div>
            <div style={{ display: 'flex', gap: '6px', marginLeft: '10px' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ccc' }}></div>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffdb58' }}></div>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff6b6b' }}></div>
            </div>
          </div>
        </header>

        <ResizeHandle onMouseDown={() => setIsDraggingLeft(true)} style={{ left: leftWidth, top: 0 }} />
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} setActivePage={setActivePage} />

        <div className="content-container">
          {activePage === 'portal' ? (
            activeTab === 'chats' ? (
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                  <ChatPanel
                    selectedChat={selectedChat}
                    setSelectedChat={setSelectedChat}
                    chats={chats}
                    onCreateChat={() => { setActiveTab('contacts'); setActivePage('contacts'); }}
                    setActivePage={setActivePage}
                  />
                  <ChatWindow user={user} selectedChat={selectedChat} messages={messages} />
                </div>

                {/* Full Width Footer */}
                <div className="chat-footer-full">
                  <div className="input-container-full">
                    <Smile size={20} style={{ color: 'var(--text-secondary)' }} />
                    <input
                      type="text"
                      placeholder="Chat Away..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <Paperclip size={20} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
                      <Mic size={20} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
                      <button className="send-btn" onClick={handleSend} style={{ margin: 0 }}>
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'ai' ? (
              <AIChat />
            ) : (
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', color: 'var(--text-secondary)' }}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section Coming Soon
              </div>
            )
          ) : activePage === 'contacts' ? (
            <Contacts user={user} onMessage={handleMessageContact} />
          ) : activePage === 'account' ? (
            <Account user={user} onSignOut={handleSignOut} onClose={() => setActivePage('portal')} />
          ) : activePage === 'notes' ? (
            <NotesPage user={user} />
          ) : activePage === 'settings' ? (
            <SettingsPage
              user={user}
              theme={theme} setTheme={setTheme}
              themeMode={themeMode} setThemeMode={setThemeMode}
              onSignOut={handleSignOut}
              onClose={() => setActivePage('portal')}
            />
          ) : null}
        </div>

        {activePage === 'portal' && (
          <>
            <ResizeHandle onMouseDown={() => setIsDraggingRight(true)} style={{ right: rightWidth, top: 0 }} />
            <WidgetBar
              setTheme={setTheme}
              onOpenThemePicker={() => setShowOnboarding(true)}
              messageCount={messages.length}
              reminders={reminders}
              onAddReminder={addReminder}
              onToggleReminder={toggleReminder}
              onDeleteReminder={deleteReminder}
              visibleWidgets={visibleWidgets}
              onOpenWidgetEditor={() => setShowWidgetEditor(true)}
              notes={notes}
              setNotes={setNotes}
            />
          </>
        )}
      </div>
    </div >
  );
}

export default App;
