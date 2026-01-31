import React from 'react';
import { Shield, Filter, RefreshCcw, ChevronDown, List, Download, AlertTriangle, Bug, Globe, Gem, ExternalLink } from 'lucide-react';

const Prioritization = () => {
    // Mock Data for the Table
    const vulnerabilities = [
        { id: 'S-360', name: 'SQL injection at MembershipController...', score: 'Critical 10.0', type: 'Code-level', status: 'Open', muted: 'Not muted', openSince: '2 months ago', date: 'Nov 17, 2025, 11:42 PM' },
        { id: 'S-359', name: 'SQL injection at MembershipController...', score: 'Critical 10.0', type: 'Code-level', status: 'Open', muted: 'Not muted', openSince: '2 months ago', date: 'Nov 17, 2025, 11:37 PM' },
        { id: 'S-358', name: 'SQL injection at MembershipController...', score: 'Critical 10.0', type: 'Code-level', status: 'Open', muted: 'Not muted', openSince: '2 months ago', date: 'Nov 17, 2025, 11:37 PM' },
        { id: 'S-228', name: 'SQL injection at DatabaseManager.u...', score: 'Critical 10.0', type: 'Code-level', status: 'Open', muted: 'Not muted', openSince: '2 months ago', date: 'Nov 18, 2025, 7:45 AM' },
        { id: 'S-227', name: 'Command injection at BioController....', score: 'Critical 10.0', type: 'Code-level', status: 'Open', muted: 'Not muted', openSince: '2 months ago', date: 'Nov 17, 2025, 11:42 PM' },
        { id: 'S-226', name: 'SQL injection at DatabaseManager.in...', score: 'Critical 10.0', type: 'Code-level', status: 'Open', muted: 'Not muted', openSince: '2 months ago', date: 'Nov 17, 2025, 11:42 PM' },
        { id: 'S-506', name: 'Server-side request forgery at Proxy...', score: 'Critical 10.0', type: 'Code-level', status: 'Open', muted: 'Not muted', openSince: '2 months ago', date: 'Nov 17, 2025, 11:42 PM' },
    ];

    return (
        <div className="flex flex-col text-text-main pb-8">
            {/* Header Area */}
            <div className="flex flex-col gap-4 flex-shrink-0 px-1 pb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">Prioritization</h1>
                        <p className="text-text-muted text-sm">
                            See which vulnerabilities need immediate action and which have been fixed.
                        </p>
                    </div>
                    {/* Monitoring Environment Badge */}
                    <div className="hidden sm:flex items-center gap-3 bg-[#112826] border border-[#164e45] text-[#2ebd98] px-4 py-3 rounded-md">
                        <div className="relative">
                            <Shield size={24} className="text-[#2ebd98]" />
                            {/* Simulated status dot */}
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-[#112826]"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-white">Monitoring environment</span>
                            <span className="text-xs text-[#2ebd98] opacity-80">Vulnerability analytics enabled</span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                    <button className="w-full sm:w-auto flex items-center justify-between gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-border-muted bg-card-bg hover:bg-white/5">
                        Last 30 minutes
                        <ChevronDown size={14} />
                    </button>
                    {/* Search & Refresh */}
                    <div className="w-full sm:flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Type to filter"
                                className="w-full pl-9 pr-4 py-1.5 text-sm rounded-md border border-border-muted bg-card-bg text-text-main placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md border border-border-muted bg-card-bg hover:bg-white/5 whitespace-nowrap">
                            <RefreshCcw size={14} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Vulnerability Count */}
                <div>
                    <h2 className="text-lg font-bold">530 vulnerabilities detected</h2>
                    <button className="flex items-center gap-1 text-xs text-blue-400 hover:underline mt-1">
                        Powered by Dynatrace Security Score <ExternalLink size={10} />
                    </button>
                </div>
            </div>

            {/* Main Content Wrapper */}
            <div className="flex flex-col bg-card-bg border border-border-muted shadow-sm rounded-xl overflow-hidden">
                {/* Toolbar */}
                <div className="flex justify-between items-center p-2 border-b border-border-muted bg-card-bg">
                    <button className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#2e2e3a] text-gray-200 hover:bg-[#3e3e4a]">
                        Security Advisor
                    </button>
                    <div className="flex items-center gap-3 text-text-muted">
                        <button className="flex items-center gap-1 text-xs font-medium hover:text-text-main">
                            <List size={12} /> 8 columns hidden
                        </button>
                        <button className="hover:text-text-main">
                            <Download size={14} />
                        </button>
                    </div>
                </div>

                {/* Table Area (Flow based) */}
                <div className="w-full overflow-x-auto">
                    {/* Desktop Table View */}
                    <table className="hidden lg:table w-full text-sm text-left relative whitespace-nowrap">
                        <thead className="bg-[#14151a] border-b border-border-muted text-xs uppercase text-text-muted font-semibold">
                            <tr>
                                <th className="px-4 py-3 w-auto">Vulnerability</th>
                                <th className="px-4 py-3 w-40">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-white">
                                        Score <ChevronDown size={12} />
                                    </div>
                                </th>
                                <th className="px-4 py-3 w-32">Assessment</th>
                                <th className="px-4 py-3 w-32">Type</th>
                                <th className="px-4 py-3 w-24">Status</th>
                                <th className="px-4 py-3 w-24">Muted</th>
                                <th className="px-4 py-3 w-40 text-right">Open since</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-muted">
                            {vulnerabilities.map((vuln) => (
                                <tr key={vuln.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                                    <td className="px-4 py-4 font-medium text-text-main truncate max-w-xs" title={vuln.name}>
                                        <span className="font-mono text-text-muted mr-2">{vuln.id}:</span>
                                        {vuln.name}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 border border-red-500 text-red-500 text-xs font-bold whitespace-nowrap">
                                            <Shield size={12} className="fill-current" />
                                            {vuln.score}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2 text-text-muted">
                                            <Globe size={14} />
                                            <Gem size={14} className="text-red-400" />
                                            <span className="font-mono text-red-400 text-xs">{'<!>'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-text-main text-xs">{vuln.type}</td>
                                    <td className="px-4 py-4 text-text-main text-xs">{vuln.status}</td>
                                    <td className="px-4 py-4 text-text-main text-xs">{vuln.muted}</td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="flex items-center gap-1 text-red-400 text-xs font-medium bg-red-400/10 px-1.5 py-0.5 rounded border border-red-400/20">
                                                {vuln.openSince} <AlertTriangle size={10} className="fill-current" />
                                            </span>
                                            <span className="text-xs text-text-muted font-mono">{vuln.date}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Mobile Card View */}
                    <div className="lg:hidden flex flex-col gap-3 p-4">
                        {vulnerabilities.map((vuln) => (
                            <div key={vuln.id} className="bg-card-bg border border-border-muted rounded-xl p-4 space-y-3 hover:bg-white/5 hover:-translate-y-1 hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs text-text-muted">{vuln.id}</span>
                                        <span className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-text-muted border border-border-muted">{vuln.status}</span>
                                    </div>
                                    <span className="text-xs text-text-muted">{vuln.date.split(',')[0]}</span>
                                </div>
                                <h3 className="font-medium text-text-main text-base leading-tight">
                                    {vuln.name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border-muted/50">
                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 border border-red-500 text-red-500 text-xs font-bold">
                                        <Shield size={12} className="fill-current" />
                                        {vuln.score}
                                    </div>
                                    <span className="text-xs text-text-muted flex items-center gap-1">
                                        <Globe size={12} /> {vuln.type}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Prioritization;
