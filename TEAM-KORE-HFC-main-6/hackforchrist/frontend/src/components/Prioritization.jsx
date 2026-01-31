import React, { useState, useMemo, useEffect } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';
import BlastRadiusColumn from './BlastRadiusModal';

import { getAlerts, getBlastRadiusData } from '../utils/dataProvider';

const Prioritization = () => {
    // Loaded from backend data
    const rawVulnerabilities = getAlerts();
    const blastData = getBlastRadiusData();

    const [sortConfig, setSortConfig] = useState({ key: 'riskScore', direction: 'desc' });
    const [selectedVuln, setSelectedVuln] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All Risks');

    // Live Risk Updates
    useEffect(() => {
        const interval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * rawVulnerabilities.length);
            const vuln = rawVulnerabilities[randomIndex];
            // Fluctuate score slightly
            const newScore = Math.min(100, Math.max(0, vuln.riskScore + (Math.random() > 0.5 ? 1 : -1)));
            vuln.riskScore = newScore;
            // Force re-render shallowly
            setSortConfig(prev => ({ ...prev }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Data Processing: Filter then Sort
    const processedData = useMemo(() => {
        let filtered = rawVulnerabilities.filter(vuln => {
            // Search filter
            const matchesSearch = vuln.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                vuln.cve.toLowerCase().includes(searchQuery.toLowerCase()) ||
                vuln.affectedStr.toLowerCase().includes(searchQuery.toLowerCase());

            // Type filter
            let matchesType = true;
            if (filterType === 'Critical Only') matchesType = vuln.riskScore >= 90;
            if (filterType === 'Exploitable') matchesType = vuln.cve !== 'N/A';
            if (filterType === 'Fixable') matchesType = vuln.riskScore < 95; // Demo logic

            return matchesSearch && matchesType;
        });

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filtered;
    }, [sortConfig, rawVulnerabilities, searchQuery, filterType]);

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
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                            Risk Prioritization
                            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-mono border border-primary/30">Beta</span>
                        </h1>
                        <p className="text-text-muted text-sm max-w-2xl">
                            AI-driven risk scoring based on exploitability, business impact, and active threat intelligence.
                            Focus on the top <span className="text-white font-semibold">2%</span> of alerts that matter.
                        </p>
                    </motion.div>

                    <div className="flex gap-3">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ y: -2 }}
                            className="bg-card-bg border border-border-muted p-3 rounded-lg flex flex-col min-w-[120px] relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full -mr-8 -mt-8 group-hover:bg-red-500/10 transition-colors" />
                            <span className="text-text-muted text-xs uppercase tracking-wider relative">Critical Risk</span>
                            <span className="text-2xl font-bold text-red-500 mt-1 relative">2</span>
                            <span className="text-xs text-red-400/80 flex items-center gap-1 mt-1 relative">
                                <ArrowUpRight size={10} /> +1 today
                            </span>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            whileHover={{ y: -2 }}
                            className="bg-card-bg border border-border-muted p-3 rounded-lg flex flex-col min-w-[120px] relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full -mr-8 -mt-8 group-hover:bg-amber-500/10 transition-colors" />
                            <span className="text-text-muted text-xs uppercase tracking-wider relative">Assets at Risk</span>
                            <span className="text-2xl font-bold text-amber-500 mt-1 relative">14</span>
                            <span className="text-xs text-text-muted flex items-center gap-1 mt-1 relative">
                                Across 3 services
                            </span>
                        </motion.div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                        {['All Risks', 'Critical Only', 'Exploitable', 'Fixable'].map((filter, i) => (
                            <motion.button
                                key={filter}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + (i * 0.1) }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setFilterType(filter)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all whitespace-nowrap ${filterType === filter
                                    ? 'bg-primary/20 text-white border-primary/50'
                                    : 'bg-transparent text-text-muted border-border-muted hover:border-text-muted hover:text-text-main'
                                    }`}
                            >
                                {filter}
                            </motion.button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="w-full sm:w-64 relative">
                        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Filter by CVE, Asset..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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

                {/* Table Area - Responsive Container */}
                <div className="flex-1 overflow-auto relative">
                    {/* Desktop Table View */}
                    <table className="hidden lg:table w-full text-sm text-left relative table-fixed">
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
                                <th className="px-6 py-4 w-24">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-muted">
                            <AnimatePresence mode='popLayout'>
                                {processedData.map((vuln) => (
                                    <motion.tr
                                        key={vuln.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        className="hover:bg-white/5 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1 flex-shrink-0">
                                                    {vuln.rawScore >= 9 ? <AlertTriangle size={16} className="text-red-500" /> : <Bug size={16} className="text-amber-500" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-text-main text-base truncate" title={vuln.name}>{vuln.name}</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="font-mono text-xs text-text-muted bg-white/5 px-1.5 rounded">{vuln.cve}</span>
                                                        <span className="text-xs text-text-muted border-l border-white/10 pl-2 truncate">{vuln.type}</span>
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
                                            <div className="flex items-center gap-2 text-text-main text-sm truncate">
                                                <Server size={14} className="text-text-muted flex-shrink-0" />
                                                <span className="truncate">{vuln.affectedStr}</span>
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
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedVuln(vuln);
                                                }}
                                                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/50 text-text-muted hover:text-white transition-all group relative"
                                                title="Analyze Blast Radius"
                                            >
                                                <Activity size={16} className="group-hover:text-primary" />
                                                {vuln.riskScore > 80 && (
                                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                                )}
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    <div className="lg:hidden flex flex-col gap-4 p-4 pb-20">
                        <AnimatePresence mode='popLayout'>
                            {processedData.map((vuln, i) => (
                                <motion.div
                                    key={vuln.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2, delay: i * 0.05 }}
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-app-bg/40 border border-border-muted rounded-xl p-4 space-y-4 hover:border-primary/30 transition-all group cursor-pointer"
                                    onClick={() => setSelectedVuln(vuln)}
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className="mt-1 flex-shrink-0">
                                                {vuln.rawScore >= 9 ? <AlertTriangle size={18} className="text-red-500" /> : <Bug size={18} className="text-amber-500" />}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-text-main text-base leading-tight truncate">
                                                    {vuln.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="font-mono text-[10px] text-text-muted bg-white/5 px-1.5 rounded">{vuln.cve}</span>
                                                    <span className="text-[10px] text-text-muted">{vuln.type}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`flex-shrink-0 px-2.5 py-1 rounded text-sm font-bold flex items-center gap-1.5 ${getRiskColor(vuln.riskScore)}`}>
                                            <Activity size={12} />
                                            {vuln.riskScore}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border-muted/50">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase tracking-wider text-text-muted">Impact</span>
                                            <span className={`text-xs font-semibold flex items-center gap-1.5 ${vuln.impact === 'High' || vuln.impact === 'Critical' ? 'text-red-400' : 'text-blue-400'}`}>
                                                {getImpactIcon(vuln.impactLabel)}
                                                {vuln.impactLabel}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase tracking-wider text-text-muted">Asset</span>
                                            <span className="text-xs text-text-main flex items-center gap-1 truncate">
                                                <Server size={12} className="text-text-muted" />
                                                {vuln.affectedStr}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase tracking-wider text-text-muted">Teams</span>
                                            <span className="text-xs text-text-main">{vuln.teams}</span>
                                        </div>
                                        <div className="flex items-center justify-between col-span-2 mt-2">
                                            <span className="text-[10px] text-text-muted">Age: <span className="text-text-main font-medium">{vuln.age}</span></span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedVuln(vuln);
                                                }}
                                                className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all flex items-center gap-2 text-xs font-bold"
                                            >
                                                <Activity size={14} /> ANALYZE BLAST
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

            {/* Blast Radius Modal - Opens when table action is clicked */}
            <AnimatePresence>
                {selectedVuln && (
                    <BlastRadiusColumn
                        isOpen={!!selectedVuln}
                        onClose={() => setSelectedVuln(null)}
                        scenarioData={{
                            service: selectedVuln.affectedStr,
                            description: selectedVuln.name,
                            version: 'Current',
                            type: selectedVuln.type,
                            graph: blastData.graph,
                            insights: blastData.insights
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Prioritization;
