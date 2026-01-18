import React from "react";
import { ScrollArea } from "@radix-ui/themes";
import { Users, BookOpen, Calendar, Activity, Shield, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/dashboard/Header";
import { useAuth } from "../../contexts/AuthContext";
import { students, lecturers, systemAdmins } from "../../data/users";
import { courses } from "../../data/courses";
import { mockSessions } from "../../data/sessions";
import { mockAttendance } from "../../data/attendance";

const AdminDashboard: React.FC = () => {
    useAuth();

    const totalAttendance = mockAttendance.length;
    const presentCount = mockAttendance.filter((a) => a.status === "PRESENT").length;
    const lateCount = mockAttendance.filter((a) => a.status === "LATE").length;
    const absentCount = mockAttendance.filter((a) => a.status === "ABSENT").length;
    const attendanceRate = totalAttendance > 0 ? Math.round(((presentCount + lateCount) / totalAttendance) * 100) : 0;
    const activeSessions = mockSessions.filter((s) => s.status === "OPEN").length;

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-950">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-950 px-4 sm:px-8 pt-6 pb-4"><Header /></div>
                <ScrollArea type="auto" className="flex-1">
                    <div className="px-4 sm:px-8 pb-8">
                        {/* Welcome */}
                        <div className="mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">System Admin Dashboard</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">Overview of system health and user activity</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <StatCard icon={Users} label="Total Users" value={students.length + lecturers.length + systemAdmins.length} bgColor="bg-blue-600" />
                            <StatCard icon={Users} label="Students" value={students.length} bgColor="bg-green-600" />
                            <StatCard icon={Users} label="Lecturers" value={lecturers.length} bgColor="bg-purple-600" />
                            <StatCard icon={BookOpen} label="Courses" value={courses.length} bgColor="bg-orange-600" />
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <StatCard icon={Calendar} label="Total Sessions" value={mockSessions.length} bgColor="bg-cyan-600" />
                            <StatCard icon={Activity} label="Active Sessions" value={activeSessions} bgColor="bg-amber-600" />
                            <StatCard icon={BarChart3} label="Attendance Rate" value={`${attendanceRate}%`} bgColor="bg-emerald-600" />
                            <StatCard icon={Shield} label="System Admins" value={systemAdmins.length} bgColor="bg-rose-600" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Attendance Overview */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-none">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Attendance Overview</h2>
                                    <span className="text-xs text-slate-500">All time</span>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="text-center p-4 bg-green-100 dark:bg-green-700 rounded-lg">
                                        <p className="text-2xl font-bold text-green-700 dark:text-white">{presentCount}</p>
                                        <p className="text-xs text-green-600 dark:text-green-100">Present</p>
                                    </div>
                                    <div className="text-center p-4 bg-amber-100 dark:bg-amber-700 rounded-lg">
                                        <p className="text-2xl font-bold text-amber-700 dark:text-white">{lateCount}</p>
                                        <p className="text-xs text-amber-600 dark:text-amber-100">Late</p>
                                    </div>
                                    <div className="text-center p-4 bg-red-100 dark:bg-red-700 rounded-lg">
                                        <p className="text-2xl font-bold text-red-700 dark:text-white">{absentCount}</p>
                                        <p className="text-xs text-red-600 dark:text-red-100">Absent</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Attendance Rate</span>
                                        <span className="text-slate-900 dark:text-white font-medium">{attendanceRate}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-600 rounded-full" style={{ width: `${attendanceRate}%` }} />
                                    </div>
                                </div>
                            </div>

                            {/* System Status */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-none">
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle size={20} className="text-green-500" />
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">System Status</h2>
                                </div>
                                <div className="space-y-1">
                                    <StatusItem label="Face Recognition API" status="ok" detail="99.9% uptime" />
                                    <StatusItem label="Database Connection" status="ok" detail="Active" />
                                    <StatusItem label="Session Management" status="ok" detail="Running" />
                                    <StatusItem label="Notification Service" status="warning" detail="3 pending" />
                                    <StatusItem label="Backup Service" status="ok" detail="Last: 6h ago" />
                                </div>
                            </div>
                        </div>

                        {/* Courses Table */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-none">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <BookOpen size={20} className="text-blue-500" />
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">All Courses</h2>
                                </div>
                                <span className="text-sm text-slate-500">{courses.length} courses</span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700">
                                            <th className="pb-3 font-medium">Code</th>
                                            <th className="pb-3 font-medium">Course Name</th>
                                            <th className="pb-3 font-medium">Lecturer</th>
                                            <th className="pb-3 font-medium">Students</th>
                                            <th className="pb-3 font-medium">Sessions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courses.map((course) => (
                                            <tr key={course.id} className="border-b border-slate-100 dark:border-slate-800">
                                                <td className="py-3">
                                                    <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">{course.code}</span>
                                                </td>
                                                <td className="py-3 text-slate-900 dark:text-white">{course.name}</td>
                                                <td className="py-3 text-slate-500 dark:text-slate-400">{course.lecturerName}</td>
                                                <td className="py-3 text-slate-500 dark:text-slate-400">{course.enrolledStudents.length}</td>
                                                <td className="py-3 text-slate-500 dark:text-slate-400">{course.totalSessions}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* System Alert */}
                        <div className="mt-6 bg-amber-50 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-700 rounded-xl p-5">
                            <div className="flex items-start gap-3">
                                <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 mt-0.5" />
                                <div>
                                    <h3 className="text-amber-900 dark:text-white font-medium">System Notice</h3>
                                    <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
                                        Scheduled maintenance window: Sunday 2:00 AM - 4:00 AM UTC. Some features may be temporarily unavailable.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};

export default AdminDashboard;

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
