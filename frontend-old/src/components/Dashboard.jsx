import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import Card from './Card';

const Dashboard = () => {
    const [isDisasterMode, setIsDisasterMode] = useState(false);
    const [cpuData, setCpuData] = useState([]);
    const [activeDeploy, setActiveDeploy] = useState(false);

    // Initial normal data
    const generateNormalData = () => {
        return Array.from({ length: 20 }, (_, i) => ({
            time: `${10 + Math.floor(i / 4)}:${(i % 4) * 15}`.replace(/:0$/, ':00'),
            usage: 20 + Math.random() * 15,
        }));
    };

    // Disaster data with spike
    const generateDisasterData = () => {
        const data = generateNormalData();
        // Add spike at the end
        for (let i = 15; i < 20; i++) {
            data[i].usage = 85 + Math.random() * 15;
        }
        return data;
    };

    useEffect(() => {
        if (isDisasterMode) {
            setCpuData(generateDisasterData());
        } else {
            setCpuData(generateNormalData());
        }
    }, [isDisasterMode]);

    const services = [
        { name: 'API Gateway', id: 'api' },
        { name: 'Auth Service', id: 'auth' },
        { name: 'Payment Service', id: 'payment' },
        { name: 'Checkout Service', id: 'checkout' },
        { name: 'Database Cluster', id: 'db' },
    ];

    const handleDeploy = () => {
        setActiveDeploy(true);

        // Simulate deployment delay
        setTimeout(() => {
            setActiveDeploy(false);
            setIsDisasterMode(true);
            toast.error('Alert: Latency spike detected in payment-service', {
                description: 'Critical threshold exceeded. Check logs immediately.',
                duration: 5000,
                style: {
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#fca5a5',
                },
            });
        }, 1500); // 1.5s delay for effect
    };

    const handleRollback = () => {
        setIsDisasterMode(false);
        toast.success('Rollback successful', {
            description: 'Services returning to normal operational levels.',
            style: {
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: '#6ee7b7',
            },
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Service Health */}
            <Card title="Microservice Health" className="h-full">
                <div className="space-y-4">
                    {services.map((service) => (
                        <div
                            key={service.name}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${isDisasterMode && service.id === 'payment'
                                    ? 'bg-red-500/10 border-red-500/30'
                                    : 'bg-slate-900/50 border-slate-700/50 hover:bg-slate-800'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div
                                        className={`w-3 h-3 rounded-full ${isDisasterMode && service.id === 'payment'
                                                ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                                                : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                                            }`}
                                    />
                                    {isDisasterMode && service.id === 'payment' && (
                                        <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></div>
                                    )}
                                </div>
                                <span className={`font-medium ${isDisasterMode && service.id === 'payment' ? 'text-red-200' : 'text-slate-200'
                                    }`}>
                                    {service.name}
                                </span>
                            </div>
                            <span
                                className={`text-xs px-2 py-1 rounded-full border ${isDisasterMode && service.id === 'payment'
                                        ? 'bg-red-500/20 text-red-300 border-red-500/20'
                                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    }`}
                            >
                                {isDisasterMode && service.id === 'payment' ? 'Error' : 'Operational'}
                            </span>
                        </div>
                    ))}

                    <div className="mt-8 pt-4 border-t border-slate-700/50">
                        {!isDisasterMode ? (
                            <button
                                onClick={handleDeploy}
                                disabled={activeDeploy}
                                className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-lg font-semibold shadow-lg shadow-violet-500/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {activeDeploy ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Deploying v2.4...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Deploy v2.4
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleRollback}
                                className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-semibold shadow-lg transition-all duration-300 border border-slate-600 hover:border-slate-500 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Rollback to v2.3
                            </button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Right Column: Chart */}
            <Card title="CPU Usage (Real-time)" className="h-full min-h-[400px]">
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={cpuData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isDisasterMode ? "#ef4444" : "#8b5cf6"} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={isDisasterMode ? "#ef4444" : "#8b5cf6"} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                            <XAxis
                                dataKey="time"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                domain={[0, 100]}
                                tickFormatter={(value) => `${value}%`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    borderColor: '#334155',
                                    borderRadius: '0.5rem',
                                    color: '#f1f5f9'
                                }}
                                itemStyle={{ color: '#e2e8f0' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="usage"
                                stroke={isDisasterMode ? "#ef4444" : "#8b5cf6"}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorUsage)"
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Toast Notification Container (will be rendered by parent App usually, but just in case) */}
            {/* We assume Toaster is at root level */}
        </div>
    );
};

export default Dashboard;
