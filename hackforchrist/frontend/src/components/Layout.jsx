
import React, { useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children, activeTab, onTabChange, user, onLogout }) => {
    const tabs = ['Dashboard', 'Problems', 'Prioritization'];
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="h-screen flex flex-col overflow-auto md:overflow-hidden bg-app-bg text-text-main font-sans selection:bg-primary selection:text-white">
            {/* Top Navigation Bar */}
            <nav className="border-b border-border-muted bg-app-bg/80 backdrop-blur-md flex-shrink-0 z-50 sticky top-0 md:relative">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Title */}
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-gradient-to-br from-primary to-secondary rounded-md flex items-center justify-center shadow-lg shadow-primary/20">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary tracking-tight">
                                DevInsight
                            </h1>
                        </div>

                        {/* Desktop Tabs - Pill Design */}
                        <div className="hidden md:block">
                            <div className="flex items-center bg-card-bg/50 border border-border-muted p-1.5 rounded-full space-x-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => onTabChange(tab)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors relative outline-none focus-visible:ring-2 focus-visible:ring-primary ${activeTab === tab ? 'text-white' : 'text-text-muted hover:text-text-main'
                                            }`}
                                    >
                                        {activeTab === tab && (
                                            <motion.div
                                                layoutId="active-pill"
                                                className="absolute inset-0 bg-primary/20 border border-primary/50 shadow-[0_0_10px_rgba(var(--color-primary),0.3)] rounded-full"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        <span className="relative z-10">{tab}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* User Profile & Logout */}
                        <div className="hidden md:flex items-center gap-4">
                            {user && (
                                <div className="flex items-center gap-3 bg-card-bg py-1.5 px-3 rounded-full border border-border-muted">
                                    <img src={user.avatar} alt="User Avatar" className="w-6 h-6 rounded-full" />
                                    <span className="text-sm font-medium text-text-main">{user.name}</span>
                                </div>
                            )}
                            <button
                                onClick={onLogout}
                                className="p-2 text-text-muted hover:text-primary hover:bg-card-bg rounded-full transition-all"
                                title="Sign Out"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="-mr-2 flex md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="bg-card-bg inline-flex items-center justify-center p-2 rounded-md text-text-muted hover:text-primary hover:bg-slate-100 focus:outline-none ring-1 ring-border-muted"
                            >
                                <span className="sr-only">Open main menu</span>
                                {isMobileMenuOpen ? (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-border-muted bg-app-bg/95 backdrop-blur-xl overflow-hidden max-h-[80vh] overflow-y-auto"
                        >
                            <div className="px-4 py-4 space-y-4">
                                {/* Mobile Tabs */}
                                <div className="space-y-1">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => {
                                                onTabChange(tab);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium transition-colors ${activeTab === tab
                                                ? 'bg-primary/10 text-primary border border-primary/20'
                                                : 'text-text-muted hover:text-text-main hover:bg-white/5'
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                {/* Mobile User Section */}
                                <div className="pt-4 border-t border-border-muted">
                                    {user && (
                                        <div className="flex items-center px-3 mb-3">
                                            <div className="flex-shrink-0">
                                                <img className="h-10 w-10 rounded-full border border-border-muted" src={user.avatar} alt="" />
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-base font-medium leading-none text-text-main">{user.name}</div>
                                                <div className="text-sm font-medium leading-none text-text-muted mt-1">{user.email || 'user@example.com'}</div>
                                            </div>
                                        </div>
                                    )}
                                    <button
                                        onClick={onLogout}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-text-muted hover:text-primary hover:bg-white/5 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 overflow-visible md:overflow-hidden flex flex-col w-full px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex-1 min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>
            </main>

            {/* Subtle Background Glows (Neutral/Blue) */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
            </div>
        </div>
    );
};

export default Layout;
