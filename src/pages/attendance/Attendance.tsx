import React, { useState, useMemo } from "react";
import { ScrollArea } from "@radix-ui/themes";
import { CheckCircle, Clock, XCircle, Search, Download, Edit2, X } from "lucide-react";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/dashboard/Header";
import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import type { AttendanceInterface } from "../../interfaces/attendance.interface";
import type { Lecturer } from "../../interfaces/user.interface";

const Attendance: React.FC = () => {
    const { user } = useAuth();
    const { attendance, updateAttendanceStatus } = useData();

    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [courseFilter, setCourseFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Get session ID from URL if present
    const queryParams = new URLSearchParams(window.location.search);
    const sessionFilter = queryParams.get("session");

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceInterface | null>(null);
    const [newStatus, setNewStatus] = useState<AttendanceInterface["status"]>("PRESENT");

    const stats = useMemo(() => ({
        present: attendance.filter((a) => a.status === "PRESENT").length,
        late: attendance.filter((a) => a.status === "LATE").length,
        absent: attendance.filter((a) => a.status === "ABSENT").length,
        total: attendance.length,
    }), [attendance]);

    const filteredRecords = attendance.filter((r) => {
        const matchesStatus = statusFilter === "all" || r.status === statusFilter;
        const matchesCourse = courseFilter === "all" || r.courseCode === courseFilter;
        // Filter by session ID if present in URL
        const matchesSession = !sessionFilter || r.sessionId === sessionFilter;
        const matchesSearch = r.userName.toLowerCase().includes(searchQuery.toLowerCase()) || r.sessionName.toLowerCase().includes(searchQuery.toLowerCase());

        // Role-based visibility
        if (user?.role === "lecturer") {
            const lecturer = user as Lecturer;
            const isMyRecord = r.userId === lecturer.id;
            const isMyStudent = lecturer.assignedCourses.includes(r.courseCode || "");
            // Show my records AND my students' records
            if (!isMyRecord && !isMyStudent) return false;
        } else if (user?.role === "student") {
            // Students only see their own records
            if (r.userId !== user.id) return false;
        }

        return matchesStatus && matchesCourse && matchesSession && matchesSearch;
    });

    const handleExport = () => {
        const headers = ["User", "Session", "Course", "Date", "Check In", "Status"];
        const rows = filteredRecords.map((r) => [
            r.userName, r.sessionName, r.courseCode || "", new Date(r.date).toLocaleDateString(),
            r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : "-", r.status
        ]);
        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `attendance_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Exported to CSV!");
    };

    const handleUpdateStatus = () => {
        if (!selectedRecord) return;
        updateAttendanceStatus(selectedRecord.id, newStatus);
        toast.success("Attendance status updated!");
        setShowEditModal(false);
        setSelectedRecord(null);
    };

    const openEditModal = (record: AttendanceInterface) => {
        setSelectedRecord(record);
        setNewStatus(record.status);
        setShowEditModal(true);
    };

    const uniqueCourses = [...new Set(attendance.map((a) => a.courseCode).filter(Boolean))];

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
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Attendance Records</h1>
                                <p className="text-slate-500 dark:text-slate-400">View and manage all attendance records</p>
                            </div>
                            <button onClick={handleExport} className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-900/20">
                                <Download size={18} /> Export CSV
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatCard icon={CheckCircle} label="Present" value={stats.present} color="emerald" />
                            <StatCard icon={Clock} label="Late" value={stats.late} color="amber" />
                            <StatCard icon={XCircle} label="Absent" value={stats.absent} color="red" />
                            <StatCard icon={CheckCircle} label="Rate" value={`${stats.total > 0 ? Math.round((stats.present + stats.late) / stats.total * 100) : 0}%`} color="blue" />
                        </div>

                        {/* Filters */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6 shadow-sm dark:shadow-none">
                            <div className="flex flex-col lg:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by user or session..."
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                                </div>
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                                    <option value="all">All Status</option>
                                    <option value="PRESENT">Present</option>
                                    <option value="LATE">Late</option>
                                    <option value="ABSENT">Absent</option>
                                </select>
                                <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}
                                    className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                                    <option value="all">All Courses</option>
                                    {uniqueCourses.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm dark:shadow-none">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">User</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Session</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Course</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Check In</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                        {filteredRecords.slice(0, 50).map((record) => (
                                            <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{record.userName}</td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{record.sessionName}</td>
                                                <td className="px-6 py-4"><span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400 text-xs font-medium rounded">{record.courseCode || "N/A"}</span></td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{new Date(record.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}</td>
                                                <td className="px-6 py-4"><StatusBadge status={record.status} /></td>
                                                <td className="px-6 py-4">
                                                    {user?.role === "system_admin" && record.userId !== user.id && (
                                                        <button onClick={() => openEditModal(record)} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                                            <Edit2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredRecords.length === 0 && (
                                <div className="text-center py-12"><p className="text-slate-500 dark:text-slate-400">No records found</p></div>
                            )}
                            {filteredRecords.length > 50 && (
                                <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800">
                                    Showing 50 of {filteredRecords.length} records. Export for full data.
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* Edit Status Modal */}
            {showEditModal && selectedRecord && (
                <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Update Attendance</h2>
                            <button onClick={() => setShowEditModal(false)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X size={20} /></button>
                        </div>
                        <div className="mb-4">
                            <p className="text-slate-500 dark:text-slate-400 text-sm">User: <span className="text-slate-900 dark:text-white font-medium">{selectedRecord.userName}</span></p>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Session: <span className="text-slate-900 dark:text-white font-medium">{selectedRecord.sessionName}</span></p>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">New Status</label>
                            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as any)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                                <option value="PRESENT">Present</option>
                                <option value="LATE">Late</option>
                                <option value="ABSENT">Absent</option>
                                <option value="EXCUSED">Excused</option>
                            </select>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-medium transition-colors">Cancel</button>
                            <button onClick={handleUpdateStatus} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">Update</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;

const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) => {
    const c: Record<string, string> = { emerald: "bg-emerald-600", amber: "bg-amber-600", red: "bg-red-600", blue: "bg-blue-600" };
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

const StatusBadge = ({ status }: { status: string }) => {
    const s: Record<string, string> = {
        PRESENT: "bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400",
        LATE: "bg-amber-100 dark:bg-amber-600/20 text-amber-700 dark:text-amber-400",
        ABSENT: "bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-400",
        EXCUSED: "bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400"
    };
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${s[status] || "bg-slate-100 dark:bg-slate-600/20 text-slate-600 dark:text-slate-400"}`}>{status}</span>;
};
