
import React from 'react';

const Layout = ({ children, activeTab, onTabChange, user, onLogout }) => {
    const tabs = ['Engineer View', 'Executive View', 'Blast Radius Predictor'];

    return (
        <div className="min-h-screen bg-app-bg text-text-main font-sans selection:bg-primary selection:text-white">
            {/* Top Navigation Bar */}
            <nav className="border-b border-border-muted bg-app-bg/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

                        {/* Desktop Tabs */}
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => onTabChange(tab)}
                                        className={`px - 4 py - 2 rounded - md text - sm font - medium transition - all duration - 300 relative group ${activeTab === tab
                                            ? 'text-primary font-bold'
                                            : 'text-text-muted hover:text-text-main'
                                            } `}
                                    >
                                        {activeTab === tab && (
                                            <span className="absolute inset-0 bg-primary/10 rounded-md ring-1 ring-primary/50 shadow-[0_0_15px_rgba(var(--color-primary),0.3)] pointer-events-none" />
                                        )}
                                        <span className="relative z-10">{tab}</span>
                                        {/* Hover glow effect for non-active tabs */}
                                        {activeTab !== tab && (
                                            <span className="absolute inset-0 rounded-md bg-card-bg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                                        )}
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
                            <button className="bg-card-bg inline-flex items-center justify-center p-2 rounded-md text-text-muted hover:text-primary hover:bg-slate-100 focus:outline-none ring-1 ring-border-muted">
                                <span className="sr-only">Open main menu</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>
            </main>

            {/* Background decoration */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl" />
            </div>
        </div>
    );
};

export default Layout;
