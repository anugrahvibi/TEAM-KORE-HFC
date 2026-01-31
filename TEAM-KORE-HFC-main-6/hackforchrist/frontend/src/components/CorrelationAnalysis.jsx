import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GitCommit,
    Clock,
    AlertTriangle,
    TrendingUp,
    Activity,
    ArrowRight,
    Search,
    Cpu,
    Zap,
    CheckCircle2,
    Share2,
    X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import { getCorrelationData, getBlastRadiusData } from '../utils/dataProvider';
import BlastRadiusColumn from './BlastRadiusModal';

const CorrelationAnalysis = ({ data = null, onClose }) => {
    // Load from data provider if not passed
    const analysisData = data || getCorrelationData();
    const [isBlastRadiusOpen, setIsBlastRadiusOpen] = useState(false);
    const blastData = getBlastRadiusData();

    const { service, change_event, correlation } = analysisData;

    // Helper to format timestamps
    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Helper to format date
    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const getMetricIcon = (metricName) => {
        if (metricName.includes('cpu')) return <Cpu size={16} />;
        if (metricName.includes('latency')) return <Zap size={16} />;
        return <Activity size={16} />;
    };

    const getConfidenceColor = (score) => {
        if (score >= 0.8) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
        if (score >= 0.6) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
        return 'text-red-400 border-red-500/30 bg-red-500/10';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full bg-card-bg border border-border-muted rounded-xl shadow-xl overflow-hidden"
        >
            {/* Header Section */}
            <div className="p-6 border-b border-border-muted bg-gradient-to-r from-card-bg to-app-bg">
                <div className="flex justify-between items-start">
                    <div className="flex gap-4 items-center">
                        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20 shadow-inner">
                            <GitCommit size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                                Change Correlation Analysis
                                {correlation.is_correlated && (
                                    <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                        AI Insight
                                    </span>
                                )}
                            </h2>
                            <p className="text-text-muted text-sm mt-1 flex items-center gap-2">
                                Service: <span className="font-mono text-text-main bg-white/5 px-1.5 rounded">{service}</span>
                                <span className="w-1 h-1 rounded-full bg-text-muted"></span>
                                Event: {change_event.type} <span className="font-mono text-emerald-400">{change_event.version}</span>
                            </p>
                        </div>
                    </div>

                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 text-text-muted hover:text-text-main hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Context & Summary */}
                <div className="space-y-6">
                    {/* Confidence Score Card */}
                    <div className={`p-5 rounded-xl border ${getConfidenceColor(correlation.correlation_confidence)} backdrop-blur-sm relative overflow-hidden group`}>
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Search size={80} />
                        </div>
                        <h3 className="text-sm uppercase tracking-wider font-semibold opacity-80 mb-1">Correlation Confidence</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold">{Math.round(correlation.correlation_confidence * 100)}%</span>
                            <span className="text-sm opacity-80">High Probability</span>
                        </div>
                        <p className="mt-3 text-sm opacity-90 leading-relaxed border-t border-white/10 pt-3">
                            The system has identified a strong link between the deployment of
                            <span className="font-mono font-bold mx-1">{change_event.version}</span>
                            and the subsequent metrics anomalies.
                        </p>
                    </div>

                    {/* Timeline Info */}
                    <div className="p-5 rounded-xl bg-app-bg border border-border-muted flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-500/30">
                                1
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-text-muted mb-0.5">Change Event</p>
                                <div className="text-sm text-text-main font-semibold flex items-center justify-between">
                                    <span>Deployment {change_event.version}</span>
                                    <span className="text-xs font-mono text-text-muted">{formatTime(change_event.timestamp)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pl-4 ml-4 border-l-2 border-dashed border-border-muted h-6"></div>

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold border border-amber-500/30">
                                2
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-text-muted mb-0.5">Anomaly Detected</p>
                                <div className="text-sm text-text-main font-semibold flex items-center justify-between">
                                    <span>Metrics Shift</span>
                                    <span className="text-xs font-mono text-text-muted">
                                        +{correlation.time_offset_minutes} mins later
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Metrics Analysis */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">Affected Metrics Analysis</h3>

                    {correlation.affected_metrics.map((metric, idx) => (
                        <motion.div
                            key={`${metric.metric}-${idx}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-app-bg border border-border-muted rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white/5 text-text-main border border-white/10">
                                        {getMetricIcon(metric.metric)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-text-main capitalize">{metric.metric.replace('_', ' ')}</h4>
                                        <span className="text-xs text-text-muted flex items-center gap-1">
                                            Pattern: <span className="text-amber-400">{metric.pattern.replace('_', ' ')}</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-red-400 flex items-center justify-end gap-1">
                                        <TrendingUp size={20} />
                                        +{metric.delta_percent}%
                                    </div>
                                    <p className="text-xs text-text-muted">Change Magnitude</p>
                                </div>
                            </div>

                            {/* Visual Bar Comparison */}
                            <div className="relative h-12 bg-black/20 rounded-lg overflow-hidden flex items-center px-2">
                                <div className="absolute inset-0 grid grid-cols-12 gap-1 pointer-events-none opacity-20">
                                    {[...Array(12)].map((_, i) => <div key={i} className="border-r border-white/10 h-full"></div>)}
                                </div>

                                {/* Before Bar */}
                                <div className="h-4 bg-blue-500/50 rounded-full relative group" style={{ width: `${Math.min(100, (metric.before_avg / Math.max(metric.before_avg, metric.after_avg)) * 80)}%` }}>
                                    <span className="absolute -top-6 left-0 text-xs font-mono text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Avg: {metric.before_avg}
                                    </span>
                                </div>

                                {/* Arrow Connector */}
                                <div className="mx-2 text-text-muted/50">
                                    <ArrowRight size={14} />
                                </div>

                                {/* After Bar */}
                                <div className="h-4 bg-red-500 rounded-full relative group" style={{ width: `${Math.min(100, (metric.after_avg / Math.max(metric.before_avg, metric.after_avg)) * 80)}%` }}>
                                    <span className="absolute -top-6 right-0 text-xs font-mono text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Avg: {metric.after_avg}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between mt-2 text-xs text-text-muted font-mono px-1">
                                <span>Before: {metric.before_avg}</span>
                                <span>After: {metric.after_avg}</span>
                            </div>
                        </motion.div>
                    ))}

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            onClick={() => setIsBlastRadiusOpen(true)}
                            className="px-4 py-1.5 rounded-lg text-sm font-semibold border border-blue-500/20 text-blue-400 hover:bg-blue-500/10 transition-all flex items-center gap-2"
                        >
                            <Activity size={14} /> Predict Impact
                        </button>
                        <button className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-primary/90 hover:bg-primary text-white shadow-sm transition-all flex items-center gap-2">
                            <CheckCircle2 size={14} /> Resolve
                        </button>
                    </div>
                </div>
            </div>

            {/* Blast Radius Integration */}
            <BlastRadiusColumn
                isOpen={isBlastRadiusOpen}
                onClose={() => setIsBlastRadiusOpen(false)}
                scenarioData={{
                    service: service,
                    description: `Predictive impact for ${change_event.type} ${change_event.version}`,
                    version: change_event.version,
                    type: change_event.type,
                    riskLevel: correlation.correlation_confidence > 0.8 ? 'Critical' : 'High',
                    graph: blastData.graph,
                    insights: blastData.insights
                }}
            />
        </motion.div>
    );
};

export default CorrelationAnalysis;
