import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    FiMail, FiLock, FiEye, FiEyeOff, FiGithub, FiCode, 
    FiZap, FiUsers, FiShield 
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(formData.email, formData.password);
        
        if (result.success) {
            toast.success('Welcome back!');
            navigate('/');
        } else {
            toast.error(result.error);
        }
        
        setLoading(false);
    };

    const handleOAuthLogin = (provider) => {
<<<<<<< HEAD
        window.location.href = `${process.env.REACT_APP_BACKEND_URL || 'http://72.145.9.233:5000'}/auth/${provider}`;
=======
        window.location.href = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/auth/${provider}`;
>>>>>>> 82e6ba34d077ad6512d297adb8612f380b576110
    };

    return (
        <div className="auth-container">
            {/* Floating Background Shapes */}
            <div className="floating-shapes">
                <div className="shape"></div>
                <div className="shape"></div>
                <div className="shape"></div>
                <div className="shape"></div>
            </div>

            <div className="auth-content">
                <div className="auth-card">
                    {/* Enhanced Header */}
                    <div className="auth-header">
                        <div className="auth-logo">
                            <FiCode size={32} />
                        </div>
                        <h1 className="auth-title">Welcome back</h1>
                        <p className="auth-subtitle">
                            Sign in to continue your coding journey
                        </p>
                    </div>

                    {/* OAuth Section */}
                    <div className="oauth-section">
                        <button
                            onClick={() => handleOAuthLogin('google')}
                            className="oauth-button"
                        >
                            <FcGoogle size={20} />
                            Continue with Google
                        </button>
                        
                        <button
                            onClick={() => handleOAuthLogin('github')}
                            className="oauth-button"
                        >
                            <FiGithub size={20} />
                            Continue with GitHub
                        </button>
                    </div>

                    {/* Enhanced Divider */}
                    <div className="divider">
                        <span>Or continue with email</span>
                    </div>

                    {/* Enhanced Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                Email address
                            </label>
                            <div className="input-wrapper">
                                <FiMail className="input-icon" size={18} />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <div className="input-wrapper">
                                <FiLock className="input-icon" size={18} />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-footer">
                            <Link to="/forgot-password" className="forgot-link">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="submit-button"
                        >
                            {loading ? (
                                <div className="loading-spinner">
                                    <div className="spinner"></div>
                                    Signing in...
                                </div>
                            ) : (
                                'Sign in'
                            )}
                        </button>

                        <div className="auth-footer">
                            Don't have an account?{' '}
                            <Link to="/signup" className="auth-link">
                                Sign up for free
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            {/* Features Preview */}
            <div className="features-preview">
                <div className="feature-item">
                    <div className="feature-icon">
                        <FiZap size={16} />
                    </div>
                    <div className="feature-text">Real-time Collaboration</div>
                </div>
                <div className="feature-item">
                    <div className="feature-icon">
                        <FiUsers size={16} />
                    </div>
                    <div className="feature-text">Team Workspaces</div>
                </div>
                <div className="feature-item">
                    <div className="feature-icon">
                        <FiShield size={16} />
                    </div>
                    <div className="feature-text">Secure & Private</div>
                </div>
            </div>
        </div>
    );
};

export default Login;
