import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { toast } from 'sonner';
import { Activity, Server, Zap, CheckCircle, AlertTriangle, Clock, ArrowUp, ArrowDown, Cpu, Layers } from 'lucide-react';
import Card from './Card';

const Dashboard = () => {
    // Top-level mock metrics
    const [metrics, setMetrics] = useState({
        responseTime: 124,
        successRate: 99.98,
        activeIncidents: 0,
        cpuUsage: 42
    });

    const [isDisasterMode, setIsDisasterMode] = useState(false);
    const [activeDeploy, setActiveDeploy] = useState(false);
    const [chartData, setChartData] = useState([]);

    // Fix for hydration issues and scroll lock from agent overlays
    useEffect(() => {
        document.body.classList.remove('antigravity-scroll-lock');
    }, []);

    // Generate initial chart data
    useEffect(() => {
        const generateData = () => {
            return Array.from({ length: 24 }, (_, i) => ({
                time: `${i}:00`,
                traffic: 2000 + Math.random() * 1000,
                cpu: 30 + Math.random() * 20,
                latency: 100 + Math.random() * 50
            }));
        };
        setChartData(generateData());
    }, []);

    // Live Data Polling from Backend
    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                // Fetch last 60 seconds or so
                const response = await fetch('http://localhost:8000/metrics/recent?service=payment-service&window=300');
                if (response.ok) {
                    const data = await response.json();

                    // Update Top-Level Metrics based on latest data point
                    if (data.metrics && data.metrics.length > 0) {
                        const latest = data.metrics[data.metrics.length - 1];
                        setMetrics({
                            responseTime: Math.round(latest.latency_p95_ms),
                            successRate: 99.9, // Backend placeholder
                            activeIncidents: latest.latency_p95_ms > 500 ? 1 : 0,
                            cpuUsage: Math.round(latest.cpu_percent)
                        });

                        // Map backend metrics to Chart Data
                        const mappedData = data.metrics.map(m => {
                            const d = new Date(m.timestamp);
                            return {
                                time: d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes(),
                                traffic: m.request_count,
                                cpu: m.cpu_percent,
                                latency: m.latency_p95_ms
                            };
                        });

                        // Set chart data if we have points
                        if (mappedData.length > 0) {
                            setChartData(prev => {
                                // Simple logic: just show what backend gives for the window
                                return mappedData;
                            });
                        }
                    }
                }

                // Alert Check for Disaster Mode
                const alertResp = await fetch('http://localhost:8000/alerts?limit=1');
                if (alertResp.ok) {
                    const alertData = await alertResp.json();
                    if (alertData.alerts && alertData.alerts.length > 0) {
                        const lastAlert = alertData.alerts[0];
                        if (new Date(lastAlert.timestamp).getTime() > Date.now() - 20000) {
                            setIsDisasterMode(true);
                        } else {
                            setIsDisasterMode(false);
                        }
                    }
                }

            } catch (e) {
                console.error("Backend poll failed", e);
            }
        };

        const interval = setInterval(fetchMetrics, 2000);
        fetchMetrics(); // Initial call

        return () => clearInterval(interval);
    }, []);

    const handleDeploy = async () => {
        setActiveDeploy(true);
        try {
            await fetch('http://localhost:8000/ingest/change', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    change_id: `deploy-${Date.now()}`,
                    service: 'payment-service',
                    timestamp: new Date().toISOString(),
                    description: 'Deploying v2.4 (Canary)',
                    version: 'v2.4'
                })
            });
        } catch (e) { console.error(e); }

        // Keep UI feedback simulation for immediate response
        setTimeout(() => {
            setActiveDeploy(false);
            setIsDisasterMode(true);
            toast.error('Alert: Latency spike detected in payment-service', {
                description: 'Critical threshold exceeded. Check logs immediately.',
                duration: 5000,
                style: { background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5' },
            });
        }, 1500);
    };

    const handleRollback = () => {
        setIsDisasterMode(false);
        toast.success('Rollback successful', {
            description: 'Services returning to normal operational levels.',
            style: { background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#6ee7b7' },
        });
    };

    const [mlResults, setMlResults] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

    const handleScan = async () => {
        setIsScanning(true);
        try {
            const resp = await fetch('http://localhost:8000/ml/scan?service=payment-service');
            if (resp.ok) {
                const data = await resp.json();
                setMlResults(data);
                if (data.isolation_forest.is_anomaly) {
                    toast.warning("Anomaly Detected", {
                        description: "Isolation Forest flagged recent metrics as an anomaly."
                    });
                } else {
                    toast.success("System Healthy", {
                        description: "ML models verified system stability."
                    });
                }
            }
        } catch (e) { console.error(e); }
        setIsScanning(false);
    };

    const services = [
        { name: 'API Gateway', id: 'api', status: 'Operational', uptime: '99.99%' },
        { name: 'Auth Service', id: 'auth', status: 'Operational', uptime: '99.95%' },
        { name: 'Payment Service', id: 'payment', status: isDisasterMode ? 'Degraded' : 'Operational', uptime: isDisasterMode ? '85.00%' : '99.99%' },
        { name: 'Checkout Service', id: 'checkout', status: 'Operational', uptime: '99.90%' },
        { name: 'Database Cluster', id: 'db', status: 'Operational', uptime: '99.99%' },
        { name: 'Notification Svc', id: 'notif', status: 'Operational', uptime: '99.92%' },
    ];

    return (
        <div className="flex flex-col gap-6 h-full text-text-main">

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
                <MetricCard
                    label="System Status"
                    value={isDisasterMode ? "Critical" : "Operational"}
                    icon={Activity}
                    trend={isDisasterMode ? "Issues detected" : "All systems normal"}
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
                    label="Success Rate"
                    value={`${metrics.successRate}%`}
                    icon={CheckCircle}
                    trend={isDisasterMode ? "-14.5% drop" : "Stable"}
                    color={metrics.successRate < 99 ? "text-red-500" : "text-emerald-500"}
                    bg={metrics.successRate < 99 ? "bg-red-500/10" : "bg-emerald-500/10"}
                />
                <MetricCard
                    label="CPU Usage"
                    value={`${metrics.cpuUsage}%`}
                    icon={Cpu}
                    trend={isDisasterMode ? "High Load" : "Normal Load"}
                    color={metrics.cpuUsage > 80 ? "text-red-500" : "text-purple-500"}
                    bg={metrics.cpuUsage > 80 ? "bg-red-500/10" : "bg-purple-500/10"}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
                {/* Main and Secondary Charts */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card title="Traffic & Load Overview" className="min-h-[450px]">
                        <div className="h-full w-full min-h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={isDisasterMode ? "#ef4444" : "#3b82f6"} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={isDisasterMode ? "#ef4444" : "#3b82f6"} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tickLine={false} axisLine={false} fontSize={12} interval={3} />
                                    <YAxis stroke="#64748b" tickLine={false} axisLine={false} fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        itemStyle={{ color: '#e2e8f0' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="cpu"
                                        stroke={isDisasterMode ? "#ef4444" : "#3b82f6"}
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorTraffic)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Deployment & Activity */}
                <div className="flex flex-col gap-6">
                    {/* Deployment Control */}
                    <div className="bg-card-bg border border-border-muted rounded-xl p-6 shadow-sm hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                        <h3 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                            <Layers size={20} className="text-blue-500" /> Deployment
                        </h3>
                        <div className="space-y-4">
                            <div className="p-3 rounded-lg bg-black/20 border border-border-muted">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-text-muted">Current Version</span>
                                    <span className="font-mono text-emerald-400">v2.3.0</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted">Last Deployed</span>
                                    <span className="text-text-main">2 days ago</span>
                                </div>
                            </div>

                            {!isDisasterMode ? (
                                <button
                                    onClick={handleDeploy}
                                    disabled={activeDeploy}
                                    className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {activeDeploy ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Deploying v2.4...
                                        </>
                                    ) : (
                                        <>
                                            <ArrowUp size={18} /> Deploy v2.4 (Canary)
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={handleRollback}
                                    className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold shadow-lg shadow-red-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 animate-pulse"
                                >
                                    <ArrowDown size={18} /> Rollback to v2.3
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Recent Events (Simplified) */}
                    <div className="bg-card-bg border border-border-muted rounded-xl p-6 shadow-sm hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                        <h3 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                            <Activity size={20} className="text-purple-500" /> Activity
                        </h3>
                        <div className="space-y-4">
                            {[
                                { text: 'Database backup completed', time: '10m ago', type: 'success' },
                                { text: 'Latency spike warning', time: '1h ago', type: 'warning' },
                                { text: 'User scaling policy triggered', time: '2h ago', type: 'info' }
                            ].map((event, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className={`mt-1 w-2 h-2 rounded-full ${event.type === 'success' ? 'bg-emerald-500' : event.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                    <div>
                                        <p className="text-sm text-text-main">{event.text}</p>
                                        <p className="text-xs text-text-muted">{event.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ML Insights Scan */}
                    <div className="bg-card-bg border border-border-muted rounded-xl p-6 shadow-sm hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                        <h3 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                            <Zap size={20} className="text-yellow-500" /> ML Anomaly Scan
                        </h3>
                        <div className="space-y-4">
                            {!mlResults ? (
                                <p className="text-sm text-text-muted text-center py-2">No scan data yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-text-muted">Status:</span>
                                        <span className={mlResults.isolation_forest.is_anomaly ? "text-red-400 font-bold" : "text-emerald-400"}>
                                            {mlResults.isolation_forest.is_anomaly ? "⚠️ Anomaly" : "✅ Normal"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-text-muted">RF Prediction:</span>
                                        <span className="text-text-main font-mono">{mlResults.random_forest.prediction}</span>
                                    </div>
                                    <div className="w-full bg-black/20 rounded-full h-1.5 mt-2">
                                        <div
                                            className={`h-1.5 rounded-full ${mlResults.isolation_forest.is_anomaly ? "bg-red-500" : "bg-emerald-500"}`}
                                            style={{ width: `${Math.min(100, Math.max(0, (mlResults.isolation_forest.anomaly_score + 0.5) * 100))}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[10px] text-text-muted text-right">Confidence Score</p>
                                </div>
                            )}

                            <button
                                onClick={handleScan}
                                disabled={isScanning}
                                className="w-full py-2 px-4 border border-border-muted hover:bg-white/5 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
                            >
                                {isScanning ? "Scanning..." : "Run ML Discovery Scan"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Health Grid */}
            <h3 className="text-lg font-bold text-text-main mt-4">Service Mesh Health</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {services.map((service) => (
                    <div
                        key={service.name}
                        className={`p-4 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${isDisasterMode && service.id === 'payment'
                            ? 'bg-red-500/10 border-red-500/30'
                            : 'bg-card-bg border-border-muted hover:border-primary/30'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <Server size={18} className={`flex-shrink-0 ${isDisasterMode && service.id === 'payment' ? 'text-red-400' : 'text-text-muted'}`} />
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isDisasterMode && service.id === 'payment' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'
                                }`} />
                        </div>
                        <h4 className="font-semibold text-sm text-text-main truncate" title={service.name}>{service.name}</h4>
                        <div className="flex justify-between items-end mt-2">
                            <span className={`text-xs px-1.5 py-0.5 rounded ${isDisasterMode && service.id === 'payment' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/10 text-emerald-400'
                                }`}>
                                {isDisasterMode && service.id === 'payment' ? 'Error' : 'Healthy'}
                            </span>
                            <span className="text-xs text-text-muted font-mono">{service.uptime}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, icon: Icon, trend, color, bg }) => (
    <div className="bg-card-bg border border-border-muted rounded-xl p-5 shadow-sm hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
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
    </div>
);

export default Dashboard;
