import React, { useState, useMemo } from "react";
import { ScrollArea } from "@radix-ui/themes";
import { TrendingUp, Users, Calendar, CheckCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from "recharts";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/dashboard/Header";
import { useData } from "../../contexts/DataContext";

type DateRange = "7d" | "30d" | "90d" | "all";

const Analytics: React.FC = () => {
    const { students, courses, sessions, attendance } = useData();
    const [dateRange, setDateRange] = useState<DateRange>("30d");

    // Filter attendance by date range
    const filteredAttendance = useMemo(() => {
        if (dateRange === "all") return attendance;
        const now = new Date();
        const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        return attendance.filter((a) => new Date(a.date) >= cutoff);
    }, [attendance, dateRange]);

    // Stats
    const stats = useMemo(() => {
        const present = filteredAttendance.filter((a) => a.status === "PRESENT").length;
        const late = filteredAttendance.filter((a) => a.status === "LATE").length;
        const absent = filteredAttendance.filter((a) => a.status === "ABSENT").length;
        const total = filteredAttendance.length;
        return { present, late, absent, total, rate: total > 0 ? Math.round((present + late) / total * 100) : 0 };
    }, [filteredAttendance]);

    // Weekly trend data
    const weeklyData = useMemo(() => {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        return days.map((day, i) => {
            const dayRecords = filteredAttendance.filter((a) => new Date(a.date).getDay() === (i + 1) % 7);
            return { day, present: dayRecords.filter((r) => r.status === "PRESENT").length, late: dayRecords.filter((r) => r.status === "LATE").length };
        });
    }, [filteredAttendance]);

    // Status distribution
    const statusData = [
        { name: "Present", value: stats.present, color: "#22c55e" },
        { name: "Late", value: stats.late, color: "#f59e0b" },
        { name: "Absent", value: stats.absent, color: "#ef4444" },
    ];

    // Course attendance
    const courseData = useMemo(() => {
        return courses.slice(0, 6).map((course) => {
            const courseRecords = filteredAttendance.filter((a) => a.courseCode === course.code);
            const present = courseRecords.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
            const rate = courseRecords.length > 0 ? Math.round(present / courseRecords.length * 100) : 0;
            return { name: course.code, attendance: rate };
        });
    }, [courses, filteredAttendance]);

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-950">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-950 px-4 sm:px-8 pt-6 pb-4"><Header /></div>
                <ScrollArea type="auto" className="flex-1">
                    <div className="px-4 sm:px-8 pb-8">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Analytics</h1>
                                <p className="text-slate-500 dark:text-slate-400">System-wide attendance insights and trends</p>
                            </div>
                            <div className="flex gap-2">
                                {(["7d", "30d", "90d", "all"] as DateRange[]).map((range) => (
                                    <button key={range} onClick={() => setDateRange(range)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateRange === range ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white border border-slate-200 dark:border-slate-700"}`}>
                                        {range === "all" ? "All Time" : range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                            <StatCard icon={Users} label="Total Students" value={students.length} color="blue" />
                            <StatCard icon={CheckCircle} label="Attendance Rate" value={`${stats.rate}%`} color="emerald" />
                            <StatCard icon={Calendar} label="Total Sessions" value={sessions.length} color="purple" />
                            <StatCard icon={TrendingUp} label="Records" value={stats.total} color="amber" />
                        </div>

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Weekly Trend */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Weekly Attendance Trend</h2>
                                <div style={{ width: "100%", height: "280px" }}>
                                    <ResponsiveContainer>
                                        <AreaChart data={weeklyData}>
                                            <defs>
                                                <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                                            <YAxis stroke="#94a3b8" fontSize={12} />
                                            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} />
                                            <Area type="monotone" dataKey="present" stroke="#22c55e" fill="url(#presentGrad)" strokeWidth={2} />
                                            <Area type="monotone" dataKey="late" stroke="#f59e0b" fill="transparent" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Status Distribution */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Status Distribution</h2>
                                <div style={{ width: "100%", height: "280px" }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                                {statusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} />
                                            <Legend wrapperStyle={{ color: "#94a3b8" }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Course Attendance */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Attendance by Course</h2>
                            <div style={{ width: "100%", height: "300px" }}>
                                <ResponsiveContainer>
                                    <BarChart data={courseData}>
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                        <YAxis stroke="#94a3b8" fontSize={12} />
                                        <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} />
                                        <Bar dataKey="attendance" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <SummaryCard title="Present" value={stats.present} total={stats.total} color="emerald" />
                            <SummaryCard title="Late" value={stats.late} total={stats.total} color="amber" />
                            <SummaryCard title="Absent" value={stats.absent} total={stats.total} color="red" />
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};

export default Analytics;

const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) => {
    const c: Record<string, string> = { blue: "bg-blue-600", emerald: "bg-emerald-600", purple: "bg-purple-600", amber: "bg-amber-600" };
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
                <div className={`p-2 ${c[color]} rounded-lg shadow-lg shadow-${color}-900/20`}><Icon size={18} className="text-white" /></div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    );
};

const SummaryCard = ({ title, value, total, color }: { title: string; value: number; total: number; color: string }) => {
    const percent = total > 0 ? Math.round(value / total * 100) : 0;
    const c: Record<string, string> = { emerald: "bg-emerald-600", amber: "bg-amber-600", red: "bg-red-600" };
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-none">
            <div className="flex justify-between items-center mb-3">
                <span className="text-slate-900 dark:text-white font-semibold">{title}</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{value}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${c[color]} rounded-full transition-all`} style={{ width: `${percent}%` }} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">{percent}% of total</p>
        </div>
    );
};
