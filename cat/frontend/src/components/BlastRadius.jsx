import React, { useState } from 'react';
import Card from './Card';
import { detectIncidentType, generateTelemetry } from '../utils/ai-logic';

const BlastRadius = () => {
    const [status, setStatus] = useState('idle'); // idle, analyzing, results
    const [result, setResult] = useState(null);

    const handleAnalyze = async () => {
        setStatus('analyzing');

        try {
            const response = await fetch('http://localhost:8000/predict/impact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    service: 'payment-service',
                    version_from: 'v2.3',
                    version_to: 'v2.4',
                    changes: ['memory_increase', 'api_call_frequency_increase']
                })
            });

            if (response.ok) {
                const data = await response.json();

                // Map Backend Response to UI Result Format
                setResult({
                    type: data.risk_score > 50 ? 'Incident' : 'Normal',
                    severity: data.risk_score > 80 ? 'Critical' : (data.risk_score > 50 ? 'High' : 'Low'),
                    confidence: data.risk_score / 100, // Normalize 0-100 to 0-1
                    description: `Change affects ${data.blast_radius.length} services: ${data.blast_radius.join(', ')}. Est. cost impact: $${data.cost_impact.total}/mo.`,
                    indicators: [...data.warnings, `Cost Impact: $${data.cost_impact.total}`],
                    raw: data // Keep raw for cost card mapping
                });
                setStatus('results');
            } else {
                setStatus('idle');
            }
        } catch (e) {
            console.error(e);
            setStatus('idle');
        }
    };

    const handleReset = () => {
        setStatus('idle');
        setResult(null);
    };

    // Helper to get color theme based on severity
    const getTheme = (severity) => {
        switch (severity) {
            case 'Critical': return { bg: 'bg-red-950/40', border: 'border-red-500/30', text: 'text-red-400', icon: 'bg-red-500', button: 'bg-red-600 hover:bg-red-500' };
            case 'High': return { bg: 'bg-orange-950/40', border: 'border-orange-500/30', text: 'text-orange-400', icon: 'bg-orange-500', button: 'bg-orange-600 hover:bg-orange-500' };
            case 'Medium': return { bg: 'bg-amber-950/40', border: 'border-amber-500/30', text: 'text-amber-400', icon: 'bg-amber-500', button: 'bg-amber-600 hover:bg-amber-500' };
            case 'Low': return { bg: 'bg-emerald-950/40', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: 'bg-emerald-500', button: 'bg-emerald-600 hover:bg-emerald-500' };
            default: return { bg: 'bg-slate-800', border: 'border-slate-700', text: 'text-slate-400', icon: 'bg-slate-500', button: 'bg-slate-600' };
        }
    };

    const theme = result ? getTheme(result.severity) : {};

    return (
        <div className="h-full overflow-y-auto w-full pr-2">
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">

                {status === 'idle' && (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold text-white">
                                Pre-Deployment Risk Analyzer
                            </h2>
                            <p className="text-slate-400">Simulate deployment impacts before merging to production.</p>
                        </div>

                        <Card className="w-full max-w-lg border-t-4 border-t-blue-500">
                            <div className="space-y-6">
                                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 flex items-center justify-between">
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Target Service</div>
                                        <div className="text-lg font-mono text-slate-200 mt-1">payment-service</div>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 flex items-center justify-between">
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Version Transition</div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="px-2 py-1 rounded bg-slate-800 text-slate-400 font-mono text-sm border border-slate-700">v2.3.0</span>
                                            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                            <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 font-mono text-sm border border-emerald-500/20">v2.4.0-rc1</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAnalyze}
                                    className="w-full py-4 bg-white text-slate-900 hover:bg-slate-200 rounded-lg font-bold text-lg shadow-sm transition-all duration-200"
                                >
                                    Analyze Impact
                                </button>
                            </div>
                        </Card>
                    </div>
                )}

                {status === 'analyzing' && (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
                        <div className="relative">
                            <div className="w-24 h-24 border-4 border-slate-800 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-24 h-24 border-4 border-t-blue-500 border-r-sky-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 bg-blue-500/10 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-medium text-white">AI Analyzing Dependency Graph...</h3>
                            <p className="text-slate-400 text-sm">Tracing 142 microservice interactions</p>
                        </div>

                        {/* Fake console logs for effect */}
                        <div className="w-full max-w-md bg-slate-950/50 rounded-lg p-4 font-mono text-xs space-y-1 text-slate-500 overflow-hidden border border-slate-800/50">
                            <div className="animate-pulse delay-75">[analyzer] Parsing AST for payment-service...</div>
                            <div className="animate-pulse delay-150 text-blue-400/80">✔ Found new database migration</div>
                            <div className="animate-pulse delay-300">⟳ Simulating load on checkout-api</div>
                            <div className="animate-pulse delay-500 text-amber-400/80">⚠ Detected schema breaking change</div>
                        </div>
                    </div>
                )}

                {status === 'results' && result && (
                    <div className="space-y-6 pb-20">

                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
                            <button onClick={handleReset} className="text-sm text-slate-400 hover:text-white underline decoration-slate-600 hover:decoration-white transition-all">
                                Run New Analysis
                            </button>
                        </div>

                        {/* Dynamic Risk Banner */}
                        <div className={`${theme.bg} border ${theme.border} rounded-xl p-6 relative overflow-hidden group`}>
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <div className={`flex items-center gap-2 ${theme.text} font-bold tracking-wider text-sm uppercase mb-2`}>
                                        <span className={`w-2 h-2 rounded-full ${theme.icon} animate-pulse`}></span>
                                        {result.type === 'Normal' ? 'Deployment Safe' : `${result.severity} Risk Detected`}
                                    </div>
                                    <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                                        {(result.confidence * 100).toFixed(0)}% <span className={`text-2xl md:text-3xl font-normal opacity-60`}>Confidence</span>
                                    </h3>
                                    <p className="mt-2 text-slate-300 max-w-xl">
                                        {result.description}
                                    </p>
                                    {/* Show specific indicators */}
                                    {result.indicators && result.indicators.length > 0 && (
                                        <ul className="mt-4 space-y-1">
                                            {result.indicators.slice(0, 3).map((ind, i) => (
                                                <li key={i} className="text-sm text-slate-400 flex items-center gap-2">
                                                    <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                                                    {ind}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div className="flex-shrink-0">
                                    <button className={`px-6 py-3 ${theme.button} text-white rounded-lg font-semibold shadow-sm transition-colors`}>
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Cost Forecast */}
                            <Card title="Monthly Cost Forecast" className="h-full">
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-3xl font-bold text-white">+${result?.raw?.cost_impact?.total || '1,247'}</span>
                                    <span className="text-slate-400">/month projected</span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
                                        <span className="text-slate-300">Compute (EC2)</span>
                                        <span className="font-mono text-slate-400">+${result?.raw?.cost_impact?.compute || '120.00'}</span>
                                    </div>

                                    <div className="flex justify-between items-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <span className="text-orange-200 font-medium">Hidden Egress Cost</span>
                                        </div>
                                        <span className="font-mono font-bold text-orange-400">+${result?.raw?.cost_impact?.egress || '322.00'}</span>
                                    </div>

                                    <div className="flex justify-between items-center p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
                                        <span className="text-slate-300">Database IOPS</span>
                                        <span className="font-mono text-slate-400">+$805.00</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Blast Radius Visualization */}
                            <Card title="Blast Radius Map" className="h-full bg-slate-900">
                                <div className="relative h-64 border border-slate-700/50 rounded-lg bg-grid-slate-800/50 flex items-center justify-center p-4">
                                    {/* Connections lines would nominally be absolute positioned or SVG, simplified here for pure CSS */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                        <path d="M150 128 L 350 80" stroke="#64748b" strokeWidth="2" strokeDasharray="4" />
                                        <path d="M150 128 L 350 176" stroke="#64748b" strokeWidth="2" strokeDasharray="4" />
                                    </svg>

                                    {/* Nodes */}
                                    <div className="absolute left-10 md:left-20 flex flex-col items-center z-10">
                                        <div className="w-16 h-16 rounded-xl bg-blue-600 shadow-[0_0_20px_rgb(37,99,235,0.5)] border-2 border-white/20 flex items-center justify-center mb-2">
                                            <span className="font-bold text-white text-xs">Payment</span>
                                        </div>
                                    </div>

                                    <div className="absolute right-10 md:right-20 flex flex-col gap-12 z-10">
                                        <div className="flex items-center gap-3 bg-slate-800 p-2 rounded-lg border border-slate-600 shadow-xl">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <div className="text-sm font-medium text-slate-200">Checkout Service</div>
                                        </div>

                                        <div className="flex items-center gap-3 bg-slate-800 p-2 rounded-lg border border-slate-600 shadow-xl">
                                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                            <div className="text-sm font-medium text-slate-200">API Gateway</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 text-xs text-center text-slate-500">
                                    Visualizing direct downstream dependencies
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlastRadius;
