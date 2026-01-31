
import React, { useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import { Info, X } from 'lucide-react';

const Layout = ({ children, activeTab, onTabChange, user, onLogout }) => {
    const tabs = ['Dashboard', 'Problems', 'Prioritization'];
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    return (
        <div className="h-screen flex flex-col overflow-auto md:overflow-hidden bg-app-bg text-text-main font-sans selection:bg-primary selection:text-white">
            {/* Top Navigation Bar */}
            <nav className="border-b border-border-muted bg-app-bg/80 backdrop-blur-md flex-shrink-0 z-50 sticky top-0 md:relative">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Title */}
                        <div className="flex items-center">
                            <h1 className="text-2xl font-black text-white tracking-tighter">
                                SENTINAL
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
                            {/* Info Trigger */}
                            <button
                                onClick={() => setIsInfoOpen(true)}
                                className="p-2 text-text-muted hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-all group"
                                title="Platform Intelligence"
                            >
                                <Info size={20} className="group-hover:animate-pulse" />
                            </button>

                            {user && (
                                <div className="flex items-center gap-3 bg-card-bg py-1.5 px-3 rounded-full border border-border-muted">
                                    <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-600/30">
                                        {user.full_name ? user.full_name.charAt(0) : 'U'}
                                    </div>
                                    <span className="text-sm font-medium text-text-main">{user.full_name || 'User'}</span>
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
                                                <div className="text-base font-medium leading-none text-text-main">{user.full_name}</div>
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

            {/* Platform Intelligence Modal */}
            <AnimatePresence>
                {isInfoOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#0F1115] border border-blue-500/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col"
                        >
                            <button
                                onClick={() => setIsInfoOpen(false)}
                                className="absolute top-6 right-6 z-50 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="flex-1 overflow-y-auto p-8 sm:p-12 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                {/* Header / The Hook */}
                                <div className="mb-12 border-b border-white/5 pb-8">
                                    <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
                                        Predictive Immunity
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                        Cloud systems don’t fail suddenly. <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                            They slowly burn money.
                                        </span>
                                    </h2>
                                    <p className="text-lg text-text-muted max-w-2xl leading-relaxed">
                                        Every minute of degraded performance costs thousands in wasted compute and user churn—long before an outage ever happens. What if you knew earlier?
                                    </p>
                                </div>

                                {/* Phase 1 & 2: The Problem & Insight */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                                    <div>
                                        <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3">The Problem: Alert Fatigue</h3>
                                        <p className="text-text-muted mb-4 leading-relaxed">
                                            It’s 3:00 AM. 500 alerts. 50 microservices. Use your six-figure engineers as <strong>"Smart Monkeys"</strong> connecting dots between random deployments and CPU spikes.
                                        </p>
                                        <p className="text-text-muted leading-relaxed">
                                            While they play forensic investigator, the CFO is watching millions evaporate. This is the reality for most cloud companies in 2026.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3">The Insight: Beyond Reactive</h3>
                                        <p className="text-text-muted mb-4 leading-relaxed">
                                            Dynatrace and Datadog are exceptional at telling you <em>what</em> broke. They see the smoke.
                                        </p>
                                        <p className="text-white font-medium leading-relaxed border-l-2 border-white/20 pl-4">
                                            "But none of them tell you how much money was lost while you were figuring it out — or how much you’re about to lose next."
                                        </p>
                                    </div>
                                </div>

                                {/* Phase 3: The Triple-Threat Solution */}
                                <div className="mb-16">
                                    <h3 className="text-2xl font-bold text-white mb-8">The Solution: Decision Intelligence Layer</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-6 rounded-xl bg-card-bg border border-border-muted hover:border-blue-500/30 transition-all">
                                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
                                                <Info size={20} />
                                            </div>
                                            <h4 className="text-lg font-bold text-white mb-2">Signal Intelligence</h4>
                                            <p className="text-sm text-text-muted">
                                                We cut 1,000 alerts down to the 5 that actually matter—ranked by <span className="text-white">business impact</span>.
                                            </p>
                                        </div>

                                        <div className="p-6 rounded-xl bg-card-bg border border-border-muted hover:border-purple-500/30 transition-all">
                                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-lg font-bold text-white mb-2">Change Correlation</h4>
                                            <p className="text-sm text-text-muted">
                                                We automatically link deployments to performance drops and cost spikes <span className="text-white">within minutes</span>.
                                            </p>
                                        </div>

                                        <div className="p-6 rounded-xl bg-gradient-to-b from-card-bg to-amber-900/10 border border-amber-500/20 hover:border-amber-500/40 transition-all relative overflow-hidden">
                                            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                                Predictive Blast <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.5 rounded font-bold uppercase">Gold</span>
                                            </h4>
                                            <p className="text-sm text-text-muted">
                                                Our edge. We stop the domino effect before the first tile hits the floor.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Phase 5: The Product Play */}
                                <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
                                    <h3 className="text-xl font-bold text-white mb-4">The Product Play</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-text-muted mb-4 leading-relaxed">
                                                We’re not building a better monitoring tool — we’re creating a new category: <strong>Predictive Immunity</strong>.
                                            </p>
                                            <p className="text-text-muted leading-relaxed">
                                                Our users are engineers, but our buyers are engineering leaders accountable for uptime <em>and</em> cloud cost.
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-text-muted mb-4 leading-relaxed">
                                                We didn't build this to show off ML models. We built it because engineers deserve to sleep.
                                            </p>
                                            <div className="pt-4 border-t border-white/10 mt-4">
                                                <p className="text-lg text-white font-medium italic">
                                                    "This isn’t observability as a dashboard. <br /> It’s reliability as a product."
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto flex flex-col w-full px-4 sm:px-6 lg:px-8 py-6 scrollbar-thin scrollbar-thumb-border-muted scrollbar-track-transparent">
                <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
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
