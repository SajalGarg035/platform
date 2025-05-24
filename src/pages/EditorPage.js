import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import Client from '../components/Client';
import Editor from '../components/Editor';
import Chat from '../components/Chat';
import CodeOutput from '../components/CodeOutput';
import { language, cmtheme, darkMode } from '../atoms';
import { useRecoilState } from 'recoil';
import ACTIONS from '../actions/Actions';
import { initSocket } from '../socket';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import { 
    FiCopy, FiLogOut, FiMoon, FiSun, FiCode, FiUsers, FiMessageSquare, 
    FiPlay, FiSettings, FiMaximize2, FiMinimize2, FiGitBranch, FiSave 
} from 'react-icons/fi';

const EditorPage = () => {
    const [lang, setLang] = useRecoilState(language);
    const [them, setThem] = useRecoilState(cmtheme);
    const [isDark, setIsDark] = useRecoilState(darkMode);
    const [activeTab, setActiveTab] = useState('editor');
    const [clients, setClients] = useState([]);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const { roomId } = useParams();
    const reactNavigator = useNavigate();

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Connection failed. Attempting to reconnect...');
                reactNavigator('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username,
            });

            socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
                if (username !== location.state?.username) {
                    toast.success(`${username} joined the session`);
                }
                setClients(clients);
                socketRef.current.emit(ACTIONS.SYNC_CODE, {
                    code: codeRef.current,
                    socketId,
                });
            });

            socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
                toast.error(`${username} left the session`);
                setClients((prev) => prev.filter((client) => client.socketId !== socketId));
            });
        };
        init();
        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    const copyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID copied to clipboard');
        } catch (err) {
            toast.error('Failed to copy Room ID');
        }
    };

    const leaveRoom = () => {
        if (window.confirm('Are you sure you want to leave the session?')) {
            reactNavigator('/');
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    if (!location.state) {
        return <Navigate to="/" />;
    }

    const tabs = [
        { id: 'editor', label: 'Code Editor', icon: FiCode },
        { id: 'output', label: 'Output', icon: FiPlay },
        { id: 'chat', label: 'Team Chat', icon: FiMessageSquare }
    ];

    return (
        <div className={`ide-container ${isDark ? 'dark' : ''}`}>
            {/* Top Menu Bar */}
            <div className="ide-menubar">
                <div className="menubar-left">
                    <div className="ide-logo">
                        <FiCode size={20} />
                        <span>CodeSync Pro</span>
                        <span className="session-indicator">
                            <span className="status-dot"></span>
                            Live Session
                        </span>
                    </div>
                </div>
                
                <div className="menubar-center">
                    <div className="breadcrumb">
                        <span className="breadcrumb-item">Room: {roomId.slice(0, 8)}...</span>
                        <span className="breadcrumb-separator">/</span>
                        <span className="breadcrumb-item">{location.state?.username}</span>
                    </div>
                </div>
                
                <div className="menubar-right">
                    <button 
                        className="menu-action"
                        onClick={() => setIsDark(!isDark)}
                        title="Toggle theme"
                    >
                        {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
                    </button>
                    
                    <button 
                        className="menu-action"
                        onClick={toggleFullscreen}
                        title="Toggle fullscreen"
                    >
                        {isFullscreen ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
                    </button>
                    
                    <button 
                        className="menu-action"
                        onClick={copyRoomId}
                        title="Copy room ID"
                    >
                        <FiCopy size={16} />
                    </button>
                    
                    <button 
                        className="menu-action danger"
                        onClick={leaveRoom}
                        title="Leave session"
                    >
                        <FiLogOut size={16} />
                    </button>
                </div>
            </div>

            <div className="ide-workspace">
                {/* Sidebar */}
                <div className={`ide-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                    <div className="sidebar-header">
                        <button 
                            className="sidebar-toggle"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        >
                            <FiUsers size={16} />
                        </button>
                        {!sidebarCollapsed && (
                            <span className="sidebar-title">
                                Collaborators ({clients.length})
                            </span>
                        )}
                    </div>
                    
                    {!sidebarCollapsed && (
                        <>
                            <div className="collaborators-section">
                                <div className="collaborators-list">
                                    {clients.map((client) => (
                                        <Client key={client.socketId} username={client.username} />
                                    ))}
                                </div>
                            </div>

                            <div className="sidebar-controls">
                                <div className="control-group">
                                    <label className="control-label">
                                        <FiCode size={14} />
                                        Language
                                    </label>
                                    <select
                                        value={lang}
                                        onChange={(e) => setLang(e.target.value)}
                                        className="enterprise-select"
                                    >
                                        <option value="javascript">JavaScript</option>
                                        <option value="python">Python</option>
                                        <option value="java">Java</option>
                                        <option value="cpp">C++</option>
                                        <option value="go">Go</option>
                                        <option value="rust">Rust</option>
                                        <option value="typescript">TypeScript</option>
                                    </select>
                                </div>

                                <div className="control-group">
                                    <label className="control-label">
                                        <FiSettings size={14} />
                                        Theme
                                    </label>
                                    <select
                                        value={them}
                                        onChange={(e) => setThem(e.target.value)}
                                        className="enterprise-select"
                                    >
                                        <option value="monokai">Monokai Pro</option>
                                        <option value="dracula">Dracula</option>
                                        <option value="github">GitHub Light</option>
                                        <option value="material">Material Dark</option>
                                        <option value="nord">Nord</option>
                                        <option value="solarized">Solarized</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Main Content */}
                <div className="ide-main">
                    {/* Tab Bar */}
                    <div className="ide-tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                            >
                                <tab.icon size={16} />
                                <span>{tab.label}</span>
                                {tab.id === 'chat' && (
                                    <span className="notification-badge">3</span>
                                )}
                            </button>
                        ))}
                        
                        <div className="tab-actions">
                            <button className="tab-action" title="Save file">
                                <FiSave size={14} />
                            </button>
                            <button className="tab-action" title="Git branch">
                                <FiGitBranch size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="content-area">
                        {activeTab === 'editor' && (
                            <div className="editor-panel">
                                <Editor
                                    socketRef={socketRef}
                                    roomId={roomId}
                                    onCodeChange={(code) => {
                                        codeRef.current = code;
                                    }}
                                />
                            </div>
                        )}
                        
                        {activeTab === 'output' && (
                            <CodeOutput
                                socketRef={socketRef}
                                roomId={roomId}
                                code={codeRef.current}
                                language={lang}
                                username={location.state?.username}
                            />
                        )}
                        
                        {activeTab === 'chat' && (
                            <Chat
                                socketRef={socketRef}
                                roomId={roomId}
                                username={location.state?.username}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="ide-statusbar">
                <div className="status-left">
                    <span className="status-item">
                        <span className="status-dot online"></span>
                        Connected
                    </span>
                    <span className="status-item">
                        {lang.toUpperCase()}
                    </span>
                    <span className="status-item">
                        UTF-8
                    </span>
                </div>
                
                <div className="status-right">
                    <span className="status-item">
                        Line 1, Column 1
                    </span>
                    <span className="status-item">
                        Spaces: 2
                    </span>
                    <span className="status-item">
                        {clients.length} collaborator{clients.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default EditorPage;