import { useState } from 'react';
import Layout from './components/Layout';
import Card from './components/Card';
import Dashboard from './components/Dashboard';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import BlastRadius from './components/BlastRadius';
import { Toaster } from 'sonner';

import Login from './components/Login';
import Register from './components/Register';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [activeTab, setActiveTab] = useState('Engineer View');

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

      case 'Executive View':
        return <ExecutiveDashboard />;

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

export default App;
