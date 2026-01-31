
import React, { useState } from 'react';
import { apiClient } from '../utils/api';
import { toast } from 'sonner';

const Login = ({ onLogin, onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            toast.loading('Signing in...', { id: 'login' });

            const user = await apiClient.login({
                email: email,
                password: password
            });

            toast.success('Login successful!', {
                id: 'login',
                description: `Welcome back, ${user.full_name}!`,
            });

            onLogin(user);
        } catch (error) {
            toast.error('Login failed', {
                id: 'login',
                description: error.message || 'Invalid email or password',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl mix-blend-screen pointer-events-none animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl mix-blend-screen pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-8 shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">SENTINAL</h1>
                    <p className="text-slate-400">Secure Architecture Intelligence</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                            placeholder="admin@sentinal.io"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600/90 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Authenticating...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>


                </form>

                <div className="mt-6 text-center">
                    <p className="text-slate-400 text-sm">
                        Don't have an account?{' '}
                        <button
                            onClick={onSwitchToRegister}
                            className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                        >
                            Create Account
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
