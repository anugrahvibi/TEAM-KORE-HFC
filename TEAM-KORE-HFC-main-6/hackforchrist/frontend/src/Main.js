'use client';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
// Card imported but not used? It was in original file imports, I'll keep it.
import Card from './components/Card';
import Dashboard from './components/Dashboard';
import Problems from './components/Problems';
import Prioritization from './components/Prioritization';
import { Toaster } from 'sonner';

import Login from './components/Login';
import Register from './components/Register';

function MainApp() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [authView, setAuthView] = useState('login'); // 'login' or 'register'
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const auth = localStorage.getItem('isAuthenticated') === 'true';
        const savedUser = localStorage.getItem('user');
        if (auth) setIsAuthenticated(true);
        if (savedUser) setUser(JSON.parse(savedUser));
        setIsMounted(true);
    }, []);

    const handleLogin = (userData) => {
        setIsAuthenticated(true);
        setUser(userData);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const handleRegister = (userData) => {
        setIsAuthenticated(true);
        setUser(userData);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        setActiveTab('Dashboard'); // Reset tab
    };

    if (!isMounted) {
        return null; // Prevent hydration mismatch
    }

    if (!isAuthenticated) {
        if (authView === 'login') {
            return (
                <>
                    <Toaster position="top-right" theme="dark" />
                    <Login onLogin={handleLogin} onSwitchToRegister={() => setAuthView('register')} />
                </>
            );
        } else {
            return (
                <>
                    <Toaster position="top-right" theme="dark" />
                    <Register onRegister={handleRegister} onSwitchToLogin={() => setAuthView('login')} />
                </>
            );
        }
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'Dashboard':
                return <Dashboard />;

            case 'Problems':
                return <Problems />;

            case 'Prioritization':
                return <Prioritization />;


            default:
                return null;
        }
    };

    return (
        <Layout activeTab={activeTab} onTabChange={setActiveTab} user={user} onLogout={handleLogout}>
            <Toaster
                position="top-right"
                theme="dark"
                toastOptions={{
                    style: {
                        background: '#0F1115',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontFamily: 'inherit',
                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(10px)',
                    },
                    classNames: {
                        toast: 'group',
                        title: 'font-bold text-sm',
                        description: 'text-xs text-gray-400',
                        actionButton: 'bg-blue-600 text-white font-bold text-xs px-3 py-1.5 rounded hover:bg-blue-500 transition-colors',
                        cancelButton: 'bg-transparent text-gray-400 hover:text-white font-bold text-xs px-3 py-1.5 transition-colors',
                        error: 'border-red-500/50 bg-[#0F1115]',
                        success: 'border-emerald-500/50 bg-[#0F1115]',
                        warning: 'border-amber-500/50 bg-[#0F1115]',
                        info: 'border-blue-500/50 bg-[#0F1115]',
                    }
                }}
            />
            {renderContent()}
        </Layout>
    );
}

export default MainApp;
