'use client';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
// Card imported but not used? It was in original file imports, I'll keep it.
import Card from './components/Card';
import Dashboard from './components/Dashboard';
import Problems from './components/Problems';
import Prioritization from './components/Prioritization';
import BlastRadius from './components/BlastRadius';
import { Toaster } from 'sonner';

import Login from './components/Login';
import Register from './components/Register';

function MainApp() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [authView, setAuthView] = useState('login'); // 'login' or 'register'
    const [activeTab, setActiveTab] = useState('Engineer View');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const auth = localStorage.getItem('isAuthenticated') === 'true';
        const savedUser = localStorage.getItem('user');
        if (auth) setIsAuthenticated(true);
        if (savedUser) setUser(JSON.parse(savedUser));
        setIsMounted(true);
    }, []);

    const handleLogin = (email) => {
        const mockUser = {
            name: email.split('@')[0],
            email: email,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        };
        setIsAuthenticated(true);
        setUser(mockUser);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(mockUser));
    };

    const handleRegister = (email) => {
        const mockUser = {
            name: email.split('@')[0],
            email: email,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        };
        setIsAuthenticated(true);
        setUser(mockUser);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(mockUser));
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        setActiveTab('Engineer View'); // Reset tab
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
            case 'Engineer View':
                return <Dashboard />;

            case 'Problems':
                return <Problems />;

            case 'Prioritization':
                return <Prioritization />;

            case 'Blast Radius Predictor':
                return <BlastRadius />;

            default:
                return null;
        }
    };

    return (
        <Layout activeTab={activeTab} onTabChange={setActiveTab} user={user} onLogout={handleLogout}>
            <Toaster position="top-right" theme="dark" />
            {renderContent()}
        </Layout>
    );
}

export default MainApp;
