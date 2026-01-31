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
    Lock,
    Sparkles,
    Loader2,
    Check
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
                { id: '1', label: 'Payment', sub: 'v2.4.0', type: 'origin', x: 100, y: 150, status: 'deploying' },
                { id: '2', label: 'Checkout', sub: 'Critical', type: 'target', x: 400, y: 80, status: 'risk', risk: '92% Prop. Risk' },
                { id: '3', label: 'Analytics', sub: 'High Load', type: 'target', x: 400, y: 220, status: 'warning', risk: '45% Prop. Risk' },
            ],
            // Paths will be auto-generated to ensure perfect alignment
            paths: []
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

    // Auto-calculate paths if not provided or if we want to enforce perfect connections
    // Node dimensions: 72x72. 
    // Origin Right Connect: x + 36 + padding (say 5px) -> x + 41
    // Target Left Connect: x - 36 - padding -> x - 41
    // Layout Constants
    const CARD_WIDTH = 220;
    const CARD_HEIGHT = 70;
    const HORIZONTAL_GAP = 400; // Increased spacing to encourage "overflow" scrolling experience
    const START_X = 80; // Increased left padding

    // Auto-calculate layout to fix alignments
    const layout = React.useMemo(() => {
        if (!data.graph.nodes) return { nodes: [], paths: [], width: 800, height: 600 };

        const targets = data.graph.nodes.filter(n => n.type === 'target');
        const origin = data.graph.nodes.find(n => n.type === 'origin');

        if (!origin) return { nodes: [], paths: [], width: 800, height: 600 };

        // Dynamic Height Calculation
        const SLOT_HEIGHT = 180; // Increased vertical spacing for a larger map feel
        const totalHeight = targets.length * SLOT_HEIGHT;
        const minCanvasHeight = 600;
        const canvasHeight = Math.max(minCanvasHeight, totalHeight + 100);

        // Center vertically in the canvas
        const startY = Math.max(50, (canvasHeight - totalHeight) / 2);

        // Reposition Nodes
        const processedNodes = [];

        // 1. Position Targets in a column
        targets.forEach((node, i) => {
            processedNodes.push({
                ...node,
                x: START_X + HORIZONTAL_GAP,
                y: startY + (i * SLOT_HEIGHT),
                type: 'target'
            });
        });

        // 2. Position Origin centered to the left relative to targets
        const midY = processedNodes.reduce((sum, n) => sum + n.y, 0) / processedNodes.length || (canvasHeight / 2);
        processedNodes.push({
            ...origin,
            x: START_X,
            y: midY,
            type: 'origin'
        });

        // 3. Calculate Paths
        const paths = processedNodes.filter(n => n.type === 'target').map(target => {
            const startX = START_X + CARD_WIDTH; // Right side of origin
            const startY = midY + (CARD_HEIGHT / 2); // Center of origin
            const endX = target.x; // Left side of target
            const endY = target.y + (CARD_HEIGHT / 2); // Center of target

            const cp1x = startX + (endX - startX) * 0.5;
            const cp2x = endX - (endX - startX) * 0.5;

            return {
                d: `M ${startX} ${startY} C ${cp1x} ${startY}, ${cp2x} ${endY}, ${endX} ${endY}`,
                status: target.status
            };
        });

        const canvasWidth = START_X + HORIZONTAL_GAP + CARD_WIDTH + 100; // Added explicit right padding

        return { nodes: processedNodes, paths, width: canvasWidth, height: canvasHeight };
    }, [data]);

    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [showResults, setShowResults] = useState(false);
    const [actionStatus, setActionStatus] = useState('idle'); // idle, blocking, allowing, success

    const handleBlock = () => {
        setActionStatus('blocking');
        setTimeout(() => {
            setActionStatus('success');
            setTimeout(onClose, 1000);
        }, 1500);
    };

    const handleAllow = () => {
        setActionStatus('allowing');
        setTimeout(() => {
            setActionStatus('success');
            setTimeout(onClose, 1000);
        }, 1500);
    };

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
                className="bg-[#0F1115] border border-border-muted rounded-xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative"
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
                        <div className="absolute top-4 left-4 z-10 flex gap-4">
                            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
                                <GitBranch size={14} /> Dependency Map
                            </div>
                        </div>

                        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-[10px] text-text-muted">Live Telemetry</span>
                        </div>

                        <div className="h-full w-full overflow-auto custom-scrollbar p-12">
                            <AnimatePresence mode='wait'>
                                {isAnalyzing ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center gap-4 py-8"
                                    >
                                        <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                                        <div className="text-sm text-text-muted font-mono animate-pulse">Querying Sentinel Decision Layer...</div>
                                    </motion.div>
                                ) : (
                                    <div
                                        className="relative mx-auto"
                                        style={{ width: layout.width, height: layout.height }}
                                    >
                                        <svg className="absolute inset-0 w-full h-full overflow-visible z-0 pointer-events-none">
                                            <defs>
                                                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                                                    <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
                                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                                                </linearGradient>
                                                <filter id="glow">
                                                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                                    <feMerge>
                                                        <feMergeNode in="coloredBlur" />
                                                        <feMergeNode in="SourceGraphic" />
                                                    </feMerge>
                                                </filter>
                                            </defs>

                                            {layout.paths.map((path, i) => (
                                                <g key={`path-${i}`}>
                                                    {/* Background Line */}
                                                    <path
                                                        d={path.d}
                                                        fill="none"
                                                        stroke={path.status === 'risk' ? '#f87171' : path.status === 'warning' ? '#fbbf24' : '#475569'}
                                                        strokeWidth={1}
                                                        strokeOpacity={0.2}
                                                    />
                                                    {/* Animated Active Line */}
                                                    <motion.path
                                                        d={path.d}
                                                        fill="none"
                                                        stroke={path.status === 'risk' ? '#f87171' : path.status === 'warning' ? '#fbbf24' : '#60a5fa'}
                                                        strokeWidth={1.5}
                                                        strokeOpacity={0.6}
                                                        filter="url(#glow)"
                                                        initial={{ pathLength: 0, opacity: 0 }}
                                                        animate={{ pathLength: 1, opacity: 1 }}
                                                        transition={{ duration: 1.2, delay: i * 0.1, ease: "easeOut" }}
                                                    />
                                                    {/* Subtle Flow Particle (Minimal) */}
                                                    <motion.circle r="2" fill="#fff">
                                                        <animateMotion dur="3s" repeatCount="indefinite" path={path.d} keyPoints="0;1" keyTimes="0;1">
                                                        </animateMotion>
                                                    </motion.circle>
                                                </g>
                                            ))}
                                        </svg>

                                        {layout.nodes.map((node, i) => (
                                            <motion.div
                                                key={`node-${i}`}
                                                initial={{ opacity: 0, x: node.type === 'origin' ? -20 : 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.5 + (i * 0.1) }}
                                                className="absolute"
                                                style={{ left: node.x, top: node.y }}
                                            >
                                                <div className={`
                                                    relative w-[220px] h-[70px] flex items-center p-3 gap-3 
                                                    bg-[#0F172A] border rounded-xl shadow-lg z-10 overflow-hidden
                                                    ${node.status === 'risk' ? 'border-red-500/50 shadow-red-900/20' :
                                                        node.status === 'warning' ? 'border-amber-500/50 shadow-amber-900/20' :
                                                            node.status === 'deploying' ? 'border-blue-500/50 shadow-blue-900/20' :
                                                                'border-border-muted'}
                                                `}>
                                                    {/* Status Line */}
                                                    <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${node.status === 'risk' ? 'bg-red-500' :
                                                        node.status === 'warning' ? 'bg-amber-500' :
                                                            node.status === 'deploying' ? 'bg-blue-500' :
                                                                'bg-emerald-500'
                                                        }`} />

                                                    {/* Icon Box */}
                                                    <div className={`
                                                        w-10 h-10 rounded-md flex items-center justify-center shrink-0
                                                        ${node.status === 'risk' ? 'bg-red-500/10 text-red-500' :
                                                            node.status === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                                                                node.status === 'deploying' ? 'bg-blue-500/10 text-blue-500' :
                                                                    'bg-emerald-500/10 text-emerald-500'}
                                                    `}>
                                                        <Server size={20} />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0 overflow-hidden">
                                                        <div className="flex justify-between items-start">
                                                            <div className="text-sm font-semibold text-white truncate w-full">{node.label}</div>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-0.5 overflow-hidden">
                                                            {node.sub && (
                                                                <span className="text-[9px] text-text-muted font-mono bg-white/5 px-1.5 py-0.5 rounded truncate max-w-[80px]">
                                                                    {node.sub}
                                                                </span>
                                                            )}
                                                            {node.risk && (
                                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border truncate max-w-[80px] ${node.status === 'risk' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                                    }`}>
                                                                    {node.risk}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
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
                                {/* Sentinel Generative Insight */}
                                <div className="relative">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl blur opacity-30"></div>
                                    <div className="relative p-3 rounded-xl bg-black border border-white/10">
                                        <h3 className="text-[10px] uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 font-bold flex items-center gap-1 mb-2">
                                            <Sparkles size={12} className="text-amber-400" /> Predictive Analysis
                                        </h3>
                                        <p className="text-xs text-text-main leading-relaxed">
                                            {data.insights.generative || "Based on telemetry patterns, this change introduces a race condition in the checkout loop. Immediate degradation of downstream Analytics predicted."}
                                        </p>
                                    </div>
                                </div>

                                {/* Reliability */}
                                <div>
                                    <h3 className="text-[10px] uppercase tracking-wider text-text-muted font-bold flex items-center gap-1 mb-2">
                                        <TrendingUp size={12} /> Reliability Risk
                                    </h3>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
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
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                        <div className="text-2xl font-bold text-amber-500">{data.insights.finops.waste}</div>
                                        <div className="text-xs text-text-muted mt-1">{data.insights.finops.cause}</div>
                                    </div>
                                </div>

                                {/* Action */}
                                <div className="pt-4 border-t border-white/10">
                                    <p className="text-xs text-blue-300 mb-3 font-medium">Rec: <span className="text-white font-normal">{data.insights.recommendation}</span></p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={handleBlock}
                                            disabled={actionStatus !== 'idle'}
                                            className="py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-red-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                                        >
                                            {actionStatus === 'blocking' ? (
                                                <><Loader2 size={14} className="animate-spin" /> Blocking...</>
                                            ) : actionStatus === 'success' && actionStatus !== 'allowing' ? (
                                                <><Check size={14} /> Halted</>
                                            ) : (
                                                "Block Deployment"
                                            )}
                                        </button>
                                        <button
                                            onClick={handleAllow}
                                            disabled={actionStatus !== 'idle'}
                                            className="py-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold rounded-lg backdrop-blur-sm transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                                        >
                                            {actionStatus === 'allowing' ? (
                                                <><Loader2 size={14} className="animate-spin" /> Approving...</>
                                            ) : actionStatus === 'success' && actionStatus !== 'blocking' ? (
                                                <><Check size={14} /> Approved</>
                                            ) : (
                                                "Allow & Monitor"
                                            )}
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
