import React, { useState } from 'react';
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
    Database,
    Lock,
    Globe
} from 'lucide-react';

import { getBlastRadiusData } from '../utils/dataProvider';

const BlastRadius = () => {
    // Load scenario from local backend data
    const activeScenario = getBlastRadiusData();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showResults, setShowResults] = useState(false);
    // Removed sidebar selection logic as we only show the detected event

    const handleSimulate = () => {
        setIsAnalyzing(true);
        setShowResults(false);
        setTimeout(() => {
            setIsAnalyzing(false);
            setShowResults(true);
        }, 2000); // slightly faster for demo
    };

    return (
        <div className="h-full w-full p-6 overflow-hidden flex flex-col gap-6">

            {/* Page Header */}
            <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    Predictive Blast Radius
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-mono uppercase tracking-wider">
                        Gold Feature
                    </span>
                </h1>
                <p className="text-text-muted mt-1">
                    Select a detected change event to simulate its downstream impact before it goes live.
                </p>
            </div>

            <div className="flex-1 flex gap-6 min-h-0">



                {/* RIGHT/CENTER: SIMULATION PANEL */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">

                    {/* Top Action Bar for Selected Scenario */}
                    <div className="bg-card-bg border border-border-muted rounded-xl p-4 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                Simulating: <span className="text-primary">{activeScenario.service}</span>
                                <span className="font-mono text-sm text-text-muted bg-white/5 px-2 py-0.5 rounded">{activeScenario.version}</span>
                            </h2>
                            <p className="text-sm text-text-muted">{activeScenario.description}</p>
                        </div>
                        {!showResults && !isAnalyzing && (
                            <button
                                onClick={handleSimulate}
                                className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 animate-pulse"
                            >
                                <Zap size={16} />
                                Run Prediction
                            </button>
                        )}
                        {showResults && (
                            <button
                                onClick={handleSimulate}
                                className="px-4 py-1.5 border border-border-muted hover:bg-white/5 text-text-muted hover:text-white rounded-lg text-sm font-medium transition-all"
                            >
                                Re-run
                            </button>
                        )}
                    </div>

                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">

                        {/* Dependency Graph */}
                        <div className="lg:col-span-2 bg-[#0F1115] rounded-xl border border-border-muted relative overflow-hidden flex flex-col shadow-2xl">
                            <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
                            <div className="p-3 border-b border-white/5 bg-white/5 backdrop-blur-sm z-10 flex justify-between items-center">
                                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
                                    <GitBranch size={14} /> Dependency Impact Map
                                </h3>
                            </div>

                            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                                <AnimatePresence mode='wait'>
                                    {isAnalyzing ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex flex-col items-center gap-4 text-center z-20"
                                        >
                                            <div className="relative">
                                                <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Server size={24} className="text-primary animate-pulse" />
                                                </div>
                                            </div>
                                            <div className="text-sm text-text-muted font-mono">Simulating propagation...</div>
                                        </motion.div>
                                    ) : (
                                        <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                                            {/* Dynamic Graph Rendering */}
                                            <svg className="absolute inset-0 w-full h-full overflow-visible z-0">
                                                <defs>
                                                    <linearGradient id="riskGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.5 }} />
                                                        <stop offset="100%" style={{ stopColor: '#ef4444', stopOpacity: 0.8 }} />
                                                    </linearGradient>
                                                    <linearGradient id="warnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.5 }} />
                                                        <stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: 0.8 }} />
                                                    </linearGradient>
                                                </defs>

                                                {activeScenario.graph.paths.map((path, i) => (
                                                    <motion.path
                                                        key={`path-${activeScenario.id}-${i}`}
                                                        d={path.d}
                                                        fill="none"
                                                        stroke={
                                                            showResults
                                                                ? (path.stroke === 'risk' ? "url(#riskGrad)" : path.stroke === 'warning' ? "url(#warnGrad)" : "#10b981")
                                                                : "#334155"
                                                        }
                                                        strokeWidth={path.stroke === 'safe' ? 2 : 3}
                                                        strokeDasharray={path.stroke === 'safe' ? "0" : "5,5"}
                                                        initial={{ pathLength: 0 }}
                                                        animate={{ pathLength: 1 }}
                                                        transition={{ duration: 1 }}
                                                    />
                                                ))}
                                            </svg>

                                            {activeScenario.graph.nodes.map((node, i) => (
                                                <motion.div
                                                    key={`node-${activeScenario.id}-${i}`}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="absolute z-10 flex flex-col items-center gap-2"
                                                    style={{ left: node.x, top: node.y }}
                                                >
                                                    <div className={`w-20 h-20 rounded-xl bg-[#0F172A] border-2 flex flex-col items-center justify-center relative transition-all duration-500 ${!showResults ? 'border-border-muted' :
                                                        (node.status === 'risk' ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' :
                                                            node.status === 'warning' ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' :
                                                                node.status === 'deploying' ? 'border-blue-500' :
                                                                    'border-emerald-500/50 opacity-80')
                                                        }`}>
                                                        {node.status === 'deploying' && (
                                                            <div className="absolute -top-2.5 px-2 py-0.5 rounded bg-blue-600 text-white text-[9px] font-bold uppercase">
                                                                Target
                                                            </div>
                                                        )}
                                                        <Server size={24} className={
                                                            !showResults ? "text-text-muted" :
                                                                (node.status === 'risk' ? "text-red-400" :
                                                                    node.status === 'warning' ? "text-amber-400" :
                                                                        node.status === 'deploying' ? "text-blue-400" : "text-emerald-400")
                                                        } />
                                                        <span className="text-[10px] font-bold text-white mt-1">{node.label}</span>
                                                        <span className="text-[9px] font-mono text-text-muted">{node.sub}</span>

                                                        {showResults && node.risk && (
                                                            <div className={`absolute -bottom-3 px-1.5 py-0.5 rounded text-[9px] font-bold whitespace-nowrap ${node.status === 'risk' ? 'bg-red-500 text-white' : 'bg-amber-500 text-black'
                                                                }`}>
                                                                {node.risk}
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Insights Panel */}
                        <div className="bg-card-bg rounded-xl border border-border-muted flex flex-col overflow-hidden shadow-lg">
                            <div className="p-4 border-b border-border-muted bg-white/5">
                                <h2 className="font-bold text-white text-sm">Impact Assessment</h2>
                            </div>

                            <div className="p-4 flex-1 overflow-y-auto space-y-5">
                                {!showResults ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50 gap-2">
                                        <TrendingUp size={32} />
                                        <p className="text-xs">Awaiting Analysis...</p>
                                    </div>
                                ) : (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        {/* Reliability */}
                                        <div className="space-y-2">
                                            <h3 className="text-[10px] uppercase tracking-wider text-text-muted font-bold flex items-center gap-1">
                                                <TrendingUp size={12} /> Reliability
                                            </h3>
                                            <div className={`border rounded-lg p-3 ${activeScenario.riskLevel === 'Low' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-red-500/5 border-red-500/10'
                                                }`}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`font-semibold text-sm ${activeScenario.riskLevel === 'Low' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {activeScenario.insights.reliability.title}
                                                    </span>
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${activeScenario.riskLevel === 'Low' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                                                        }`}>
                                                        {activeScenario.insights.reliability.prob}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-text-muted leading-relaxed">
                                                    {activeScenario.insights.reliability.desc}
                                                </p>
                                            </div>
                                        </div>

                                        {/* FinOps */}
                                        <div className="space-y-2">
                                            <h3 className="text-[10px] uppercase tracking-wider text-text-muted font-bold flex items-center gap-1">
                                                <DollarSign size={12} /> FinOps Projection
                                            </h3>
                                            <div className="border border-border-muted rounded-lg p-3 relative overflow-hidden bg-[#111]">
                                                <div className="flex items-baseline justify-between">
                                                    <span className="text-xs text-text-muted">Waste/Mo</span>
                                                    <span className={`text-xl font-bold ${activeScenario.riskLevel === 'Low' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                        {activeScenario.insights.finops.waste}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-text-muted mt-1">
                                                    {activeScenario.insights.finops.cause}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action */}
                                        <div className="mt-4 pt-4 border-t border-white/5">
                                            <p className="text-xs text-blue-300 mb-2 font-medium">
                                                AI Recommends: <span className="text-white font-normal">{activeScenario.insights.recommendation}</span>
                                            </p>
                                            {activeScenario.riskLevel === 'Low' ? (
                                                <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded">
                                                    Proceed to Deploy
                                                </button>
                                            ) : (
                                                <button className="w-full py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded">
                                                    Abort & Rollback
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlastRadius;
