import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { toast } from 'sonner';
import { Activity, Server, Zap, CheckCircle, AlertTriangle, Clock, ArrowUp, ArrowDown, Cpu, Layers, DollarSign, Brain, Loader2 } from 'lucide-react';
import Card from './Card';
import CorrelationAnalysis from './CorrelationAnalysis';
import BlastRadiusColumn from './BlastRadiusModal';

import { getDashboardMetrics, getBlastRadiusData } from '../utils/dataProvider';
import { apiClient } from '../utils/api';

const Dashboard = () => {
    // Top-level mock metrics
    const [metrics, setMetrics] = useState({
        responseTime: 124,
        successRate: 99.98,
        activeIncidents: 0,
        cpuUsage: 42,
        // Added for dataProvider compatibility
        requests: '2500/s',
        cost: '$0'
    });

    const [isDisasterMode, setIsDisasterMode] = useState(false);
    const [activeDeploy, setActiveDeploy] = useState(false);
    const [chartData, setChartData] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const [lastScanResults, setLastScanResults] = useState(null);
    const [isBlastRadiusOpen, setIsBlastRadiusOpen] = useState(false);
    const [selectedBlastService, setSelectedBlastService] = useState(null);
    const [currentVersion, setCurrentVersion] = useState("v2.3.0");
    const [canaryStatus, setCanaryStatus] = useState("Ready for Release");
    const blastData = getBlastRadiusData();

    // Generate initial chart data
    // Live Chart Data Updates
    // Live Chart Data Updates
    const disasterRef = useRef(isDisasterMode);

    useEffect(() => {
        disasterRef.current = isDisasterMode;
    }, [isDisasterMode]);

    useEffect(() => {
        // Generate high-resolution initial history (60 points)
        const now = new Date();
        const generateInitialData = (zeroed = false) => {
            return Array.from({ length: 60 }, (_, i) => {
                const t = new Date(now.getTime() - (60 - i) * 1000);
                const sineWave = Math.sin(i * 0.1);
                return {
                    time: t.toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
                    traffic: zeroed ? 0 : 2500 + (sineWave * 500) + (Math.random() * 200),
                    cpu: zeroed ? 0 : 40 + (sineWave * 10) + (Math.random() * 5),
                    latency: zeroed ? 0 : 100 + (Math.random() * 15)
                };
            });
        };

        // Initialize with zeros to force animation from baseline
        setChartData(generateInitialData(true));

        // Transition to real history after a frame to trigger Recharts animation
        const initialTransition = setTimeout(() => {
            setChartData(generateInitialData(false));
        }, 100);

        // Counter for continuous wave generation
        let tick = 60;

        // Start live interval AFTER entrance animation (1.5s) to prevent jitter
        let interval;
        const startLiveUpdates = setTimeout(() => {
            interval = setInterval(() => {
                setChartData(prevData => {
                    if (!prevData || prevData.length === 0) return prevData;

                    const newData = [...prevData.slice(1)];
                    const now = new Date();
                    tick += 0.1;

                    const sineWave = Math.sin(tick);
                    const isDisaster = disasterRef.current;
                    const baseLatency = isDisaster ? 500 : 100;
                    const latencyNoise = isDisaster ? 100 : 15;

                    newData.push({
                        time: now.toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
                        traffic: 2500 + (sineWave * 500) + (Math.random() * 200),
                        cpu: 40 + (sineWave * 10) + (Math.random() * 5),
                        latency: baseLatency + (Math.random() * latencyNoise)
                    });
                    return newData;
                });
            }, 1000);
        }, 1600);

        return () => {
            clearTimeout(initialTransition);
            clearTimeout(startLiveUpdates);
            if (interval) clearInterval(interval);
        };
    }, []); // Empty dependency array ensures chart history is preserved

    // Load Metrics from Local Data Provider
    // Poll Metrics from Data Provider
    useEffect(() => {
        const fetchMetrics = (randomize = false) => {
            const data = getDashboardMetrics({ randomize });
            setMetrics(prev => ({
                ...prev,
                activeIncidents: data.isAnomaly ? 1 : 0,
                cpuUsage: parseInt(data.cpu.value),
                requests: data.requests.value,
                cost: data.cost.value
            }));
            // Only auto-trigger disaster mode if strictly required, otherwise let user toggle
            // if (data.isAnomaly) setIsDisasterMode(true);
        };

        fetchMetrics(false); // Initial fetch: Deterministic (server match)
        const interval = setInterval(() => fetchMetrics(true), 2000); // Live updates: Randomize

        return () => clearInterval(interval);
    }, []);

    const handleDeploy = async () => {
        setActiveDeploy(true);

        // UI feedback simulation
        setTimeout(() => {
            setActiveDeploy(false);

            // FORCE FAILURE for Hackathon Demo ("Happy Path" to show Blast Radius)
            // In a real scenario, this would depend on the canary health
            const isBroken = true;

            if (isBroken) {
                setIsDisasterMode(true);
                setCurrentVersion("v2.4.0 (Canary)");
                setCanaryStatus("Critical Failure Detected");
                toast.error("Deployment Failed: Latency Spike Detected!", {
                    description: "Rolling monitoring activated. Suggest immediate rollback.",
                    style: { background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5' }
                });
            }
        }, 3000);
    };

    const handleRollback = () => {
        setIsDisasterMode(false);
        setCurrentVersion("v2.3.0");
        setCanaryStatus("Rolled Back");
        toast.success('Rollback successful', {
            description: 'Traffic reverted to v2.3.0. Services recovering.',
            style: { background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#6ee7b7' },
        });
    };

    const handleMLScan = async (service = 'payment-service') => {
        setIsScanning(true);
        try {
            toast.loading('Initiating ML scan...', { id: 'ml-scan' });

            const scanResults = await apiClient.triggerMLScan(service);

            setLastScanResults(scanResults);

            // Update disaster mode based on ML results
            if (scanResults.anomaly?.is_anomaly) {
                setIsDisasterMode(true);
                toast.error('Anomaly Detected!', {
                    id: 'ml-scan',
                    description: `ML models detected ${scanResults.anomaly.anomaly_type || 'unusual patterns'} in ${service}`,
                    duration: 5000,
                    style: { background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5' },
                });
            } else {
                toast.success('ML Scan Complete', {
                    id: 'ml-scan',
                    description: `No anomalies detected in ${service}. Systems operating normally.`,
                    duration: 4000,
                    style: { background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#6ee7b7' },
                });
            }
        } catch (error) {
            toast.error('ML Scan Failed', {
                id: 'ml-scan',
                description: error.message || 'Failed to connect to ML service',
                duration: 5000,
                style: { background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5' },
            });
        } finally {
            setIsScanning(false);
        }
    };

    const services = [
        { name: 'API Gateway', id: 'api', status: 'Operational', uptime: '99.99%' },
        { name: 'Auth Service', id: 'auth', status: 'Operational', uptime: '99.95%' },
        { name: 'Payment Service', id: 'payment', status: isDisasterMode ? 'Degraded' : 'Operational', uptime: isDisasterMode ? '85.00%' : '99.99%' },
        { name: 'Checkout Service', id: 'checkout', status: 'Operational', uptime: '99.90%' },
        { name: 'Database Cluster', id: 'db', status: 'Operational', uptime: '99.99%' },
        { name: 'Notification Svc', id: 'notif', status: 'Operational', uptime: '99.92%' },
    ];

    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsInitialLoad(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex flex-col gap-6 min-h-full text-text-main">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
                <MetricCard
                    label="System Status"
                    value={isDisasterMode ? "Critical" : "Operational"}
                    icon={Activity}
                    trend={isDisasterMode ? (
                        <button
                            onClick={() => {
                                setSelectedBlastService('payment-service');
                                setIsBlastRadiusOpen(true);
                            }}
                            className="flex items-center gap-1 text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors"
                        >
                            <Zap size={10} /> ANALYZE IMPACT
                        </button>
                    ) : "All systems normal"}
                    color={isDisasterMode ? "text-red-500" : "text-emerald-500"}
                    bg={isDisasterMode ? "bg-red-500/10" : "bg-emerald-500/10"}
                />
                <MetricCard
                    label="Avg. Response Time"
                    value={`${metrics.responseTime}ms`}
                    icon={Zap}
                    trend={isDisasterMode ? "+850ms vs avg" : "-12ms vs avg"}
                    color={metrics.responseTime > 500 ? "text-amber-500" : "text-blue-500"}
                    bg={metrics.responseTime > 500 ? "bg-amber-500/10" : "bg-blue-500/10"}
                />
                <MetricCard
                    label="Throughput"
                    value={metrics.requests}
                    icon={CheckCircle}
                    trend={isDisasterMode ? "+High Load" : "Normal"}
                    color={isDisasterMode ? "text-amber-500" : "text-emerald-500"}
                    bg={isDisasterMode ? "bg-amber-500/10" : "bg-emerald-500/10"}
                />
                <MetricCard
                    label="Cloud Cost Efficiency"
                    value={metrics.cost}
                    icon={DollarSign}
                    trend={isDisasterMode ? "Waste Detected" : "Optimal"}
                    color={isDisasterMode ? "text-amber-500" : "text-emerald-500"}
                    bg={isDisasterMode ? "bg-amber-500/10" : "bg-emerald-500/10"}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
                {/* Main and Secondary Charts */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        viewport={{ once: true }}
                    >
                        <Card title="System Latency (Real-time)" className="w-full h-[320px]">
                            <div className="h-full w-full min-h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                        <defs>
                                            <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={isDisasterMode ? "#ef4444" : "#3b82f6"} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={isDisasterMode ? "#ef4444" : "#3b82f6"} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3b" vertical={false} opacity={0.5} />
                                        <XAxis
                                            dataKey="time"
                                            stroke="#64748b"
                                            tickLine={false}
                                            axisLine={false}
                                            fontSize={10}
                                            minTickGap={60} // Increased gap to prevent overlap and overflow
                                            dy={10} // Offset tick labels downward
                                        />
                                        <YAxis
                                            stroke="#64748b"
                                            tickLine={false}
                                            axisLine={false}
                                            fontSize={10}
                                            tickFormatter={(value) => `${value}ms`}
                                            width={50}
                                            domain={[0, dataMax => Math.max(200, Math.ceil(dataMax * 1.2))]}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }}
                                            itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                                            labelStyle={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="latency"
                                            stroke={isDisasterMode ? "#ef4444" : "#3b82f6"}
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorTraffic)"
                                            isAnimationActive={isInitialLoad}
                                            animationDuration={1500}
                                            animationEasing="ease-in-out"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </motion.div>
                    {/* Service Mesh Health moved here */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="text-lg font-bold text-text-main mb-4">Service Mesh Health</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {services.map((service) => {
                                // Dynamic Simulation Logic
                                let status = 'Operational';
                                let statusColor = 'text-text-muted';
                                let dotColor = 'bg-emerald-500';
                                let borderColor = 'border-border-muted';
                                let bgColor = 'bg-card-bg';

                                if (isDisasterMode) {
                                    if (service.id === 'payment') {
                                        status = 'Critical Fail';
                                        statusColor = 'text-red-400';
                                        dotColor = 'bg-red-500 animate-ping';
                                        borderColor = 'border-red-500/50';
                                        bgColor = 'bg-red-500/10';
                                    } else if (service.id === 'checkout') {
                                        status = 'Degraded';
                                        statusColor = 'text-amber-400';
                                        dotColor = 'bg-amber-500';
                                        borderColor = 'border-amber-500/50';
                                        bgColor = 'bg-amber-500/10';
                                    } else if (service.id === 'notif') {
                                        status = 'High Latency';
                                        statusColor = 'text-amber-400';
                                        dotColor = 'bg-amber-500';
                                        borderColor = 'border-amber-500/50';
                                        bgColor = 'bg-amber-500/10';
                                    }
                                }

                                return (
                                    <div
                                        key={service.name}
                                        onClick={() => {
                                            if (status !== 'Operational') {
                                                setSelectedBlastService(service.name);
                                                setIsBlastRadiusOpen(true);
                                            }
                                        }}
                                        className={`p-4 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer ${borderColor} ${bgColor}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <Server size={18} className={`flex-shrink-0 ${statusColor}`} />
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
                                        </div>
                                        <h4 className="font-semibold text-sm text-text-main truncate" title={service.name}>{service.name}</h4>
                                        <div className="flex justify-between items-end mt-2">
                                            <span className={`text-xs px-2 py-1 rounded-md cursor-pointer font-bold transition-all hover:scale-105 hover:shadow-lg ${status === 'Operational' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                status === 'Critical Fail' ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-red-500/20' :
                                                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                }`}
                                            >
                                                {status !== 'Operational' ? (
                                                    <span className="flex items-center gap-1">
                                                        <Activity size={10} /> Analyze Impact
                                                    </span>
                                                ) : 'Healthy'}
                                            </span>
                                            <span className="text-xs text-text-muted font-mono">{service.uptime}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Correlation Analysis moved here */}
                    <div className="flex-1 mt-auto">
                        <CorrelationAnalysis />
                    </div>
                </div>

                {/* Right Column: Deployment & Activity */}
                <div className="flex flex-col gap-6">
                    {/* Deployment Control */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="bg-card-bg border border-border-muted rounded-xl p-6 shadow-sm hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                    >
                        <h3 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                            <Layers size={20} className="text-blue-500" /> Deployment
                        </h3>
                        <div className="space-y-4">
                            <div className="p-3 rounded-lg bg-black/20 border border-border-muted">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-text-muted">Current Version</span>
                                    <span className={`font-mono ${isDisasterMode ? 'text-red-400 font-bold' : 'text-emerald-400'}`}>{currentVersion}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted">Canary Status</span>
                                    <span className="text-text-main">{canaryStatus}</span>
                                </div>
                            </div>

                            {!isDisasterMode ? (
                                <button
                                    onClick={handleDeploy}
                                    disabled={activeDeploy}
                                    className="w-full py-2 px-4 bg-blue-600/90 hover:bg-blue-600 text-white rounded-lg font-semibold shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group focus:ring-2 ring-blue-500/50 ring-offset-2 ring-offset-[#0F1115]"
                                >
                                    {activeDeploy ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin text-white/80" />
                                            <span className="text-white/90">Deploying Canary...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ArrowUp size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                                            <span>Deploy v2.4 (Canary)</span>
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={handleRollback}
                                    className="w-full py-2 px-4 bg-red-600/90 hover:bg-red-600 text-white rounded-lg font-semibold shadow-sm border border-red-500/10 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2 group animate-pulse hover:animate-none"
                                >
                                    <ArrowDown size={18} className="group-hover:translate-y-0.5 transition-transform" />
                                    <span>Emergency Rollback to v2.3</span>
                                </button>
                            )}
                        </div>
                    </motion.div>

                    {/* ML Scan Control */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="bg-card-bg border border-border-muted rounded-xl p-6 shadow-sm hover:border-purple-500/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                    >
                        <h3 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                            <Brain size={20} className="text-purple-500" /> ML Analysis
                        </h3>
                        {/* ... existing content ... */}
                        <div className="space-y-4">
                            <div className="p-3 rounded-lg bg-black/20 border border-border-muted">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-text-muted">ML Models Status</span>
                                    <span className="text-emerald-400 text-sm">● Active</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted">Last Scan</span>
                                    <span className="text-text-main">{lastScanResults ? 'Just now' : 'Never'}</span>
                                </div>
                                {lastScanResults && (
                                    <div className="mt-2 text-xs">
                                        <span className={`px-2 py-1 rounded ${lastScanResults.anomaly?.is_anomaly ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                            {lastScanResults.anomaly?.is_anomaly ? 'Anomaly Detected' : 'Normal'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => handleMLScan('payment-service')}
                                disabled={isScanning}
                                className="w-full py-2 px-4 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-lg font-semibold shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                            >
                                {isScanning ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-white/80" />
                                        <span className="text-white/90">Analyzing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Brain size={18} className="group-hover:scale-110 transition-transform" />
                                        <span>Run ML Analysis</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>

                    {/* NEW: Multi-Vector Threat Analysis (Radar) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="bg-card-bg border border-border-muted rounded-xl p-6 shadow-sm hover:border-blue-500/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 min-h-[300px] flex flex-col"
                    >
                        <h3 className="text-lg font-semibold text-text-main mb-2 flex items-center gap-2">
                            <Activity size={20} className="text-blue-500" /> Vector Analysis
                        </h3>
                        <div className="flex-1 min-h-[200px] -ml-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                    { subject: 'Compute', A: metrics.cpuUsage, fullMark: 100 },
                                    { subject: 'Latency', A: Math.min(100, metrics.responseTime / 5), fullMark: 100 }, // Scale: 500ms = 100
                                    { subject: 'Traffic', A: Math.min(100, parseInt(metrics.requests) / 30), fullMark: 100 }, // Scale: 3000 req = 100
                                    { subject: 'Cost', A: isDisasterMode ? 85 : 40, fullMark: 100 },
                                    { subject: 'Risk', A: isDisasterMode ? 95 : 10, fullMark: 100 },
                                ]}>
                                    <PolarGrid stroke="#334155" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Current Status"
                                        dataKey="A"
                                        stroke={isDisasterMode ? "#f87171" : "#60a5fa"}
                                        strokeWidth={1.5}
                                        fill={isDisasterMode ? "#f87171" : "#60a5fa"}
                                        fillOpacity={0.25}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        {isDisasterMode && (
                            <div className="mt-4 pt-4 border-t border-border-muted">
                                <button
                                    onClick={() => {
                                        setSelectedBlastService('payment-service');
                                        setIsBlastRadiusOpen(true);
                                    }}
                                    className="w-full py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 hover:border-amber-400 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all flex items-center justify-center gap-2 animate-pulse hover:animate-none shadow-sm"
                                >
                                    <AlertTriangle size={16} />
                                    View Predictive Impact Analysis
                                </button>
                            </div>
                        )}
                    </motion.div>


                </div >
            </div >

            {/* Service Health Grid */}

            {/* Blast Radius Modal */}
            <BlastRadiusColumn
                isOpen={isBlastRadiusOpen}
                onClose={() => setIsBlastRadiusOpen(false)}
                scenarioData={blastData}
            />

        </div >
    );
};

const MetricCard = ({ label, value, icon: Icon, trend, color, bg }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-card-bg border border-border-muted rounded-xl p-5 shadow-sm hover:border-primary/30 hover:shadow-lg transition-colors duration-300 cursor-pointer"
    >
        <div className="flex justify-between items-start mb-2">
            <div className={`p-2 rounded-lg ${bg} ${color}`}>
                <Icon size={20} />
            </div>
            {trend && <span className={`text-xs font-medium px-2 py-1 rounded-full bg-app-bg text-text-muted border border-border-muted`}>{trend}</span>}
        </div>
        <div className="mt-2">
            <h4 className="text-text-muted text-sm font-medium">{label}</h4>
            <p className="text-2xl font-bold text-text-main mt-0.5">{value}</p>
        </div>
    </motion.div>
);

export default Dashboard;
