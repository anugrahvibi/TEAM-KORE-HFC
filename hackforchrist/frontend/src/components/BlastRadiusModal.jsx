import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    GitBranch,
    Layers,
    Server,
    Zap,
    TrendingUp,
    DollarSign,
    X,
    Database,
    Lock
} from 'lucide-react';

const BlastRadiusColumn = ({ isOpen, onClose, scenarioData }) => {
    // If no data provided, use default mock
    const defaultData = {
        id: 'change-default',
        service: 'Payment Service',
        type: 'Deployment',
        version: 'v2.4.0',
        riskLevel: 'Critical',
        description: 'Major refactor of transaction processing logic.',
        graph: {
            nodes: [
                { id: '1', label: 'Payment', sub: 'v2.4.0', type: 'origin', x: 50, y: 140, status: 'deploying' },
                { id: '2', label: 'Checkout', sub: 'Critical', type: 'target', x: 250, y: 60, status: 'risk', risk: '92% Fail' },
                { id: '3', label: 'Analytics', sub: 'High Load', type: 'target', x: 250, y: 220, status: 'warning', risk: 'Latency' },
            ],
            paths: [
                { d: "M 120 180 C 180 180, 180 100, 250 100", stroke: 'risk' },
                { d: "M 120 180 C 180 180, 180 260, 250 260", stroke: 'warning' }
            ]
        },
        insights: {
            reliability: {
                title: 'Checkout Service Outage',
                prob: '92% Prob',
                desc: 'Memory leak detected in core loop.'
            },
            finops: {
                waste: '$1,247.00',
                cause: 'Unoptimized SQL queries.'
            },
            recommendation: 'Abort deployment.'
        }
    };

    const data = { ...defaultData, ...scenarioData };
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAnalyzing(true);
            setShowResults(false);
            const timer = setTimeout(() => {
                setIsAnalyzing(false);
                setShowResults(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0F1115] border border-border-muted rounded-xl w-full max-w-4xl h-[600px] flex flex-col overflow-hidden shadow-2xl relative"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="p-6 border-b border-border-muted bg-[#14151a]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-primary/10 text-primary">
                            <Server size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Impact Analysis: {data.service}</h2>
                            <p className="text-sm text-text-muted">{data.description}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex min-h-0">
                    {/* Left: Graph */}
                    <div className="flex-1 bg-[#0F1115] relative overflow-hidden border-r border-border-muted">
                        <div className="absolute inset-0 bg-grid-white/[0.02]" />
                        <div className="absolute top-3 left-3 z-10 text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
                            <GitBranch size={14} /> Dependency Graph
                        </div>

                        <div className="h-full flex items-center justify-center relative">
                            <AnimatePresence mode='wait'>
                                {isAnalyzing ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center gap-4 py-8"
                                    >
                                        <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                                        <div className="text-sm text-text-muted font-mono animate-pulse">Calculating cascade...</div>
                                    </motion.div>
                                ) : (
                                    <div className="relative w-full h-full flex items-center justify-center pointer-events-none scale-90">
                                        <svg className="absolute inset-0 w-full h-full overflow-visible z-0">
                                            <defs>
                                                <linearGradient id="riskGradModal" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.5 }} />
                                                    <stop offset="100%" style={{ stopColor: '#ef4444', stopOpacity: 0.8 }} />
                                                </linearGradient>
                                                <linearGradient id="warnGradModal" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.5 }} />
                                                    <stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: 0.8 }} />
                                                </linearGradient>
                                            </defs>

                                            {data.graph.paths.map((path, i) => (
                                                <motion.path
                                                    key={`path-modal-${i}`}
                                                    d={path.d}
                                                    fill="none"
                                                    stroke={path.stroke === 'risk' ? "url(#riskGradModal)" : path.stroke === 'warning' ? "url(#warnGradModal)" : "#10b981"}
                                                    strokeWidth={path.stroke === 'safe' ? 2 : 3}
                                                    strokeDasharray={path.stroke === 'safe' ? "0" : "5,5"}
                                                    initial={{ pathLength: 0 }}
                                                    animate={{ pathLength: 1 }}
                                                    transition={{ duration: 0.8 }}
                                                />
                                            ))}
                                        </svg>

                                        {data.graph.nodes.map((node, i) => (
                                            <motion.div
                                                key={`node-modal-${i}`}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="absolute z-10 flex flex-col items-center gap-2"
                                                style={{ left: node.x, top: node.y }}
                                            >
                                                <div className={`w-16 h-16 rounded-lg bg-[#0F172A] border-2 flex flex-col items-center justify-center relative ${node.status === 'risk' ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' :
                                                    node.status === 'warning' ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' :
                                                        node.status === 'deploying' ? 'border-blue-500' :
                                                            'border-emerald-500/50'
                                                    }`}>
                                                    <Server size={20} className={
                                                        node.status === 'risk' ? "text-red-400" :
                                                            node.status === 'warning' ? "text-amber-400" :
                                                                node.status === 'deploying' ? "text-blue-400" : "text-emerald-400"
                                                    } />
                                                    <span className="text-[10px] font-bold text-white mt-1">{node.label}</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right: Insights */}
                    <div className="w-80 bg-card-bg p-6 flex flex-col gap-6 overflow-y-auto">
                        {!showResults ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 gap-2">
                                <TrendingUp size={24} />
                                <p className="text-xs">Analyzing potential impact...</p>
                            </div>
                        ) : (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                {/* Reliability */}
                                <div>
                                    <h3 className="text-[10px] uppercase tracking-wider text-text-muted font-bold flex items-center gap-1 mb-2">
                                        <TrendingUp size={12} /> Reliability Risk
                                    </h3>
                                    <div className="p-3 rounded bg-white/5 border border-white/10">
                                        <div className="text-sm font-semibold text-white mb-1">{data.insights.reliability.title}</div>
                                        <div className="text-xs text-text-muted mb-2">{data.insights.reliability.desc}</div>
                                        <div className="inline-block px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30">
                                            {data.insights.reliability.prob}
                                        </div>
                                    </div>
                                </div>

                                {/* FinOps */}
                                <div>
                                    <h3 className="text-[10px] uppercase tracking-wider text-text-muted font-bold flex items-center gap-1 mb-2">
                                        <DollarSign size={12} /> Cost Projection
                                    </h3>
                                    <div className="p-3 rounded bg-white/5 border border-white/10">
                                        <div className="text-2xl font-bold text-amber-500">{data.insights.finops.waste}</div>
                                        <div className="text-xs text-text-muted mt-1">{data.insights.finops.cause}</div>
                                    </div>
                                </div>

                                {/* Action */}
                                <div className="pt-4 border-t border-white/10">
                                    <p className="text-xs text-blue-300 mb-3 font-medium">Rec: <span className="text-white font-normal">{data.insights.recommendation}</span></p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button className="py-2 bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold rounded transition-colors">
                                            Block
                                        </button>
                                        <button className="py-2 border border-white/10 hover:bg-white/5 text-text-muted text-xs font-bold rounded transition-colors">
                                            Ignore
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default BlastRadiusColumn;
