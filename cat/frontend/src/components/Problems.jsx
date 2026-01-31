import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Filter, RefreshCcw, Activity, AlertOctagon, Monitor, Clock, ChevronDown, Download, EyeOff, LayoutGrid, List } from 'lucide-react';

import ProblemDetail from './ProblemDetail';
import { AnimatePresence } from 'framer-motion';
import BlastRadiusColumn from './BlastRadiusModal';

const Problems = () => {
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [selectedBlastRadiusProblem, setSelectedBlastRadiusProblem] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedCategory, setSelectedCategory] = useState([]);

    // Theme logic moved to global text utilities
    // We prefer using 'bg-card-bg', 'text-text-main' etc directly in classNames now for consistency.

    // Chart Colors from CSS var (simulated for recharts)
    // Chart Colors from CSS var (simulated for recharts)
    const chartFillColor = '#dc172a'; // Dynatrace Red

    // Mock Data for the Chart - 5 min intervals for 2 hours (24 points)
    const chartData = Array.from({ length: 24 }, (_, i) => {
        const hour = Math.floor(i / 12) + 6; // Start at 6 PM
        const minute = (i % 12) * 5;
        const nextMinute = minute + 5;

        const formatTime = (h, m) => {
            const period = h >= 12 ? 'PM' : 'AM';
            const displayH = h > 12 ? h - 12 : h;
            return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
        };

        // Only show label every 3rd point or specific points to match screenshot "06:45 PM", "07 PM"
        let label = formatTime(hour + 12, minute); // Using PM
        if (minute === 0) label = `${hour > 12 ? hour - 12 : hour} PM`; // "07 PM"

        return {
            time: label,
            endTime: formatTime(hour + 12, nextMinute),
            // Randomize slightly for visual interest but keep it close to screenshot's "heavy" load
            count: 10 + Math.floor(Math.random() * 5),
        };
    });

    // Mock Data for the Table
    const allProblems = [
        { id: 'P-2601869', name: 'Cisco Memory Free critical low', status: 'Active', category: 'Custom', affected: '1 service', started: 'Jan 15, 21:32', duration: '2 w 1 d' },
        { id: 'P-2601844', name: 'Memory saturation', status: 'Active', category: 'Resource contention', affected: '1 host', started: 'Jan 16, 06:15', duration: '2 w 18 h' },
        { id: 'P-2601843', name: 'Memory saturation', status: 'Active', category: 'Resource contention', affected: '1 host', started: 'Jan 16, 06:14', duration: '2 w 18 h' },
        { id: 'P-2601800', name: 'CPU saturation', status: 'Closed', category: 'Resource contention', affected: '1 host', started: 'Jan 16, 04:10', duration: '1 h 12 min' },
        { id: 'P-2600212', name: 'User action duration degradation', status: 'Active', category: 'Custom', affected: '1 application', started: 'Jan 14, 02:49', duration: '2 w 3 d' },
        { id: 'P-2599602', name: 'Failure rate increase', status: 'Active', category: 'Availability', affected: '1 service', started: 'Jan 13, 09:30', duration: '2 w 4 d' },
        { id: 'P-2599601', name: 'Failure rate increase', status: 'Active', category: 'Availability', affected: '1 service', started: 'Jan 13, 09:30', duration: '2 w 4 d' },
        { id: 'P-2599600', name: 'Failure rate increase', status: 'Active', category: 'Availability', affected: '1 service', started: 'Jan 13, 09:30', duration: '2 w 4 d' },
        { id: 'P-2599599', name: 'Failure rate increase', status: 'Active', category: 'Availability', affected: '1 service', started: 'Jan 13, 09:30', duration: '2 w 4 d' },
        { id: 'P-2599598', name: 'Failure rate increase', status: 'Active', category: 'Availability', affected: '1 service', started: 'Jan 13, 09:30', duration: '2 w 4 d' },
        { id: 'P-2598379', name: 'Synthetic monitor outage', status: 'Active', category: 'Availability', affected: '1 monitor', started: 'Jan 12, 11:21', duration: '2 w 5 d' },
        { id: 'P-2593412', name: 'Host or monitoring unavailable', status: 'Active', category: 'Availability', affected: '1 host', started: 'Jan 07, 09:12', duration: '3 w 3 d' },
        { id: 'P-2586616', name: 'High connectivity failures', status: 'Active', category: 'Custom alert', affected: '1 entity', started: 'Dec 30, 23:25', duration: '4 w 3 d' },
        { id: 'P-2580000', name: 'Process crash loop', status: 'Closed', category: 'Availability', affected: '3 services', started: 'Dec 25, 12:45', duration: '4 h 20 min' },
        { id: 'P-2575000', name: 'Disk space critical', status: 'Closed', category: 'Resource contention', affected: '1 host', started: 'Dec 20, 08:30', duration: '12 h 15 min' },
    ];

    const filteredProblems = allProblems
        .filter(problem => {
            const matchesStatus = activeFilter === 'All' || problem.status === activeFilter;
            const matchesCategory = selectedCategory.length === 0 || selectedCategory.includes(problem.category);
            return matchesStatus && matchesCategory;
        })
        .sort((a, b) => {
            if (a.status === 'Active' && b.status !== 'Active') return -1;
            if (a.status !== 'Active' && b.status === 'Active') return 1;
            return 0;
        });

    const categories = ['Resource contention', 'Custom', 'Availability', 'Custom alert'];

    const handleCategoryChange = (category) => {
        if (selectedCategory.includes(category)) {
            setSelectedCategory(selectedCategory.filter(c => c !== category));
        } else {
            setSelectedCategory([...selectedCategory, category]);
        }
    };

    // If a problem is selected, render the detail view
    if (selectedProblem) {
        return <ProblemDetail problem={selectedProblem} onBack={() => setSelectedProblem(null)} />;
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full text-text-main">
            {/* Sidebar / Filters */}
            <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
                {/* Status Filter */}
                <div>
                    {/* Default Filter Button */}
                    <div className="mb-6">
                        <button className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-card-bg border border-border-muted shadow-sm text-sm font-medium hover:border-text-muted transition-colors">
                            <span className="flex items-center gap-2 text-blue-400">
                                Default filter
                            </span>
                            <ChevronDown size={14} className="text-text-muted" />
                        </button>
                    </div>

                    <h3 className="text-sm font-semibold mb-3 text-text-muted">Status</h3>
                    <div className="space-y-2">
                        {['All', 'Active', 'Closed'].map((status) => (
                            <label key={status} className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${activeFilter === status ? 'border-primary' : 'border-border-muted group-hover:border-primary'}`}>
                                    {activeFilter === status && <div className="w-2 h-2 rounded-full bg-primary" />}
                                </div>
                                <span className={`text-sm ${activeFilter === status ? 'font-medium text-text-main' : 'text-text-muted'} group-hover:text-text-main`}>{status}</span>
                                <input
                                    type="radio"
                                    name="status"
                                    className="hidden"
                                    checked={activeFilter === status}
                                    onChange={() => setActiveFilter(status)}
                                />
                            </label>
                        ))}
                    </div>
                </div>

                {/* Category Filter */}
                <div>
                    <h3 className="text-sm font-semibold mb-3 text-text-muted">Category</h3>
                    <div className="space-y-2">
                        {categories.map((category) => (
                            <label key={category} className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedCategory.includes(category) ? 'bg-primary border-primary' : 'border-border-muted group-hover:border-primary'}`}>
                                    {selectedCategory.includes(category) && <div className="w-2 h-2 bg-text-main" />}
                                </div>
                                <span className={`text-sm ${selectedCategory.includes(category) ? 'font-medium text-text-main' : 'text-text-muted'} group-hover:text-text-main`}>{category}</span>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={selectedCategory.includes(category)}
                                    onChange={() => handleCategoryChange(category)}
                                />
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0 flex flex-col space-y-4 min-h-0">
                {/* Top Header Panel */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-card-bg border border-border-muted shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white/5 rounded-md text-text-muted">
                            <LayoutGrid size={20} />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-lg font-bold text-text-main">Problems</h2>
                            <span className="px-2 py-0.5 text-xs font-semibold bg-[#dc172a]/10 text-[#dc172a] rounded-full border border-[#dc172a]/20">
                                <Activity size={10} className="inline mr-1" />
                                {allProblems.filter(p => p.status === 'Active').length} active
                            </span>
                            <span className="text-sm text-text-muted">/ {allProblems.length}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-border-muted hover:bg-white/5 text-text-muted hover:text-text-main transition-colors">
                            Last 2 hours
                            <ChevronDown size={14} />
                        </button>
                        <div className="flex items-center gap-1 text-xs text-text-muted">
                            <RefreshCcw size={12} />
                            <span>refreshed 1 min. ago</span>
                        </div>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="p-4 rounded-xl bg-card-bg border border-border-muted shadow-sm flex-shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 relative w-full max-w-md">
                            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Type to filter..."
                                className="w-full pl-9 pr-4 py-1.5 text-sm rounded-md border border-border-muted bg-app-bg text-text-main placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="px-3 py-1.5 text-xs font-medium rounded-md border border-border-muted text-text-muted opacity-50 cursor-not-allowed">Update</button>
                            <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-border-muted text-text-muted hover:bg-white/5 hover:text-text-main">
                                <EyeOff size={12} /> Hide chart
                            </button>
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }} barCategoryGap="0%" barGap={0}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#2d2d3b" />
                                <XAxis
                                    dataKey="time"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                                    interval={2}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                                    domain={[0, 15]}
                                    ticks={[0, 5, 10, 15]}
                                />
                                <Tooltip
                                    cursor={(props) => {
                                        const { x, y, width, height } = props;
                                        return (
                                            <g>
                                                {/* Vertical Line */}
                                                <line x1={x + width / 2} y1={0} x2={x + width / 2} y2={height} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 4" />
                                                {/* Horizontal Line at the top intersection for the cross effect */}
                                                <line x1={0} y1={y} x2="100%" y2={y} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 4" />
                                                {/* Circle at top */}
                                                <circle cx={x + width / 2} cy={y} r={3} fill="#1e293b" stroke="#cbd5e1" strokeWidth={1} />
                                            </g>
                                        );
                                    }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-[#1e293b] border border-[#2d2d3b] rounded-md shadow-xl p-3 min-w-[200px] z-50">
                                                    <div className="text-xs text-gray-400 mb-2 font-medium">
                                                        <span className="bg-gray-700 text-gray-300 px-1 rounded mr-2">5min</span>
                                                        Today, {label} to {payload[0].payload.endTime}
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-[#ef4444]"></div>
                                                            <span className="text-white font-semibold">ACTIVE</span>
                                                        </div>
                                                        <span className="text-white font-bold">{payload[0].value}</span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill={chartFillColor}
                                    radius={[0, 0, 0, 0]}
                                    background={{ fill: '#14151a' }}
                                    activeBar={false} // Disable white highlight on hover
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Table Section */}
                <div className="flex flex-col flex-1 min-h-[400px] lg:min-h-0 bg-card-bg border border-border-muted shadow-sm rounded-xl overflow-hidden relative">
                    <div className="flex justify-end p-2 border-b border-border-muted flex-shrink-0 z-20 bg-card-bg relative">
                        <button className="flex items-center gap-1 text-xs font-medium text-text-muted hover:text-text-main">
                            <List size={12} /> 5 columns hidden
                        </button>
                        <button className="ml-3 text-text-muted hover:text-text-main">
                            <Download size={14} />
                        </button>
                    </div>

                    {/* Scrollable Table Container - Absolute positioning to force fit */}
                    <div className="absolute inset-0 top-[37px] overflow-auto" style={{ scrollbarGutter: 'stable' }}>
                        {/* Desktop Table View (Large Screens) */}
                        <table className="hidden lg:table w-full text-sm text-left relative table-fixed">
                            <thead className="bg-[#14151a] border-b border-border-muted text-xs uppercase text-text-muted font-semibold sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3 w-12 bg-[#14151a]">
                                        <input type="checkbox" className="rounded bg-app-bg border-border-muted checked:bg-primary checked:border-primary" />
                                    </th>
                                    <th className="px-4 py-3 w-28 bg-[#14151a]">ID</th>
                                    <th className="px-4 py-3 w-auto bg-[#14151a]">Name</th>
                                    <th className="px-4 py-3 w-32 bg-[#14151a]">Status</th>
                                    <th className="px-4 py-3 w-40 bg-[#14151a]">Category</th>
                                    <th className="px-4 py-3 w-32 text-center bg-[#14151a]">Affected</th>
                                    <th className="px-4 py-3 w-32 text-right bg-[#14151a]">Started</th>
                                    <th className="px-4 py-3 w-32 text-right bg-[#14151a]">Started</th>
                                    <th className="px-4 py-3 w-32 text-right bg-[#14151a]">Duration</th>
                                    <th className="px-4 py-3 w-24 bg-[#14151a]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-muted">
                                {filteredProblems.map((problem) => (
                                    <tr key={problem.id} onClick={() => setSelectedProblem(problem)} className="hover:bg-white/5 transition-colors group cursor-pointer">
                                        <td className="px-4 py-3">
                                            <input type="checkbox" className="rounded bg-app-bg border-border-muted" />
                                        </td>
                                        <td className="px-4 py-3 font-mono text-sm text-text-muted">{problem.id}</td>
                                        <td className="px-4 py-3 font-medium text-text-main max-w-xs truncate text-base" title={problem.name}>
                                            {problem.name}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-sm font-medium border ${problem.status === 'Active'
                                                ? 'bg-[#dc172a]/10 text-[#dc172a] border-[#dc172a]/20'
                                                : 'bg-white/5 text-text-muted border-border-muted'
                                                }`}>
                                                {problem.status === 'Active' ? <AlertOctagon size={12} /> : <Clock size={12} />}
                                                {problem.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-text-muted group-hover:text-text-main transition-colors text-sm">
                                            <div className="flex items-center gap-2">
                                                {problem.category === 'Resource contention' && <Monitor size={14} />}
                                                {problem.category === 'Custom' && <LayoutGrid size={14} />}
                                                {problem.category === 'Availability' && <Activity size={14} />}
                                                {problem.category === 'Custom alert' && <AlertOctagon size={14} />}
                                                <span className="truncate max-w-[140px]">{problem.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center text-text-muted group-hover:text-text-main text-sm">{problem.affected}</td>
                                        <td className="px-4 py-3 text-right text-text-muted whitespace-nowrap text-sm">{problem.started}</td>
                                        <td className="px-4 py-3 text-right text-text-muted font-mono text-sm">{problem.duration}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedBlastRadiusProblem(problem);
                                                }}
                                                className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/50 text-text-muted hover:text-white transition-all group relative"
                                                title="Analyze Blast Radius"
                                            >
                                                <Activity size={14} className="group-hover:text-primary" />
                                                {problem.status === 'Active' && problem.category === 'Availability' && (
                                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Mobile/Tablet Card View (Small Screens) */}
                        <div className="lg:hidden flex flex-col gap-3 p-4">
                            {filteredProblems.map((problem) => (
                                <div
                                    key={problem.id}
                                    onClick={() => setSelectedProblem(problem)}
                                    className="bg-card-bg border border-border-muted rounded-xl p-4 space-y-3 hover:bg-white/5 hover:-translate-y-1 hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer shadow-sm"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${problem.status === 'Active'
                                                ? 'bg-[#dc172a]/10 text-[#dc172a] border-[#dc172a]/20'
                                                : 'bg-white/5 text-text-muted border-border-muted'
                                                }`}>
                                                {problem.status === 'Active' ? <AlertOctagon size={10} /> : <Clock size={10} />}
                                                {problem.status}
                                            </span>
                                            <span className="font-mono text-xs text-text-muted">{problem.id}</span>
                                        </div>
                                        <span className="text-xs text-text-muted whitespace-nowrap">{problem.started}</span>
                                    </div>

                                    <h3 className="font-medium text-text-main text-base leading-tight">
                                        {problem.name}
                                    </h3>

                                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-text-muted pt-2 border-t border-border-muted/50">
                                        <div className="col-span-2 sm:col-span-1 flex items-center gap-2 text-text-main">
                                            {problem.category === 'Resource contention' && <Monitor size={14} className="text-text-muted" />}
                                            {problem.category === 'Custom' && <LayoutGrid size={14} className="text-text-muted" />}
                                            {problem.category === 'Availability' && <Activity size={14} className="text-text-muted" />}
                                            {problem.category === 'Custom alert' && <AlertOctagon size={14} className="text-text-muted" />}
                                            <span className="truncate">{problem.category}</span>
                                        </div>

                                        <div className="col-span-2 sm:col-span-1 flex items-center justify-between sm:justify-end gap-4">
                                            <span className="text-xs">Affected: <span className="text-text-main">{problem.affected}</span></span>
                                            <span className="text-xs font-mono bg-white/5 px-1.5 py-0.5 rounded">{problem.duration}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* Blast Radius Modal for Problems */}
            <AnimatePresence>
                {selectedBlastRadiusProblem && (
                    <BlastRadiusColumn
                        isOpen={!!selectedBlastRadiusProblem}
                        onClose={() => setSelectedBlastRadiusProblem(null)}
                        scenarioData={{
                            service: selectedBlastRadiusProblem.affected,
                            description: selectedBlastRadiusProblem.name,
                            version: 'Detected Risk',
                            type: selectedBlastRadiusProblem.category,
                            riskLevel: selectedBlastRadiusProblem.status === 'Active' ? 'Critical' : 'Low'
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Problems;
