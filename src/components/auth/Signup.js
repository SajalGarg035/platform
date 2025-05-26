import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    FiMail, FiLock, FiEye, FiEyeOff, FiGithub, FiCode, 
    FiUser, FiCheck, FiX, FiZap, FiUsers, FiShield 
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import './Login.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Calculate password strength
        if (name === 'password') {
            setPasswordStrength(calculatePasswordStrength(value));
        }
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[a-z]/.test(password)) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 15;
        if (/[^A-Za-z0-9]/.test(password)) strength += 10;
        return Math.min(strength, 100);
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength < 30) return '#ef4444';
        if (passwordStrength < 60) return '#f59e0b';
        if (passwordStrength < 80) return '#3b82f6';
        return '#10b981';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength < 30) return 'Weak';
        if (passwordStrength < 60) return 'Fair';
        if (passwordStrength < 80) return 'Good';
        return 'Strong';
    };

    const validateForm = () => {
        if (!formData.username.trim()) {
            toast.error('Username is required');
            return false;
        }
        if (formData.username.length < 3) {
            toast.error('Username must be at least 3 characters long');
            return false;
        }
        if (!formData.email.trim()) {
            toast.error('Email is required');
            return false;
        }
        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setLoading(true);

        const result = await signup(
            formData.username,
            formData.email,
            formData.password
        );
        
        if (result.success) {
            toast.success('Account created successfully! Welcome to CodeSync Pro!');
            navigate('/');
        } else {
            toast.error(result.error);
        }
        
        setLoading(false);
    };

    const handleOAuthLogin = (provider) => {

        window.location.href = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/auth/${provider}`;

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
                        <h1 className="auth-title">Join CodeSync Pro</h1>
                        <p className="auth-subtitle">
                            Create your account and start collaborating
                        </p>
                    </div>

                    {/* OAuth Section */}
                    <div className="oauth-section">
                        <button
                            onClick={() => handleOAuthLogin('google')}
                            className="oauth-button"
                        >
                            <FcGoogle size={20} />
                            Sign up with Google
                        </button>
                        
                        <button
                            onClick={() => handleOAuthLogin('github')}
                            className="oauth-button"
                        >
                            <FiGithub size={20} />
                            Sign up with GitHub
                        </button>
                    </div>

                    {/* Enhanced Divider */}
                    <div className="divider">
                        <span>Or create account with email</span>
                    </div>

                    {/* Enhanced Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username" className="form-label">
                                Username
                            </label>
                            <div className="input-wrapper">
                                <FiUser className="input-icon" size={18} />
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Choose a username"
                                />
                                {formData.username.length >= 3 && (
                                    <FiCheck className="password-toggle" style={{color: '#10b981'}} size={18} />
                                )}
                            </div>
                        </div>

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
                                    placeholder="Create a strong password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                            {formData.password && (
                                <div className="password-strength">
                                    <div className="strength-bar">
                                        <div 
                                            className="strength-fill"
                                            style={{
                                                width: `${passwordStrength}%`,
                                                backgroundColor: getPasswordStrengthColor()
                                            }}
                                        ></div>
                                    </div>
                                    <span 
                                        className="strength-text"
                                        style={{ color: getPasswordStrengthColor() }}
                                    >
                                        {getPasswordStrengthText()}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">
                                Confirm Password
                            </label>
                            <div className="input-wrapper">
                                <FiLock className="input-icon" size={18} />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Confirm your password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                                {formData.confirmPassword && (
                                    formData.password === formData.confirmPassword ? (
                                        <FiCheck className="password-toggle" style={{color: '#10b981', right: '3rem'}} size={18} />
                                    ) : (
                                        <FiX className="password-toggle" style={{color: '#ef4444', right: '3rem'}} size={18} />
                                    )
                                )}
                            </div>
                        </div>

                        <div className="terms-section" style={{marginBottom: '1.5rem'}}>
                            <p style={{fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5'}}>
                                By creating an account, you agree to our{' '}
                                <Link to="/terms" className="auth-link">Terms of Service</Link>
                                {' '}and{' '}
                                <Link to="/privacy" className="auth-link">Privacy Policy</Link>
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="submit-button"
                        >
                            {loading ? (
                                <div className="loading-spinner">
                                    <div className="spinner"></div>
                                    Creating account...
                                </div>
                            ) : (
                                'Create account'
                            )}
                        </button>

                        <div className="auth-footer">
                            Already have an account?{' '}
                            <Link to="/login" className="auth-link">
                                Sign in instead
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

export default Signup;
