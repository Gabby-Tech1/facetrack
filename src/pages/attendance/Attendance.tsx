import React, { useState, useEffect } from "react";
import { ScrollArea } from "@radix-ui/themes";
import {
    Calendar,
    Clock,
    Search,
    Filter,
    Download,
    Edit,
    X,
    Loader2,
    RefreshCw,
    CheckCircle,
    AlertCircle,
    XCircle,
    Users,
    BookOpen,
    Camera,
} from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/dashboard/Header";
import { toast } from "sonner";
import { useAuthStore } from "../../store/auth.store";
import { attendanceApi } from "../../api/attendance.api";
import { Role, AttendanceStatus } from "../../types";
import type { Attendance as AttendanceType } from "../../types";
const Attendance: React.FC = () => {
    const { user } = useAuthStore();
    const [attendance, setAttendance] = useState<AttendanceType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("");
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState<AttendanceType | null>(null);
    const [newStatus, setNewStatus] = useState<string>(AttendanceStatus.PRESENT);
    const isAdmin = user?.role === Role.ADMIN || user?.role === Role.SYSTEM_ADMIN;
    const isLecturer = user?.role === Role.LECTURER;
    const canEditStatus = isAdmin || isLecturer;
    const fetchAttendance = async () => {
        try {
            setIsRefreshing(true);
            let data: AttendanceType[] = [];
            if (isAdmin) {
                // Backend returns array directly for admin
                data = await attendanceApi.getAllAttendances();
            } else {
                // Backend returns array directly for user
                data = await attendanceApi.getUserAttendance();
            }
            setAttendance(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch attendance:", error);
            toast.error("Failed to load attendance records");
        } finally {
            setIsRefreshing(false);
            setIsLoading(false);
        }
    };
    useEffect(() => { fetchAttendance(); }, [user]);
    const filteredAttendance = attendance.filter((a) => {
        const matchesStatus = statusFilter === "all" || a.status === statusFilter;
        const matchesSearch = (a.user?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (a.session?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (a.session?.course?.code || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDate = !dateFilter || (a.checkInTime && new Date(a.checkInTime).toDateString() === new Date(dateFilter).toDateString());
        return matchesStatus && matchesSearch && matchesDate;
    });
    const stats = {
        total: attendance.length,
        present: attendance.filter((a) => a.status === AttendanceStatus.PRESENT).length,
        late: attendance.filter((a) => a.status === AttendanceStatus.LATE).length,
        absent: attendance.filter((a) => a.status === AttendanceStatus.ABSENT).length,
        checkedIn: attendance.filter((a) => a.status === AttendanceStatus.CHECKED_IN).length,
    };
    const handleEditStatus = async () => {
        if (!selectedAttendance || !newStatus) return;
        toast.info("Attendance status update feature coming soon");
        setShowEditModal(false);
        setSelectedAttendance(null);
    };
    const exportToCSV = () => {
        const headers = ["Name", "Session", "Course", "Date", "Check In", "Check Out", "Status"];
        const rows = filteredAttendance.map((a) => [
            a.user?.name || "Unknown", a.session?.name || "N/A", a.session?.course?.code || "N/A",
            a.checkInTime ? new Date(a.checkInTime).toLocaleDateString() : "N/A", 
            a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString() : "N/A",
            a.checkOutTime ? new Date(a.checkOutTime).toLocaleTimeString() : "N/A", a.status,
        ]);
        const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `attendance_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        toast.success("Attendance exported successfully");
    };
    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case AttendanceStatus.PRESENT: return "bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400";
            case AttendanceStatus.LATE: return "bg-amber-100 dark:bg-amber-600/20 text-amber-700 dark:text-amber-400";
            case AttendanceStatus.ABSENT: return "bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-400";
            case AttendanceStatus.CHECKED_IN: return "bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400";
            default: return "bg-slate-100 dark:bg-slate-600/20 text-slate-700 dark:text-slate-400";
        }
    };
    const getStatusIcon = (status: string) => {
        switch (status) {
            case AttendanceStatus.PRESENT: return <CheckCircle size={14} />;
            case AttendanceStatus.LATE: return <AlertCircle size={14} />;
            case AttendanceStatus.ABSENT: return <XCircle size={14} />;
            case AttendanceStatus.CHECKED_IN: return <Clock size={14} />;
            default: return null;
        }
    };
    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-950">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-950 px-4 sm:px-8 pt-6 pb-4"><Header /></div>
                <ScrollArea type="auto" className="flex-1">
                    <div className="px-4 sm:px-8 pb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Attendance Records</h1>
                                <p className="text-slate-500 dark:text-slate-400">{isAdmin ? "View and manage all attendance records" : "View your attendance history"}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => fetchAttendance()} disabled={isRefreshing} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    <RefreshCw size={18} className={`text-slate-600 dark:text-slate-300 ${isRefreshing ? "animate-spin" : ""}`} />
                                </button>
                                <Link 
                                    to="/mark-attendance" 
                                    className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
                                >
                                    <Camera size={18} /> Mark Attendance
                                </Link>
                                <button onClick={exportToCSV} className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/20">
                                    <Download size={18} /> Export CSV
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                            <StatCard label="Total" value={isLoading ? "..." : stats.total} color="slate" />
                            <StatCard label="Present" value={isLoading ? "..." : stats.present} color="green" />
                            <StatCard label="Late" value={isLoading ? "..." : stats.late} color="amber" />
                            <StatCard label="Absent" value={isLoading ? "..." : stats.absent} color="red" />
                            <StatCard label="Checked In" value={isLoading ? "..." : stats.checkedIn} color="blue" />
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6 shadow-sm dark:shadow-none">
                            <div className="flex flex-col lg:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name, session, or course..." className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Filter size={18} className="text-slate-400 dark:text-slate-500" />
                                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                                            <option value="all">All Status</option>
                                            <option value={AttendanceStatus.PRESENT}>Present</option>
                                            <option value={AttendanceStatus.LATE}>Late</option>
                                            <option value={AttendanceStatus.ABSENT}>Absent</option>
                                            <option value={AttendanceStatus.CHECKED_IN}>Checked In</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={18} className="text-slate-400 dark:text-slate-500" />
                                        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm dark:shadow-none overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Session</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Course</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Check In</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Check Out</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                                {canEditStatus && <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {filteredAttendance.map((record) => (
                                                <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-600/20 flex items-center justify-center"><Users size={14} className="text-blue-600 dark:text-blue-400" /></div><span className="text-sm font-medium text-slate-900 dark:text-white">{record.user?.name || "Unknown"}</span></div></td>
                                                    <td className="px-6 py-4"><span className="text-sm text-slate-700 dark:text-slate-300">{record.session?.name || "N/A"}</span></td>
                                                    <td className="px-6 py-4"><div className="flex items-center gap-2"><BookOpen size={14} className="text-slate-400" /><span className="text-sm text-slate-700 dark:text-slate-300">{record.session?.course?.code || "N/A"}</span></div></td>
                                                    <td className="px-6 py-4"><span className="text-sm text-slate-700 dark:text-slate-300">{record.checkInTime ? new Date(record.checkInTime).toLocaleDateString() : "N/A"}</span></td>
                                                    <td className="px-6 py-4"><span className="text-sm text-slate-700 dark:text-slate-300">{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A"}</span></td>
                                                    <td className="px-6 py-4"><span className="text-sm text-slate-700 dark:text-slate-300">{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}</span></td>
                                                    <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(record.status)}`}>{getStatusIcon(record.status)}{record.status}</span></td>
                                                    {canEditStatus && <td className="px-6 py-4"><button onClick={() => { setSelectedAttendance(record); setNewStatus(record.status); setShowEditModal(true); }} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><Edit size={16} /></button></td>}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {filteredAttendance.length === 0 && <div className="text-center py-12"><Calendar size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" /><p className="text-slate-500 dark:text-slate-400">No attendance records found</p></div>}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
            {showEditModal && selectedAttendance && (
                <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Attendance Status</h2><button onClick={() => setShowEditModal(false)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X size={20} /></button></div>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"><p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Student</p><p className="text-lg font-semibold text-slate-900 dark:text-white">{selectedAttendance.user?.name}</p></div>
                            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Status</label><select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"><option value={AttendanceStatus.PRESENT}>Present</option><option value={AttendanceStatus.LATE}>Late</option><option value={AttendanceStatus.ABSENT}>Absent</option><option value={AttendanceStatus.CHECKED_IN}>Checked In</option></select></div>
                        </div>
                        <div className="flex gap-3 mt-6"><button onClick={() => setShowEditModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-medium transition-colors">Cancel</button><button onClick={handleEditStatus} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">Update Status</button></div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Attendance;

const StatCard = ({ label, value, color }: { label: string; value: number | string; color?: string }) => {
    const colors: Record<string, string> = { slate: "bg-slate-600", green: "bg-emerald-600", amber: "bg-amber-600", red: "bg-red-600", blue: "bg-blue-600" };
    const bg = color ? colors[color] : "bg-slate-800";
    return (<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-none"><p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{label}</p><div className="flex items-center justify-between"><p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>{color && <div className={`w-2 h-2 rounded-full ${bg}`} />}</div></div>);
};
