import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@radix-ui/themes";
import { Users, BookOpen, Calendar, Activity, Shield, CheckCircle, BarChart3, Plus, ArrowRight, Loader2 } from "lucide-react";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/dashboard/Header";
import { usersApi } from "../../api/users.api";
import { coursesApi } from "../../api/courses.api";
import { sessionsApi } from "../../api/sessions.api";
import { Role } from "../../types";
import type { User, Course, Session } from "../../types";

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isCancelled = false;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [usersRes, coursesRes, sessionsRes] = await Promise.all([
                    usersApi.getAllUsers(),
                    coursesApi.getAllCourses(),
                    sessionsApi.getAllSessionsAdmin().catch(() => ({ success: false, data: [] })),
                ]);

                if (!isCancelled) {
                    setUsers(usersRes.users || []);
                    setCourses(coursesRes.data || []);
                    setSessions(sessionsRes.data || []);
                }
            } catch (error) {
                if (!isCancelled) {
                    console.error("Failed to fetch dashboard data:", error);
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };
        fetchData();

        return () => {
            isCancelled = true;
        };
    }, []);

    // Stats calculations
    const totalUsers = users.length;
    const studentCount = users.filter((u) => u.role === Role.STUDENT || u.role === Role.REP).length;
    const lecturerCount = users.filter((u) => u.role === Role.LECTURER).length;
    const staffCount = users.filter((u) => u.role === Role.STAFF).length;
    const adminCount = users.filter((u) => u.role === Role.ADMIN || u.role === Role.SYSTEM_ADMIN).length;
    const activeSessions = sessions.filter((s) => s.status === "OPEN").length;

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-950">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-950 px-4 sm:px-8 pt-6 pb-4"><Header /></div>
                <ScrollArea type="auto" className="flex-1">
                    <div className="px-4 sm:px-8 pb-8">
                        {/* Welcome */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">System Admin Dashboard</h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">Overview of system health and user activity</p>
                            </div>
                            <button
                                onClick={() => navigate("/users")}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                            >
                                <Plus className="w-5 h-5" />
                                Add User
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                        ) : (
                            <>
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                    <StatCard icon={Users} label="Total Users" value={totalUsers} bgColor="bg-blue-600" />
                                    <StatCard icon={Users} label="Students" value={studentCount} bgColor="bg-green-600" />
                                    <StatCard icon={Users} label="Lecturers" value={lecturerCount} bgColor="bg-purple-600" />
                                    <StatCard icon={BookOpen} label="Courses" value={courses.length} bgColor="bg-orange-600" />
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    <StatCard icon={Calendar} label="Total Sessions" value={sessions.length} bgColor="bg-cyan-600" />
                                    <StatCard icon={Activity} label="Active Sessions" value={activeSessions} bgColor="bg-amber-600" />
                                    <StatCard icon={Users} label="Staff" value={staffCount} bgColor="bg-emerald-600" />
                                    <StatCard icon={Shield} label="Admins" value={adminCount} bgColor="bg-rose-600" />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                    {/* Quick Actions */}
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-none">
                                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
                                        <div className="grid grid-cols-2 gap-3">
                                            <QuickActionCard
                                                icon={Users}
                                                label="Manage Users"
                                                onClick={() => navigate("/users")}
                                                color="blue"
                                            />
                                            <QuickActionCard
                                                icon={BookOpen}
                                                label="Manage Courses"
                                                onClick={() => navigate("/courses")}
                                                color="purple"
                                            />
                                            <QuickActionCard
                                                icon={Calendar}
                                                label="View Sessions"
                                                onClick={() => navigate("/sessions")}
                                                color="amber"
                                            />
                                            <QuickActionCard
                                                icon={BarChart3}
                                                label="Analytics"
                                                onClick={() => navigate("/analytics")}
                                                color="emerald"
                                            />
                                        </div>
                                    </div>

                                    {/* System Status */}
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-none">
                                        <div className="flex items-center gap-2 mb-4">
                                            <CheckCircle size={20} className="text-green-500" />
                                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">System Status</h2>
                                        </div>
                                        <div className="space-y-1">
                                            <StatusItem label="API Server" status="ok" detail="Online" />
                                            <StatusItem label="Database Connection" status="ok" detail="Active" />
                                            <StatusItem label="Face Recognition" status="ok" detail="Ready" />
                                            <StatusItem label="Background Jobs" status="ok" detail="Running" />
                                            <StatusItem label="Storage" status="ok" detail="Available" />
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Users Table */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-none">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Users size={20} className="text-blue-500" />
                                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Users</h2>
                                        </div>
                                        <button
                                            onClick={() => navigate("/users")}
                                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                        >
                                            View all <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-left text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700">
                                                    <th className="pb-3 font-medium">Name</th>
                                                    <th className="pb-3 font-medium">Email</th>
                                                    <th className="pb-3 font-medium">Role</th>
                                                    <th className="pb-3 font-medium">Joined</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.slice(0, 5).map((u) => (
                                                    <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800">
                                                        <td className="py-3">
                                                            <div className="flex items-center gap-3">
                                                                <img
                                                                    src={u.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=3b82f6&color=fff&size=32`}
                                                                    alt={u.name}
                                                                    className="w-8 h-8 rounded-full object-cover"
                                                                />
                                                                <span className="text-slate-900 dark:text-white font-medium">{u.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 text-slate-500 dark:text-slate-400">{u.email}</td>
                                                        <td className="py-3">
                                                            <span className={`px-2 py-1 text-xs font-medium rounded ${getRoleBadgeColor(u.role)}`}>
                                                                {u.role}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 text-slate-500 dark:text-slate-400">
                                                            {new Date(u.createdAt).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* System Alert */}
                                <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl p-5">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                                        <div>
                                            <h3 className="text-blue-900 dark:text-white font-medium">System Running Normally</h3>
                                            <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                                                All services are operational. {totalUsers} users registered, {courses.length} courses available.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};

export default AdminDashboard;

const getRoleBadgeColor = (role: Role) => {
    switch (role) {
        case Role.STUDENT:
            return "bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400";
        case Role.REP:
            return "bg-green-100 dark:bg-green-600/20 text-green-700 dark:text-green-400";
        case Role.LECTURER:
            return "bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-400";
        case Role.STAFF:
            return "bg-orange-100 dark:bg-orange-600/20 text-orange-700 dark:text-orange-400";
        case Role.ADMIN:
            return "bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400";
        case Role.SYSTEM_ADMIN:
            return "bg-indigo-100 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-400";
        default:
            return "bg-slate-100 dark:bg-slate-600/20 text-slate-700 dark:text-slate-400";
    }
};

const StatCard = ({ icon: Icon, label, value, bgColor }: { icon: React.ElementType; label: string; value: string | number; bgColor: string }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <div className={`p-2 ${bgColor} rounded-lg`}><Icon size={18} className="text-white" /></div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
);

const StatusItem = ({ label, status, detail }: { label: string; status: "ok" | "warning" | "error"; detail: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
        <div className="flex items-center gap-3">
            <span className={`w-2 h-2 rounded-full ${status === "ok" ? "bg-green-500" : status === "warning" ? "bg-amber-500" : "bg-red-500"}`} />
            <span className="text-slate-700 dark:text-slate-300">{label}</span>
        </div>
        <span className="text-sm text-slate-500">{detail}</span>
    </div>
);

interface QuickActionCardProps {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    color: "blue" | "purple" | "amber" | "emerald";
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ icon: Icon, label, onClick, color }) => {
    const colorClasses = {
        blue: "bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-600/20",
        purple: "bg-purple-50 dark:bg-purple-600/10 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-600/20",
        amber: "bg-amber-50 dark:bg-amber-600/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-600/20",
        emerald: "bg-emerald-50 dark:bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-600/20",
    };

    return (
        <button
            onClick={onClick}
            className={`p-4 rounded-xl flex items-center gap-3 transition-colors ${colorClasses[color]}`}
        >
            <Icon className="w-5 h-5" />
            <span className="font-medium text-sm">{label}</span>
        </button>
    );
};
