import React, { useState, useEffect } from "react";
import { ScrollArea } from "@radix-ui/themes";
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Play,
    Search,
    Filter,
    X,
    Trash2,
    Eye,
    MoreVertical,
    Ban,
    Plus,
    Loader2,
    RefreshCw,
    ToggleLeft,
    ToggleRight,
} from "lucide-react";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/dashboard/Header";
import { toast } from "sonner";
import Drawer from "../../components/ui/Drawer";
import { useAuthStore } from "../../store/auth.store";
import { sessionsApi } from "../../api/sessions.api";
import { coursesApi } from "../../api/courses.api";
import { usersApi } from "../../api/users.api";
import { Role, SessionMode, SessionStatus, SessionType } from "../../types";
import type { Session, Course, User, CreateSessionDto } from "../../types";
import FaceScannerModal from "../../components/attendance/FaceScannerModal";

const Sessions: React.FC = () => {
    const { user } = useAuthStore();

    const [sessions, setSessions] = useState<Session[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [lecturers, setLecturers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

    const [showScanner, setShowScanner] = useState(false);
    const [scannerSessionId, setScannerSessionId] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<CreateSessionDto>>({
        name: "",
        type: SessionType.CLASS,
        mode: SessionMode.CHECK_IN,
        location: "",
        startTime: "",
        endTime: "",
        courseId: "",
        lecturerId: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canCreateSession = user?.role === Role.ADMIN || user?.role === Role.LECTURER || user?.role === Role.REP;
    const isAdmin = user?.role === Role.ADMIN || user?.role === Role.SYSTEM_ADMIN;
    const isLecturer = user?.role === Role.LECTURER;
    const isRep = user?.role === Role.REP;
    const isStudent = user?.role === Role.STUDENT;


    const fetchSessions = async () => {
        if (isStudent) {
            try {
                setIsRefreshing(true);
                const response = await sessionsApi.getAvailableSessions();
                console.log("[Sessions] Available sessions for student:", response.sessions);
                setSessions(response.sessions || []);
            } catch (error) {
                console.error("Failed to fetch available sessions:", error);
                toast.error("Failed to load sessions");
            } finally {
                setIsRefreshing(false);
                setIsLoading(false);
            }
            return;
        }

        try {
            setIsRefreshing(true);
            let sessionData: Session[] = [];

            if (isAdmin) {
                // Admin endpoint returns { success, data: sessions }
                const response = await sessionsApi.getAllSessionsAdmin();
                sessionData = response.data || [];
            } else if (isLecturer || isRep) {
                // Creator endpoint returns { sessions }
                const response = await sessionsApi.getCreatorSessions();
                sessionData = response.sessions || [];

                // For Reps, also fetch available sessions to see sessions created by lecturers
                if (isRep) {
                    try {
                        const availableResponse = await sessionsApi.getAvailableSessions();
                        const availableSessions = availableResponse.sessions || [];

                        // Merge and deduplicate
                        const merged = [...sessionData];
                        availableSessions.forEach(as => {
                            if (!merged.find(s => s.id === as.id)) {
                                merged.push(as);
                            }
                        });
                        sessionData = merged;
                    } catch (err) {
                        console.error("Failed to fetch additional available sessions for rep:", err);
                    }
                }
            }

            setSessions(sessionData);
        } catch (error) {
            console.error("Failed to fetch sessions:", error);
            toast.error("Failed to load sessions");
        } finally {
            setIsRefreshing(false);
            setIsLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await coursesApi.getAllCourses();
            setCourses(response.data || []);
        } catch (error) {
            console.error("Failed to fetch courses:", error);
        }
    };

    const fetchLecturers = async () => {
        if (isRep) {
            try {
                const response = await usersApi.getAllUsers();
                const lecturerUsers = (response.users || []).filter(
                    (u: User) => u.role === Role.LECTURER && u.lecturer?.id
                );
                setLecturers(lecturerUsers);
            } catch (error) {
                console.error("Failed to fetch lecturers:", error);
            }
        }
    };

    useEffect(() => {
        fetchSessions();
        fetchCourses();
        fetchLecturers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const filteredSessions = sessions.filter((s) => {
        const matchesStatus = statusFilter === "all" || s.status === statusFilter;
        const matchesSearch =
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.course?.code || "").toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const activeSessions = sessions.filter((s) => s.status === SessionStatus.OPEN).length;

    const handleCreateSession = async () => {
        if (!formData.name || !formData.type || !formData.mode || !formData.startTime || !formData.endTime) {
            toast.error("Please fill in all required fields");
            return;
        }
        if ((isLecturer || isRep) && !formData.courseId) {
            toast.error("Please select a course");
            return;
        }
        if (isRep && !formData.lecturerId) {
            toast.error("Please select a lecturer");
            return;
        }
        try {
            setIsSubmitting(true);

            // Build payload with only required/relevant fields
            // Ensure mode defaults to CHECK_IN if not set
            const sessionMode = formData.mode || SessionMode.CHECK_IN;
            const sessionType = formData.type || SessionType.CLASS;

            const payload: CreateSessionDto = {
                name: formData.name!,
                type: sessionType,
                mode: sessionMode,
                startTime: new Date(formData.startTime!).toISOString(),
                endTime: new Date(formData.endTime!).toISOString(),
            };

            // Only include optional fields if they have actual values (not empty strings)
            if (formData.location && formData.location.trim()) {
                payload.location = formData.location.trim();
            }
            if ((isLecturer || isRep) && formData.courseId && formData.courseId.trim()) {
                payload.courseId = formData.courseId;
            }
            if (isRep && formData.lecturerId && formData.lecturerId.trim()) {
                payload.lecturerId = formData.lecturerId;
            }

            console.log("Creating session with payload:", JSON.stringify(payload, null, 2));
            console.log("User role:", user?.role);
            console.log("isLecturer:", isLecturer, "courseId:", formData.courseId);

            const response = await sessionsApi.createSession(payload);
            // Backend returns { success: true, data: session }
            if (response.data) {
                toast.success("Session created successfully!");
                setShowCreateModal(false);
                resetForm();
                fetchSessions();
            } else {
                toast.error(response.message || "Failed to create session");
            }
        } catch (error: unknown) {
            console.error("Session creation error:", error);
            // apiClient interceptor already extracts the message into error.message
            const errorMessage = error instanceof Error ? error.message : "Failed to create session";
            toast.error(errorMessage);

            // If error is about existing open session, offer to show it
            if (errorMessage.toLowerCase().includes("already have an open session")) {
                toast.info("Close your existing open session first, then try again.", { duration: 5000 });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            type: SessionType.CLASS,
            mode: SessionMode.CHECK_IN,
            location: "",
            startTime: "",
            endTime: "",
            courseId: "",
            lecturerId: "",
        });
    };

    const handleCloseSession = async (session: Session) => {
        try {
            const response = await sessionsApi.closeSession(session.id);
            toast.success(`Session "${session.name}" closed`);
            fetchSessions();
            console.log(response);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to close session");
        }
        setDropdownOpen(null);
    };

    const handleToggleMode = async (session: Session) => {
        try {
            const response = await sessionsApi.toggleSessionMode(session.id);
            // Backend returns { success: true, message: ... }
            if ((response as any).success) {
                toast.success("Session mode changed to CHECK_OUT");
                fetchSessions();
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to toggle session mode");
        }
        setDropdownOpen(null);
    };

    const handleDelete = async () => {
        if (!selectedSession) return;
        try {
            await sessionsApi.deleteSession(selectedSession.id);
            toast.success("Session deleted");
            fetchSessions();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to delete session");
        }
        setShowDeleteModal(false);
        setSelectedSession(null);
    };

    const handleAttendanceVerify = async () => {
        console.log("Marking attendance for session:", scannerSessionId);
        toast.success("Attendance marked successfully!");
        setShowScanner(false);
        setScannerSessionId(null);
    };

    const canManageSession = (session: Session) => {
        if (isAdmin) return true;
        if (session.userId === user?.id || session.createdBy?.id === user?.id) return true;

        // Reps can manage sessions for their assigned courses
        if (isRep && session.course?.reps) {
            return session.course.reps.some((r: any) => r.student?.userId === user?.id);
        }

        return false;
    };

    const getStatusBadgeClasses = (status: string) => {
        if (status === SessionStatus.OPEN) return "bg-emerald-600";
        if (status === SessionStatus.SCHEDULED) return "bg-amber-600";
        return "bg-slate-600";
    };

    const getTypeBadgeClasses = (type: string) => {
        if (type === SessionType.CLASS) return "bg-blue-600";
        if (type === SessionType.EXAM) return "bg-red-600";
        if (type === SessionType.LAB) return "bg-purple-600";
        return "bg-slate-600";
    };

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-950">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-950 px-4 sm:px-8 pt-6 pb-4">
                    <Header />
                </div>
                <ScrollArea type="auto" className="flex-1">
                    <div className="px-4 sm:px-8 pb-8">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    Session Management
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400">
                                    {isAdmin
                                        ? "View and manage all attendance sessions"
                                        : isLecturer || isRep
                                            ? "Manage your attendance sessions"
                                            : "View available sessions"}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => fetchSessions()}
                                    disabled={isRefreshing}
                                    className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <RefreshCw
                                        size={18}
                                        className={`text-slate-600 dark:text-slate-300 ${isRefreshing ? "animate-spin" : ""}`}
                                    />
                                </button>
                                <span
                                    className={`px-4 py-2 rounded-xl flex items-center gap-2 font-medium ${activeSessions > 0
                                        ? "bg-emerald-600 text-white"
                                        : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                                        }`}
                                >
                                    <Play size={16} /> {activeSessions} Live
                                </span>
                                {canCreateSession && (
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/20"
                                    >
                                        <Plus size={18} /> New Session
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatCard label="Total Sessions" value={isLoading ? "..." : sessions.length} color="blue" />
                            <StatCard label="Active" value={isLoading ? "..." : activeSessions} color="green" />
                            <StatCard
                                label="Scheduled"
                                value={isLoading ? "..." : sessions.filter((s) => s.status === SessionStatus.SCHEDULED).length}
                                color="amber"
                            />
                            <StatCard
                                label="Closed"
                                value={isLoading ? "..." : sessions.filter((s) => s.status === SessionStatus.CLOSED).length}
                                color="slate"
                            />
                        </div>

                        {/* Filters */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6 shadow-sm dark:shadow-none">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search sessions..."
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Filter size={18} className="text-slate-400 dark:text-slate-500" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="OPEN">Live</option>
                                        <option value="SCHEDULED">Scheduled</option>
                                        <option value="CLOSED">Closed</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Sessions Grid */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredSessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className={`bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-sm dark:shadow-none transition-all ${session.status === SessionStatus.OPEN
                                            ? "border-emerald-500/50 dark:border-emerald-600/50"
                                            : "border-slate-200 dark:border-slate-800"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex gap-2">
                                                <span className={`px-2 py-1 text-xs font-medium text-white rounded ${getTypeBadgeClasses(session.type)}`}>
                                                    {session.type}
                                                </span>
                                                <span className={`px-2 py-1 text-xs font-medium text-white rounded flex items-center gap-1 ${getStatusBadgeClasses(session.status)}`}>
                                                    {session.status === SessionStatus.OPEN && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                    )}
                                                    {session.status}
                                                </span>
                                            </div>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setDropdownOpen(dropdownOpen === session.id ? null : session.id)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                {dropdownOpen === session.id && (
                                                    <div className="absolute right-0 top-10 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedSession(session);
                                                                setShowDrawer(true);
                                                                setDropdownOpen(null);
                                                            }}
                                                            className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                                        >
                                                            <Eye size={14} /> View Details
                                                        </button>
                                                        {canManageSession(session) && session.status === SessionStatus.OPEN && (
                                                            <>
                                                                {session.mode === SessionMode.CHECK_IN && (
                                                                    <button
                                                                        onClick={() => handleToggleMode(session)}
                                                                        className="w-full px-4 py-2.5 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                                                    >
                                                                        <ToggleRight size={14} /> Switch to Check Out
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleCloseSession(session)}
                                                                    className="w-full px-4 py-2.5 text-left text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                                                >
                                                                    <Ban size={14} /> Close Session
                                                                </button>
                                                            </>
                                                        )}
                                                        {canManageSession(session) && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedSession(session);
                                                                    setShowDeleteModal(true);
                                                                    setDropdownOpen(null);
                                                                }}
                                                                className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                                            >
                                                                <Trash2 size={14} /> Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{session.name}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                            {session.course?.code || "No course"} - {session.course?.title || ""}
                                        </p>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                <MapPin size={14} />
                                                <span>{session.location || "TBD"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                <Clock size={14} />
                                                <span>
                                                    {new Date(session.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                                                    {new Date(session.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                <Calendar size={14} />
                                                <span>{new Date(session.startTime).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                <Users size={14} />
                                                <span>{session.attendances?.length || 0} attended</span>
                                            </div>
                                        </div>
                                        {session.status === SessionStatus.OPEN && isStudent && (
                                            <button
                                                onClick={() => {
                                                    setScannerSessionId(session.id);
                                                    setShowScanner(true);
                                                }}
                                                className="w-full mt-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
                                            >
                                                <Users size={18} /> Check In Now
                                            </button>
                                        )}
                                        {session.status === SessionStatus.OPEN && canManageSession(session) && (
                                            <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-700/30 rounded-lg">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Session Token</p>
                                                <p className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{session.token}</p>
                                            </div>
                                        )}
                                        {session.status === SessionStatus.OPEN && (
                                            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                                {session.mode === SessionMode.CHECK_IN ? (
                                                    <>
                                                        <ToggleLeft size={14} className="text-blue-500" />
                                                        <span>Check-in Mode</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ToggleRight size={14} className="text-emerald-500" />
                                                        <span>Check-out Mode</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {!isLoading && filteredSessions.length === 0 && (
                            <div className="text-center py-12">
                                <Calendar size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                <p className="text-slate-500 dark:text-slate-400">No sessions found</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Create Session Modal */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowCreateModal(false)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Session</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Session Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Week 5 Lecture"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            {(isLecturer || isRep) && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Course *</label>
                                    <select
                                        value={formData.courseId}
                                        onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">Select a course</option>
                                        {courses.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.code} - {course.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {isRep && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Lecturer *</label>
                                    <select
                                        value={formData.lecturerId}
                                        onChange={(e) => setFormData({ ...formData, lecturerId: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">Select a lecturer</option>
                                        {lecturers.map((lecturer) => (
                                            <option key={lecturer.lecturer?.id} value={lecturer.lecturer?.id}>
                                                {lecturer.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Type *</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as SessionType })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value={SessionType.CLASS}>Class</option>
                                        <option value={SessionType.EXAM}>Exam</option>
                                        <option value={SessionType.LAB}>Lab</option>
                                        <option value={SessionType.TUTORIAL}>Tutorial</option>
                                        <option value={SessionType.EVENT}>Event</option>
                                        <option value={SessionType.WORKSHIFT}>Workshift</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mode *</label>
                                    <select
                                        value={formData.mode}
                                        onChange={(e) => setFormData({ ...formData, mode: e.target.value as SessionMode })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value={SessionMode.CHECK_IN}>Check In Only</option>
                                        <option value={SessionMode.CHECK_OUT}>Check In & Out</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Location</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g., Room 204"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Start Time *</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">End Time *</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateSession}
                                disabled={isSubmitting}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} Create Session
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Session Details Drawer */}
            <Drawer isOpen={showDrawer} onClose={() => { setShowDrawer(false); setSelectedSession(null); }} title="Session Details">
                {selectedSession && (
                    <div className="space-y-6">
                        <div className={`p-4 rounded-xl border ${selectedSession.status === SessionStatus.OPEN
                            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            }`}>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedSession.name}</h3>
                                <span className={`px-2 py-1 text-xs font-bold rounded ${selectedSession.status === SessionStatus.OPEN
                                    ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"
                                    : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                                    }`}>
                                    {selectedSession.status}
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{selectedSession.course?.title || "No course assigned"}</p>
                        </div>
                        {selectedSession.status === SessionStatus.OPEN && canManageSession(selectedSession) && (
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-700/30 rounded-xl">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Session Token</p>
                                <p className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{selectedSession.token}</p>
                            </div>
                        )}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Session Info</h4>
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                                <DetailRow label="Date" value={new Date(selectedSession.startTime).toLocaleDateString()} />
                                <DetailRow
                                    label="Time"
                                    value={`${new Date(selectedSession.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(selectedSession.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                                />
                                <DetailRow label="Location" value={selectedSession.location || "TBD"} />
                                <DetailRow label="Type" value={selectedSession.type} />
                                <DetailRow label="Mode" value={selectedSession.mode} />
                                <DetailRow label="Course" value={selectedSession.course?.code ? `${selectedSession.course.code} - ${selectedSession.course.title}` : "N/A"} />
                                <DetailRow label="Created By" value={selectedSession.createdBy?.name || selectedSession.createdBy?.email || "Unknown"} />
                            </div>
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Attendance Rules</h4>
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                                <DetailRow label="Late Threshold" value={`${selectedSession.lateThreshold} mins`} />
                                <DetailRow label="Absent Threshold" value={`${selectedSession.absentThreshold} mins`} />
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                                Attendance ({selectedSession.attendances?.length || 0})
                            </h4>
                            <div className="max-h-60 overflow-y-auto space-y-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                                {selectedSession.attendances && selectedSession.attendances.length > 0 ? (
                                    selectedSession.attendances.map((a) => (
                                        <div key={a.id} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                            <span className="text-sm text-slate-900 dark:text-white font-medium">{a.user?.name || "Unknown"}</span>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${a.status === "PRESENT"
                                                ? "bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400"
                                                : a.status === "LATE"
                                                    ? "bg-amber-100 dark:bg-amber-600/20 text-amber-700 dark:text-amber-400"
                                                    : a.status === "CHECKED_IN"
                                                        ? "bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400"
                                                        : "bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-400"
                                                }`}>
                                                {a.status}
                                            </span>
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

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedSession && (
                <div
                    className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowDeleteModal(false)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Delete Session</h2>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-2">
                            Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{selectedSession.name}</strong>?
                        </p>
                        <p className="text-sm text-slate-500">This action cannot be undone.</p>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Face Scanner Modal */}
            <FaceScannerModal
                isOpen={showScanner}
                onClose={() => { setShowScanner(false); setScannerSessionId(null); }}
                onVerify={handleAttendanceVerify}
                title="Session Check-in"
                description="Please position your face to mark your attendance for this session."
            />
        </div>
    );
};

export default Sessions;

const StatCard = ({ label, value, color }: { label: string; value: number | string; color?: string }) => {
    const colors: Record<string, string> = {
        blue: "bg-blue-600",
        green: "bg-emerald-600",
        amber: "bg-amber-600",
        slate: "bg-slate-600",
    };
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
