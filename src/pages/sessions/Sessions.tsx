import React, { useState } from "react";
import { ScrollArea } from "@radix-ui/themes";
import { Calendar, Clock, MapPin, Users, Play, Search, Filter, X, Trash2, Eye, MoreVertical, Ban } from "lucide-react";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/dashboard/Header";
import { useData } from "../../contexts/DataContext";
import { toast } from "sonner";
import Drawer from "../../components/ui/Drawer";
import type { SessionInterface } from "../../interfaces/session.interface";

import { useAuth } from "../../contexts/AuthContext";
import type { Student } from "../../interfaces/user.interface";
import FaceScannerModal from "../../components/attendance/FaceScannerModal";

const Sessions: React.FC = () => {
    const { user } = useAuth();
    const { sessions, closeSession, deleteSession, attendance, addAttendanceRecord } = useData();

    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [showScanner, setShowScanner] = useState(false);
    const [verifyingSessionId, setVerifyingSessionId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false); // Changed to Drawer
    const [selectedSession, setSelectedSession] = useState<SessionInterface | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

    const filteredSessions = sessions.filter((s) => {
        // Role-based filtering
        if (user?.role === "student") {
            const student = user as Student;
            const isEnrolled = student.enrolledCourses.includes(s.courseId);
            if (!isEnrolled) return false;
        }

        const matchesStatus = statusFilter === "all" || s.status === statusFilter;
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const activeSessions = sessions.filter((s) => s.status === "OPEN").length;

    const handleForceClose = (session: SessionInterface) => {
        closeSession(session.id);
        toast.success(`Session "${session.name}" closed`);
        setDropdownOpen(null);
    };

    const handleDelete = () => {
        if (!selectedSession) return;
        deleteSession(selectedSession.id);
        toast.success("Session deleted");
        setShowDeleteModal(false);
        setSelectedSession(null);
    };

    const handleAttendanceVerify = async () => {
        if (!verifyingSessionId || !user) return;

        // Add attendance record
        addAttendanceRecord({
            sessionId: verifyingSessionId,
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            date: new Date(),
            status: "PRESENT",
            checkInTime: new Date(),
            sessionName: sessions.find(s => s.id === verifyingSessionId)?.name || "Unknown Session",
            courseCode: sessions.find(s => s.id === verifyingSessionId)?.courseCode || "Unknown Course",
            source: "mobile"
        });

        toast.success("Attendance marked successfully!");
        setShowScanner(false);
        setVerifyingSessionId(null);
    };

    const getSessionAttendance = (sessionId: string) => attendance.filter((a) => a.sessionId === sessionId);

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
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Session Management</h1>
                                <p className="text-slate-500 dark:text-slate-400">View and manage all attendance sessions</p>
                            </div>
                            <span className={`px-4 py-2 rounded-xl flex items-center gap-2 font-medium ${activeSessions > 0 ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
                                <Play size={16} /> {activeSessions} Live
                            </span>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatCard label="Total Sessions" value={sessions.length} color="blue" />
                            <StatCard label="Active" value={activeSessions} color="green" />
                            <StatCard label="Scheduled" value={sessions.filter((s) => s.status === "SCHEDULED").length} color="amber" />
                            <StatCard label="Closed" value={sessions.filter((s) => s.status === "CLOSED").length} color="slate" />
                        </div>

                        {/* Filters */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6 shadow-sm dark:shadow-none">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search sessions..."
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Filter size={18} className="text-slate-400 dark:text-slate-500" />
                                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                                        <option value="all">All Status</option>
                                        <option value="OPEN">Live</option>
                                        <option value="SCHEDULED">Scheduled</option>
                                        <option value="CLOSED">Closed</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Sessions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredSessions.map((session) => (
                                <div key={session.id} className={`bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-sm dark:shadow-none transition-all ${session.status === "OPEN" ? "border-emerald-500/50 dark:border-emerald-600/50" : "border-slate-200 dark:border-slate-800"}`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex gap-2">
                                            <span className={`px-2 py-1 text-xs font-medium text-white rounded ${session.type === "CLASS" ? "bg-blue-600" : session.type === "EXAM" ? "bg-red-600" : "bg-purple-600"}`}>{session.type}</span>
                                            <span className={`px-2 py-1 text-xs font-medium text-white rounded flex items-center gap-1 ${session.status === "OPEN" ? "bg-emerald-600" : session.status === "SCHEDULED" ? "bg-amber-600" : "bg-slate-600"}`}>
                                                {session.status === "OPEN" && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                                {session.status}
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <button onClick={() => setDropdownOpen(dropdownOpen === session.id ? null : session.id)}
                                                className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                                <MoreVertical size={18} />
                                            </button>
                                            {dropdownOpen === session.id && (
                                                <div className="absolute right-0 top-10 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                                                    <button onClick={() => { setSelectedSession(session); setShowDrawer(true); setDropdownOpen(null); }}
                                                        className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                                        <Eye size={14} /> View Details
                                                    </button>
                                                    {user?.role !== "student" && session.status === "OPEN" && (
                                                        <button onClick={() => handleForceClose(session)}
                                                            className="w-full px-4 py-2.5 text-left text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                                            <Ban size={14} /> Force Close
                                                        </button>
                                                    )}
                                                    {user?.role !== "student" && (
                                                        <button onClick={() => { setSelectedSession(session); setShowDeleteModal(true); setDropdownOpen(null); }}
                                                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                                            <Trash2 size={14} /> Delete
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{session.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{session.courseCode} • {session.courseName}</p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400"><MapPin size={14} /><span>{session.location || "TBD"}</span></div>
                                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400"><Clock size={14} /><span>{session.startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {session.endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div>
                                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400"><Calendar size={14} /><span>{session.startTime.toLocaleDateString()}</span></div>
                                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400"><Users size={14} /><span>{session.actualMembersCount}/{session.expectedMembersCount} attended</span></div>
                                    </div>
                                    {session.status === "OPEN" && user?.role === "student" && (
                                        <button
                                            onClick={() => {
                                                setVerifyingSessionId(session.id);
                                                setShowScanner(true);
                                            }}
                                            className="w-full mt-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
                                        >
                                            <Users size={18} /> Check In Now
                                        </button>
                                    )}
                                    {session.status === "OPEN" && user?.role !== "student" && (
                                        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-700/30 rounded-lg">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Session Token</p>
                                            <p className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{session.token}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {filteredSessions.length === 0 && (
                            <div className="text-center py-12"><Calendar size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" /><p className="text-slate-500 dark:text-slate-400">No sessions found</p></div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Detail Drawer (Replaces Modal) */}
            <Drawer
                isOpen={showDrawer}
                onClose={() => { setShowDrawer(false); setSelectedSession(null); }}
                title="Session Details"
            >
                {selectedSession && (
                    <div className="space-y-6">
                        <div className={`p-4 rounded-xl border ${selectedSession.status === 'OPEN' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {selectedSession.name}
                                </h3>
                                <span className={`px-2 py-1 text-xs font-bold rounded ${selectedSession.status === 'OPEN' ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                                    {selectedSession.status}
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{selectedSession.courseName}</p>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Session Info</h4>
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                                <DetailRow label="Date" value={new Date(selectedSession.startTime).toLocaleDateString()} />
                                <DetailRow label="Time" value={`${new Date(selectedSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(selectedSession.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`} />
                                <DetailRow label="Room" value={selectedSession.location || "TBD"} />
                                <DetailRow label="Type" value={selectedSession.type} />
                                <DetailRow label="Mode" value={selectedSession.mode} />
                            </div>

                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Attendance Rules</h4>
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                                <DetailRow label="Late Threshold" value={`${selectedSession.lateThreshold} mins`} />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                                Attendance ({getSessionAttendance(selectedSession.id).length})
                            </h4>
                            <div className="max-h-60 overflow-y-auto space-y-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                                {getSessionAttendance(selectedSession.id).length > 0 ? (
                                    getSessionAttendance(selectedSession.id).map((a) => (
                                        <div key={a.id} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                            <span className="text-sm text-slate-900 dark:text-white font-medium">{a.userName}</span>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${a.status === "PRESENT" ? "bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400" : a.status === "LATE" ? "bg-amber-100 dark:bg-amber-600/20 text-amber-700 dark:text-amber-400" : "bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-400"}`}>{a.status}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-sm text-slate-500 py-4">No attendance records</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Drawer>

            {/* Delete Modal */}
            {showDeleteModal && selectedSession && (
                <Modal title="Delete Session" onClose={() => setShowDeleteModal(false)}>
                    <p className="text-slate-600 dark:text-slate-300 mb-2">Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{selectedSession.name}</strong>?</p>
                    <p className="text-sm text-slate-500">This action cannot be undone.</p>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl">Cancel</button>
                        <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl">Delete</button>
                    </div>
                </Modal>
            )}

            <FaceScannerModal
                isOpen={showScanner}
                onClose={() => { setShowScanner(false); setVerifyingSessionId(null); }}
                onVerify={handleAttendanceVerify}
                title="Student Check-in"
                description="Please position your face to mark your attendance for this session."
            />
        </div>
    );
};

export default Sessions;

// Components
const StatCard = ({ label, value, color }: { label: string; value: number; color?: string }) => {
    // Basic mapping for colors if needed, or stick to simple styling
    const colors: Record<string, string> = { blue: "bg-blue-600", green: "bg-emerald-600", amber: "bg-amber-600", slate: "bg-slate-600" };
    const bg = color ? colors[color] : "bg-slate-800";
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-none">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{label}</p>
            <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
                {color && <div className={`w-2 h-2 rounded-full ${bg}`} />}
            </div>
        </div>
    );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
        <span className="text-slate-500 dark:text-slate-400">{label}</span>
        <span className="text-slate-900 dark:text-white font-medium">{value}</span>
    </div>
);

const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
                <button onClick={onClose} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X size={20} /></button>
            </div>
            {children}
        </div>
    </div>
);
