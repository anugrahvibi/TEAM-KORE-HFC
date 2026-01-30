import React, { useState } from 'react';
import Card from './Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ExecutiveDashboard = () => {
    const [scenario, setScenario] = useState('neutral'); // neutral, bad, good

    // Data for different scenarios
    const getData = () => {
        switch (scenario) {
            case 'bad':
                return [
                    { name: 'Jan', cost: 42000, revenue: 85000 },
                    { name: 'Feb', cost: 43500, revenue: 87000 },
                    { name: 'Mar', cost: 78000, revenue: 87500 }, // High Cost, Flat Revenue
                ];
            case 'good':
                return [
                    { name: 'Jan', cost: 42000, revenue: 85000 },
                    { name: 'Feb', cost: 43500, revenue: 87000 },
                    { name: 'Mar', cost: 65000, revenue: 145000 }, // Higher Cost, MUCH Higher Revenue
                ];
            default:
                return [
                    { name: 'Jan', cost: 42000, revenue: 85000 },
                    { name: 'Feb', cost: 43500, revenue: 87000 },
                    { name: 'Mar', cost: 43247, revenue: 88000 }, // Normal
                ];
        }
    };

    const currentCost = scenario === 'bad' ? 78000 : scenario === 'good' ? 65000 : 43247;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Top Section: Metrics & Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Metric Card */}
                <Card title="Financial Overview" className="lg:col-span-1 border-t-4 border-t-violet-500">
                    <div className="space-y-4">
                        <div>
                            <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Cloud Cost</div>
                            <div className={`text-4xl font-bold transition-colors duration-500 ${scenario === 'bad' ? 'text-red-400' : 'text-white'
                                }`}>
                                ${currentCost.toLocaleString()}
                            </div>
                        </div>

                        {/* Status Badges */}
                        <div className="h-8">
                            {scenario === 'bad' && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
                                    <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                                    WASTE DETECTED
                                </span>
                            )}
                            {scenario === 'good' && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                                    HEALTHY GROWTH
                                </span>
                            )}
                            {scenario === 'neutral' && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-slate-700/50 text-slate-300 border border-slate-600">
                                    <span className="w-2 h-2 rounded-full bg-slate-500 mr-2"></span>
                                    STABLE
                                </span>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Controls */}
                <Card title="Traffic Simulation" className="lg:col-span-2">
                    <div className="flex flex-col sm:flex-row gap-4 h-full items-center justify-center p-4">
                        <button
                            onClick={() => setScenario('bad')}
                            className={`flex-1 w-full py-4 px-6 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 group ${scenario === 'bad'
                                    ? 'bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                                    : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-red-900/20 hover:border-red-500/50 hover:text-red-300'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${scenario === 'bad' ? 'bg-red-500 text-white' : 'bg-slate-800 group-hover:bg-red-900/50'
                                }`}>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <span className="font-bold">Simulate Bad Spike</span>
                            <span className="text-xs opacity-70">Unoptimized scaling</span>
                        </button>

                        <button
                            onClick={() => setScenario('good')}
                            className={`flex-1 w-full py-4 px-6 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 group ${scenario === 'good'
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                                    : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-emerald-900/20 hover:border-emerald-500/50 hover:text-emerald-300'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${scenario === 'good' ? 'bg-emerald-500 text-white' : 'bg-slate-800 group-hover:bg-emerald-900/50'
                                }`}>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <span className="font-bold">Simulate Good Spike</span>
                            <span className="text-xs opacity-70">Revenue-driven growth</span>
                        </button>

                        <button
                            onClick={() => setScenario('neutral')}
                            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-300 border border-transparent hover:border-slate-700 rounded-lg transition-all"
                        >
                            Reset
                        </button>
                    </div>
                </Card>
            </div>

            {/* Chart Section */}
            <Card title="Cost vs Revenue Efficiency" className="min-h-[400px]">
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={getData()}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#94a3b8"
                                tick={{ fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                tick={{ fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `$${value / 1000}k`}
                            />
                            <Tooltip
                                cursor={{ fill: '#1e293b', opacity: 0.5 }}
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    borderColor: '#334155',
                                    borderRadius: '0.5rem',
                                    color: '#f1f5f9'
                                }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar
                                dataKey="cost"
                                name="Cloud Cost"
                                fill={scenario === 'bad' ? '#ef4444' : '#f43f5e'}
                                radius={[4, 4, 0, 0]}
                                animationDuration={1000}
                            />
                            <Bar
                                dataKey="revenue"
                                name="Revenue"
                                fill="#10b981"
                                radius={[4, 4, 0, 0]}
                                animationDuration={1000}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

        </div>
    );
};

export default ExecutiveDashboard;
