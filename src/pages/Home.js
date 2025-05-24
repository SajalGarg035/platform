import React, { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { FiGithub, FiCode, FiUsers, FiZap, FiShield, FiGlobe, FiArrowRight, FiPlay, FiStar } from 'react-icons/fi';
import { useRecoilState } from 'recoil';
import { darkMode } from '../atoms';

const Home = () => {
    const navigate = useNavigate();
    const [isDark, setIsDark] = useRecoilState(darkMode);
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const [showJoinModal, setShowJoinModal] = useState(false);

    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        setShowJoinModal(true);
        toast.success('New room created! Enter your username to join.');
    };

    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error('Room ID & username are required');
            return;
        }
        navigate(`/editor/${roomId}`, {
            state: { username },
        });
    };

    const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
            joinRoom();
        }
    };

    const features = [
        {
            icon: FiCode,
            title: 'Real-time Collaboration',
            description: 'Code together with your team in real-time with instant synchronization across all devices.'
        },
        {
            icon: FiZap,
            title: 'Lightning Performance',
            description: 'Optimized for speed with intelligent caching and minimal latency for seamless coding.'
        },
        {
            icon: FiShield,
            title: 'Enterprise Security',
            description: 'Bank-level encryption and security protocols to protect your intellectual property.'
        },
        {
            icon: FiGlobe,
            title: 'Global Infrastructure',
            description: 'Distributed servers worldwide ensuring 99.9% uptime and optimal performance.'
        }
    ];

    return (
        <div className={`enterprise-landing ${isDark ? 'dark' : ''}`}>
            {/* Navigation Header */}
            <nav className="enterprise-nav">
                <div className="nav-container">
                    <div className="nav-brand">
                        <div className="brand-icon">
                            <FiCode size={24} />
                        </div>
                        <span className="brand-text">CodeSync Pro</span>
                        <span className="enterprise-badge">Enterprise</span>
                    </div>
                    
                    <div className="nav-actions">
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="theme-toggle"
                            aria-label="Toggle theme"
                        >
                            {isDark ? '☀️' : '🌙'}
                        </button>
                        <a 
                            href="https://github.com/sajalgarg035" 
                            className="nav-link"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FiGithub size={20} />
                            <span>GitHub</span>
                        </a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <FiStar size={16} />
                            <span>Enterprise-Grade Development Platform</span>
                        </div>
                        
                        <h1 className="hero-title">
                            Code <span className="gradient-text">Together</span>
                            <br />Build <span className="gradient-text">Faster</span>
                        </h1>
                        
                        <p className="hero-description">
                            Transform your development workflow with our enterprise-grade collaborative 
                            code editor. Built for teams that demand excellence, security, and performance.
                        </p>

                        <div className="hero-actions">
                            <button 
                                onClick={createNewRoom}
                                className="cta-primary"
                            >
                                <FiPlay size={18} />
                                <span>Start Coding</span>
                            </button>
                            
                            <button 
                                onClick={() => setShowJoinModal(true)}
                                className="cta-secondary"
                            >
                                <FiUsers size={18} />
                                <span>Join Room</span>
                            </button>
                        </div>

                        <div className="social-proof">
                            <div className="proof-item">
                                <span className="proof-number">10K+</span>
                                <span className="proof-label">Developers</span>
                            </div>
                            <div className="proof-item">
                                <span className="proof-number">500+</span>
                                <span className="proof-label">Companies</span>
                            </div>
                            <div className="proof-item">
                                <span className="proof-number">99.9%</span>
                                <span className="proof-label">Uptime</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="hero-visual">
                        <div className="code-preview">
                            <div className="code-header">
                                <div className="code-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <span className="code-title">main.js</span>
                            </div>
                            <div className="code-content">
                                <div className="code-line">
                                    <span className="line-number">1</span>
                                    <span className="code-text">
                                        <span className="keyword">const</span>{' '}
                                        <span className="variable">collaborate</span>{' '}
                                        <span className="operator">=</span>{' '}
                                        <span className="string">"seamlessly"</span>
                                    </span>
                                </div>
                                <div className="code-line">
                                    <span className="line-number">2</span>
                                    <span className="code-text">
                                        <span className="keyword">const</span>{' '}
                                        <span className="variable">team</span>{' '}
                                        <span className="operator">=</span>{' '}
                                        <span className="function">buildAmazing</span>
                                        <span className="punctuation">()</span>
                                    </span>
                                </div>
                                <div className="code-line">
                                    <span className="line-number">3</span>
                                    <span className="code-text">
                                        <span className="comment">// Built by sajalgarg035</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">Enterprise-Grade Features</h2>
                        <p className="section-description">
                            Built with the same standards as Google, Microsoft, and other tech giants
                        </p>
                    </div>
                    
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card">
                                <div className="feature-icon">
                                    <feature.icon size={24} />
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                                <div className="feature-arrow">
                                    <FiArrowRight size={16} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Join Modal */}
            {showJoinModal && (
                <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Join Coding Room</h3>
                            <button 
                                className="modal-close"
                                onClick={() => setShowJoinModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="input-group">
                                <label className="input-label">Room ID</label>
                                <input
                                    type="text"
                                    className="enterprise-input"
                                    placeholder="Enter room ID or create new"
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    onKeyUp={handleInputEnter}
                                />
                            </div>
                            
                            <div className="input-group">
                                <label className="input-label">Username</label>
                                <input
                                    type="text"
                                    className="enterprise-input"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onKeyUp={handleInputEnter}
                                />
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button 
                                onClick={() => setShowJoinModal(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={joinRoom}
                                className="btn-primary"
                                disabled={!roomId || !username}
                            >
                                Join Room
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="enterprise-footer">
                <div className="footer-container">
                    <div className="footer-brand">
                        <div className="brand-icon">
                            <FiCode size={20} />
                        </div>
                        <span>CodeSync Pro</span>
                    </div>
                    
                    <div className="footer-links">
                        <a href="https://github.com/sajalgarg035">GitHub</a>
                        <a href="mailto:sajalgarg035@gmail.com">Contact</a>
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                    </div>
                    
                    <div className="footer-copyright">
                        © 2024 CodeSync Pro by sajalgarg035. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;