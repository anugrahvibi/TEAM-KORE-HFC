import React, { useState } from 'react';
import {
    X, Sparkles, Send, MoreVertical, Monitor, Server, Database,
    Globe, Activity, AlertOctagon, Terminal, FileText, Settings,
    Cpu, Network, GitBranch, Layers
} from 'lucide-react';

const ProblemDetail = ({ problem, onBack }) => {
    const [activeTab, setActiveTab] = useState('Overview');

    // Theme vars mapped to Tailwind classes for consistency
    const currentTheme = {
        bg: 'bg-app-bg',
        card: 'bg-card-bg',
        text: 'text-text-main',
        muted: 'text-text-muted',
        border: 'border-border-muted',
    };

    const tabs = ['Overview', 'Deployment', 'Events', 'Logs', 'Troubleshooting'];

    return (
        <div className="h-full flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300 text-text-main">
            {/* Header Section */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            {problem?.name || 'Cisco Memory Free critical low'}
                        </h1>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="flex items-center gap-1 text-red-500 font-semibold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                                <AlertOctagon size={12} /> Active
                            </span>
                            <span className="font-mono text-text-muted">P-2601869</span>
                            <span className="px-1.5 py-0.5 rounded border border-border-muted bg-white/5 text-xs text-text-muted">Custom</span>
                            <span className="text-text-muted">Started at {problem?.started || 'Jan 15, 2026, 9:32 PM'} for {problem?.duration || '2 w 1 d'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded bg-white/5 hover:bg-white/10 border border-border-muted transition-colors">
                            <Sparkles size={14} className="text-blue-400" />
                            Explain problem
                        </button>
                        <div className="relative flex items-center">
                            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-l bg-card-bg hover:bg-white/5 border border-border-muted transition-colors">
                                Send
                            </button>
                            <button className="px-2 py-1.5 text-sm font-medium rounded-r bg-card-bg hover:bg-white/5 border-t border-r border-b border-border-muted border-l-0 transition-colors">
                                <ChevronDownIcon />
                            </button>
                        </div>
                        <button onClick={onBack} className="p-2 rounded hover:bg-white/10 transition-colors text-text-muted hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Context Cards Row */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                    {['Affected frontends', 'Affected services', 'Affected infrastructure', 'Affected synthetic', 'Potentially affected', 'Events'].map((label, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-card-bg border border-border-muted flex flex-col justify-between h-20">
                            <span className="text-xs text-text-muted font-medium truncate">{label}</span>
                            <div className="flex justify-between items-end">
                                <span className="text-lg font-bold text-white">{idx === 5 ? '10' : '-'}</span>
                                {idx === 5 && <button className="p-1 hover:bg-white/10 rounded"><MoreVertical size={14} className="text-text-muted" /></button>}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-6 border-b border-border-muted pt-2">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                                ? 'text-primary border-primary'
                                : 'text-text-muted border-transparent hover:text-text-main'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">

                {/* Left Column: Impact */}
                <div className="p-4 rounded-lg bg-card-bg border border-border-muted flex flex-col">
                    <div className="flex items-center gap-2 mb-4 text-white font-semibold">
                        <Monitor size={16} />
                        Impact
                    </div>

                    {/* Inner Tabs */}
                    <div className="flex gap-4 border-b border-border-muted mb-4 text-xs font-medium text-text-muted">
                        {['Frontends', 'Services', 'Infrastructure', 'Synthetic monitors', 'Environment'].map((t, i) => (
                            <span key={t} className={`pb-2 cursor-pointer ${i === 4 ? 'text-primary border-b-2 border-primary' : 'hover:text-text-main'}`}>{t}</span>
                        ))}
                    </div>

                    <div className="flex-1 rounded border border-border-muted bg-app-bg/50 p-2 overflow-y-auto">
                        <div className="p-2 space-y-2">
                            <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded group cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Globe size={16} className="text-text-muted" />
                                    <div className="flex flex-col">
                                        <span className="text-sm text-text-main font-medium">Dynatrace Playground</span>
                                        <span className="text-xs text-text-muted">Environment</span>
                                    </div>
                                </div>
                                <MoreVertical size={14} className="text-text-muted opacity-0 group-hover:opacity-100" />
                            </div>

                            <div className="pl-6">
                                <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded group cursor-pointer border-l border-border-muted ml-3">
                                    <div className="flex items-center gap-3 pl-2">
                                        <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] uppercase text-text-muted font-bold">Custom</span>
                                        <span className="text-sm text-text-main">Cisco Memory Free critical low</span>
                                    </div>
                                    <MoreVertical size={14} className="text-text-muted opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Root Cause & Visual Resolution Path */}
                <div className="flex flex-col gap-4 h-full">

                    {/* Root Cause Card */}
                    <div className="p-4 rounded-lg bg-card-bg border border-border-muted h-1/2 flex flex-col">
                        <div className="flex items-center gap-2 mb-4 text-white font-semibold">
                            <Monitor size={16} /> {/* Generic icon, effectively "Root cause" */}
                            Root cause
                        </div>
                        {/* Simulated Analysis State */}
                        <div className="flex-1 flex flex-col items-center justify-center text-text-muted relative">
                            {/* Davis AI Logo / Icon Effect */}
                            <div className="relative w-16 h-16 mb-3 flex items-center justify-center">
                                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse"></div>
                                <div className="absolute inset-2 bg-blue-500/10 rounded-full border border-blue-400/30"></div>
                                <Sparkles size={24} className="text-blue-400 relative z-10" />
                            </div>

                            <div className="text-center space-y-1">
                                <span className="text-sm font-bold text-white block">Davis detected a constraint</span>
                                <span className="text-xs text-text-muted block">Memory limit reached on <span className="text-blue-400 cursor-pointer hover:underline">payment-service-v2</span></span>
                            </div>
                        </div>
                    </div>

                    {/* Visual Resolution Path (Blast Radius) */}
                    <div className="p-4 rounded-lg bg-card-bg border border-border-muted h-1/2 flex flex-col relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-4 z-10">
                            <div className="flex items-center gap-2 text-white font-semibold">
                                <Layers size={16} className="text-blue-400" />
                                Visual resolution path
                            </div>
                            <MoreVertical size={16} className="text-text-muted cursor-pointer" />
                        </div>

                        <div className="flex-1 relative bg-[#0B0C10] rounded border border-border-muted flex items-center justify-center overflow-hidden">
                            {/* Smartscape-style Vertical Tier Visualization */}
                            <div className="flex flex-col items-center gap-6 scale-90 md:scale-100">

                                {/* Tier 1: Application */}
                                <div className="flex flex-col items-center relative z-10">
                                    <div className="w-10 h-10 rounded border border-white/20 bg-[#1A1A24] flex items-center justify-center shadow-lg">
                                        <Globe size={18} className="text-green-500" />
                                    </div>
                                    <span className="text-[9px] mt-1 text-text-muted uppercase tracking-widest">Application</span>
                                    {/* Connection Line */}
                                    <div className="absolute top-full h-6 w-[1px] bg-border-muted"></div>
                                </div>

                                {/* Tier 2: Services (The Problem Area) */}
                                <div className="flex items-center gap-8 relative z-10">
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded border-2 border-red-500 bg-[#321818] flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse">
                                            <Server size={20} className="text-white" />
                                        </div>
                                        <div className="mt-1 flex flex-col items-center">
                                            <span className="text-[10px] font-bold text-white">Payment Svc</span>
                                            <span className="text-[9px] text-red-400">Critical</span>
                                        </div>
                                    </div>

                                    {/* Horizontal Connection */}
                                    <div className="absolute top-6 left-12 right-12 h-[1px] bg-border-muted -z-10"></div>

                                    <div className="flex flex-col items-center opacity-50 grayscale">
                                        <div className="w-10 h-10 rounded border border-white/10 bg-[#1A1A24] flex items-center justify-center">
                                            <Database size={16} className="text-blue-400" />
                                        </div>
                                        <span className="text-[9px] mt-1 text-text-muted">User DB</span>
                                    </div>
                                </div>

                                {/* Connection Line */}
                                <div className="h-6 w-[1px] bg-border-muted"></div>

                                {/* Tier 3: Infrastructure */}
                                <div className="flex flex-col items-center relative z-10">
                                    <div className="w-10 h-10 rounded border border-white/20 bg-[#1A1A24] flex items-center justify-center">
                                        <Cpu size={18} className="text-text-muted" />
                                    </div>
                                    <span className="text-[9px] mt-1 text-text-muted uppercase tracking-widest">Infrastructure</span>
                                </div>
                            </div>

                            {/* Background Grid Effect */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// Helper for the Chevron icon since it was just used in button
const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
    </svg>
);

export default ProblemDetail;
