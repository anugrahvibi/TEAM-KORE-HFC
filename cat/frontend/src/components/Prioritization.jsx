import React, { useState, useMemo } from 'react';
import {
    Shield,
    Filter,
    RefreshCcw,
    ChevronDown,
    List,
    Download,
    AlertTriangle,
    Bug,
    Globe,
    Gem,
    ExternalLink,
    TrendingUp,
    DollarSign,
    Users,
    Server,
    ArrowUpRight,
    Activity,
    CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

const Prioritization = () => {
    // Enhanced Mock Data with more realistic attributes
    const rawVulnerabilities = [
        {
            id: 'S-360',
            name: 'Log4Shell RCE in Payment Gateway',
            cve: 'CVE-2021-44228',
            baseScore: 10.0,
            riskScore: 98,
            impact: 'High',
            impactLabel: '$2.5M Revenue Risk',
            affectedStr: 'Payments-API-v1',
            type: 'Remote Code Execution',
            status: 'Active',
            age: '4 hours',
            teams: 'FinTech Core'
        },
        {
            id: 'S-359',
            name: 'SQL Injection in User Authentication',
            cve: 'CVE-2023-2831',
            baseScore: 9.8,
            riskScore: 95,
            impact: 'Critical',
            impactLabel: '150k Users Exposed',
            affectedStr: 'Auth-Service',
            type: 'SQL Injection',
            status: 'Active',
            age: '2 days',
            teams: 'Identity Team'
        },
        {
            id: 'S-506',
            name: 'SSRF via Unvalidated Input',
            cve: 'CVE-2023-3054',
            baseScore: 8.6,
            riskScore: 82,
            impact: 'Medium',
            impactLabel: 'Internal Network Access',
            affectedStr: 'Proxy-Server-04',
            type: 'SSRF',
            status: 'TRIAGED',
            age: '1 week',
            teams: 'Infra Ops'
        },
        {
            id: 'S-228',
            name: 'Weak Cryptographic Key Material',
            cve: 'CVE-2022-1292',
            baseScore: 7.5,
            riskScore: 65,
            impact: 'Low',
            impactLabel: 'Compliance Violation',
            affectedStr: 'Legacy-Reporting',
            type: 'Crypto Weakness',
            status: 'Active',
            age: '2 months',
            teams: 'Data Analytics'
        },
        {
            id: 'S-227',
            name: 'Stored XSS in Admin Dashboard',
            cve: 'CVE-2023-1109',
            baseScore: 6.1,
            riskScore: 45,
            impact: 'Medium',
            impactLabel: 'Admin Session Theft',
            affectedStr: 'Admin-Panel-UI',
            type: 'XSS',
            status: 'Active',
            age: '3 weeks',
            teams: 'Internal Tools'
        },
        {
            id: 'P-102',
            name: 'Expired SSL Certificate',
            cve: 'N/A',
            baseScore: 5.0,
            riskScore: 30,
            impact: 'Low',
            impactLabel: 'Service Downtime Risk',
            affectedStr: 'cdn.assets.com',
            type: 'Configuration',
            status: 'Resolved',
            age: '1 day',
            teams: 'SRE'
        },
    ];

    const [sortConfig, setSortConfig] = useState({ key: 'riskScore', direction: 'desc' });

    // Sorting Logic
    const sortedData = useMemo(() => {
        let sorted = [...rawVulnerabilities];
        if (sortConfig.key) {
            sorted.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sorted;
    }, [sortConfig]);

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getRiskColor = (score) => {
        if (score >= 90) return 'text-white bg-red-600';
        if (score >= 70) return 'text-white bg-orange-600';
        if (score >= 50) return 'text-white bg-amber-600';
        return 'text-white bg-emerald-600';
    };

    const getImpactIcon = (label) => {
        if (label.includes('Revenue') || label.includes('Dollar')) return <DollarSign size={13} />;
        if (label.includes('User')) return <Users size={13} />;
        return <AlertTriangle size={13} />;
    };

    return (
        <div className="flex flex-col text-text-main h-full overflow-hidden p-6 gap-4">
            {/* Header Area */}
            <div className="flex flex-col gap-6 flex-shrink-0 px-1 pb-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                            Risk Prioritization
                            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-mono border border-primary/30">Beta</span>
                        </h1>
                        <p className="text-text-muted text-sm max-w-2xl">
                            AI-driven risk scoring based on exploitability, business impact, and active threat intelligence.
                            Focus on the top <span className="text-white font-semibold">2%</span> of alerts that matter.
                        </p>
                    </div>

                    {/* Top Stats Cards */}
                    <div className="flex gap-3">
                        <div className="bg-card-bg border border-border-muted p-3 rounded-lg flex flex-col min-w-[120px]">
                            <span className="text-text-muted text-xs uppercase tracking-wider">Critical Risk</span>
                            <span className="text-2xl font-bold text-red-500 mt-1">2</span>
                            <span className="text-xs text-red-400/80 flex items-center gap-1 mt-1">
                                <ArrowUpRight size={10} /> +1 today
                            </span>
                        </div>
                        <div className="bg-card-bg border border-border-muted p-3 rounded-lg flex flex-col min-w-[120px]">
                            <span className="text-text-muted text-xs uppercase tracking-wider">Assets at Risk</span>
                            <span className="text-2xl font-bold text-amber-500 mt-1">14</span>
                            <span className="text-xs text-text-muted flex items-center gap-1 mt-1">
                                Across 3 services
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                        {['All Risks', 'Critical Only', 'Exploitable', 'Fixable'].map((filter, idx) => (
                            <button
                                key={filter}
                                className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all whitespace-nowrap ${idx === 0
                                    ? 'bg-white/10 text-white border-white/20'
                                    : 'bg-transparent text-text-muted border-border-muted hover:border-text-muted hover:text-text-main'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="w-full sm:w-64 relative">
                        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Filter by CVE, Team..."
                            className="w-full pl-9 pr-4 py-1.5 text-sm rounded-md border border-border-muted bg-card-bg text-text-main placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Wrapper */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col bg-card-bg border border-border-muted shadow-sm rounded-xl overflow-hidden flex-1 min-h-[400px]"
            >
                {/* Custom Toolbar */}
                <div className="flex justify-between items-center px-4 py-3 border-b border-border-muted bg-[#16171d]">
                    <div className="flex gap-2">
                        <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">Live Feed</span>
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Updated now
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-text-muted">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="w-2 h-2 rounded bg-purple-500" /> AI Correlation Active
                        </div>
                        <button className="hover:text-text-main">
                            <Download size={16} />
                        </button>
                    </div>
                </div>

                {/* Table Area */}
                <div className="overflow-auto flex-1">
                    <table className="w-full text-sm text-left relative min-w-[800px]">
                        <thead className="bg-[#14151a] border-b border-border-muted text-xs uppercase text-text-muted font-semibold sticky top-0 z-10">
                            <tr>
                                <th
                                    className="px-6 py-4 w-auto cursor-pointer hover:text-white"
                                    onClick={() => handleSort('name')}
                                >
                                    Vulnerability / CVE
                                </th>
                                <th
                                    className="px-6 py-4 w-40 cursor-pointer hover:text-white"
                                    onClick={() => handleSort('riskScore')}
                                >
                                    <div className="flex items-center gap-1">
                                        Risk Score <ArrowUpRight size={12} />
                                    </div>
                                </th>
                                <th className="px-6 py-4 w-48">Business Impact</th>
                                <th className="px-6 py-4 w-40">Affected Asset</th>
                                <th className="px-6 py-4 w-32 text-center">Teams</th>
                                <th className="px-6 py-4 w-32 text-right">Age</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-muted">
                            {sortedData.map((vuln) => (
                                <tr key={vuln.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1">
                                                {vuln.rawScore >= 9 ? <AlertTriangle size={16} className="text-red-500" /> : <Bug size={16} className="text-amber-500" />}
                                            </div>
                                            <div>
                                                <div className="font-medium text-text-main text-base">{vuln.name}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="font-mono text-xs text-text-muted bg-white/5 px-1.5 rounded">{vuln.cve}</span>
                                                    <span className="text-xs text-text-muted border-l border-white/10 pl-2">{vuln.type}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-sm font-bold w-fit ${getRiskColor(vuln.riskScore)}`}>
                                                <Activity size={14} />
                                                {vuln.riskScore}
                                                <span className="text-[10px] font-normal opacity-80">/100</span>
                                            </div>
                                            <span className="text-xs text-text-muted pl-1">CVSS: {vuln.baseScore}</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit flex items-center gap-1.5 ${vuln.impact === 'High' || vuln.impact === 'Critical'
                                                ? 'bg-red-500/10 text-red-400'
                                                : 'bg-blue-500/10 text-blue-400'
                                                }`}>
                                                {getImpactIcon(vuln.impactLabel)}
                                                {vuln.impactLabel}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-text-main text-sm">
                                            <Server size={14} className="text-text-muted" />
                                            {vuln.affectedStr}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <span className="text-xs font-medium text-text-muted bg-white/5 px-2 py-1 rounded-lg border border-white/5 whitespace-nowrap">
                                            {vuln.teams}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-sm text-text-main">{vuln.age}</span>
                                            {vuln.status !== 'Resolved' && (
                                                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-red-400">
                                                    Open
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default Prioritization;
