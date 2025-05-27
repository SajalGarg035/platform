import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AuthSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { checkAuthStatus } = useAuth();

    useEffect(() => {
        const handleAuthSuccess = async () => {
            const token = searchParams.get('token');
            
            if (token) {
                localStorage.setItem('token', token);
                await checkAuthStatus();
                toast.success('Successfully logged in!');
                navigate('/');
            } else {
                toast.error('Authentication failed');
                navigate('/login');
            }
        };

        handleAuthSuccess();
    }, [searchParams, checkAuthStatus, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
};

export default AuthSuccess;
