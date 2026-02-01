import React, { useState, useEffect } from "react";
import { ScrollArea } from "@radix-ui/themes";
import {
    BookOpen,
    Calendar,
    Clock,
    DollarSign,
    Plus,
    Users,
    X,
    ArrowUpRight,
    Copy,
    ScanFace,
    Loader2,
} from "lucide-react";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/dashboard/Header";
import { useAuthStore } from "../../store/auth.store";
import { coursesApi } from "../../api/courses.api";
import { useData } from "../../contexts/DataContext";
import type { AttendanceInterface } from "../../interfaces/attendance.interface";
import type { Course } from "../../types";
import { toast } from "sonner";
import FaceScannerModal from "../../components/attendance/FaceScannerModal";

const LecturerDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const { addAttendanceRecord, addSession, closeSession, sessions: allSessions } = useData();
    const navigate = (path: string) => window.location.href = path; // Simple navigation mock or use router if available

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showClockIn, setShowClockIn] = useState(false);
    const [sessionToEnd, setSessionToEnd] = useState<string | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch courses from backend
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setIsLoading(true);
                const response = await coursesApi.getAllCourses();
                if (response.success && response.data) {
                    setCourses(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch courses:", error);
                toast.error("Failed to load courses");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const handleClockInVerify = async () => {
        if (!user) return;
        
        // Simulate backend verification delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const now = new Date();
        const workStartTime = new Date();
        workStartTime.setHours(8, 15, 0, 0); // 8:15 AM threshold

        const status: AttendanceInterface["status"] = now > workStartTime ? "LATE" : "PRESENT";

        addAttendanceRecord({
            sessionId: "DAILY_CLOCK_IN",
            sessionName: "Daily Check-in",
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            date: now,
            checkInTime: now,
            status: status,
            confidenceScore: 0.95, // Simulated high confidence
            source: "mobile", // Assuming dashboard is accessed via device
            courseName: "N/A",
            courseCode: "STAFF"
        });

        setShowClockIn(false);
        toast.success(`Clocked in successfully! Marked as ${status}`);
    };

    // Filter sessions from the live store instead of static data
    // TODO: Replace with proper API filtering when backend integration is complete
    const sessions = allSessions.filter(s => s.creator.id === user?.id || (s as unknown as Record<string, unknown>).lecturerId === user?.id);
    const activeSessions = sessions.filter((s) => s.status === "OPEN");
    const completedSessions = sessions.filter((s) => s.status === "CLOSED").length;

    const totalStudents = courses.reduce((acc, course) => acc + (course.enrollments?.length || 0), 0);

    const copyToken = (token: string) => {
        navigator.clipboard.writeText(token);
        toast.success("Token copied to clipboard!");
    };

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-300">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-950 px-4 sm:px-8 pt-6 pb-4">
                    <Header />
                </div>

                <ScrollArea type="auto" className="flex-1">
                    <div className="px-8 pb-8">
                        {/* Welcome Header */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
                                    Good morning, Dr. {user?.name?.split(" ").pop() || "Lecturer"}
                                </h1>
                                <p className="text-lg text-slate-500 dark:text-slate-400">
                                    You have {activeSessions.length} active {activeSessions.length === 1 ? "session" : "sessions"} today
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowClockIn(true)}
                                    className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 font-semibold rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
                                >
                                    <ScanFace size={20} />
                                    <span className="hidden sm:inline">Clock In</span>
                                </button>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-blue-600/20"
                                >
                                    <Plus size={20} />
                                    New Session
                                </button>
                            </div>
                        </div>

                        {/* Active Sessions Alert */}
                        {activeSessions.length > 0 && (
                            <div className="mb-8 p-6 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl shadow-lg shadow-emerald-600/10">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
                                    <h2 className="text-xl font-bold text-white">Live Sessions</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {activeSessions.map((session) => (
                                        <div key={session.id} className="p-5 bg-white/10 backdrop-blur rounded-xl border border-white/10">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <p className="text-emerald-100 text-sm">{session.courseCode}</p>
                                                    <h3 className="text-xl font-bold text-white">{session.name}</h3>
                                                </div>
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm text-white">
                                                    <Users size={14} />
                                                    {session.actualMembersCount}/{session.expectedMembersCount}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="flex-1 p-3 bg-white/10 rounded-lg">
                                                    <p className="text-emerald-200 text-xs mb-1">Session Token</p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-2xl font-mono font-bold text-white tracking-wider">
                                                            {session.token}
                                                        </span>
                                                        <button
                                                            onClick={() => copyToken(session.token)}
                                                            className="p-1.5 hover:bg-white/10 rounded transition-colors"
                                                        >
                                                            <Copy size={16} className="text-white" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/attendance?session=${session.id}`)}
                                                    className="flex-1 py-2.5 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
                                                >
                                                    View Attendance
                                                </button>
                                                <button
                                                    onClick={() => setSessionToEnd(session.id)}
                                                    className="px-4 py-2.5 bg-red-500/20 text-red-200 font-medium rounded-lg hover:bg-red-500/30 transition-colors"
                                                >
                                                    End
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatCard
                                icon={BookOpen}
                                label="Courses"
                                value={isLoading ? "..." : courses.length}
                                subtext="Assigned to you"
                                color="blue"
                            />
                            <StatCard
                                icon={Users}
                                label="Students"
                                value={totalStudents}
                                subtext="Total enrolled"
                                color="purple"
                            />
                            <StatCard
                                icon={Calendar}
                                label="Sessions"
                                value={completedSessions}
                                subtext={`${sessions.length} total`}
                                color="amber"
                            />
                            <StatCard
                                icon={DollarSign}
                                label="Earnings"
                                value="GH₵0"
                                subtext="0h worked"
                                color="emerald"
                                highlight
                            />
                        </div>

                        {/* Main Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* My Courses */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-600 rounded-xl flex items-center justify-center">
                                            <BookOpen size={20} className="text-blue-600 dark:text-white" />
                                        </div>
                                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">My Courses</h2>
                                    </div>
                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-full">
                                        {courses.length} active
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                        </div>
                                    ) : courses.length === 0 ? (
                                        <p className="text-center py-8 text-slate-500">No courses assigned yet</p>
                                    ) : (
                                        courses.map((course) => (
                                            <div
                                                key={course.id}
                                                className="group p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">{course.code}</span>
                                                        </div>
                                                        <h3 className="text-slate-900 dark:text-white font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                            {course.title}
                                                        </h3>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <p className="text-slate-900 dark:text-white font-semibold">{course.enrollments?.length || 0}</p>
                                                            <p className="text-xs text-slate-500">students</p>
                                                        </div>
                                                        <ArrowUpRight size={18} className="text-slate-400 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Recent Sessions */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-600 rounded-xl flex items-center justify-center">
                                        <Calendar size={20} className="text-purple-600 dark:text-white" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recent Sessions</h2>
                                </div>
                                <div className="space-y-3">
                                    {sessions.slice(0, 5).map((session) => (
                                        <div key={session.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-slate-900 dark:text-white font-medium">{session.name}</h3>
                                                <span
                                                    className={`px-2.5 py-1 text-xs font-semibold rounded-full ${session.status === "OPEN"
                                                        ? "bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400"
                                                        : session.status === "SCHEDULED"
                                                            ? "bg-amber-100 dark:bg-amber-600/20 text-amber-700 dark:text-amber-400"
                                                            : "bg-slate-200 dark:bg-slate-600/20 text-slate-600 dark:text-slate-400"
                                                        }`}
                                                >
                                                    {session.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {session.startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users size={14} />
                                                    {session.actualMembersCount}/{session.expectedMembersCount}
                                                </span>
                                                <span className="text-blue-600 dark:text-blue-400 text-xs">{session.courseCode}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Earnings Summary */}
                        <div className="mt-6 p-6 bg-gradient-to-r from-emerald-900 to-emerald-800 border border-emerald-700/30 rounded-2xl shadow-lg shadow-emerald-900/10">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div>
                                    <p className="text-emerald-300 text-sm font-medium uppercase tracking-wider mb-1">
                                        Total Earnings
                                    </p>
                                    <p className="text-4xl font-bold text-white">
                                        GH₵0
                                    </p>
                                    <p className="text-emerald-200 mt-1">
                                        0 hours @ GH₵0/hr
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate("/earnings")}
                                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors shadow-lg"
                                >
                                    View Earnings Details
                                </button>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* Create Session Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Session</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Course</label>
                                <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.code} - {course.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Session Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Week 5 Lecture"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Type</label>
                                    <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                                        <option value="CLASS">Class</option>
                                        <option value="EXAM">Exam</option>
                                        <option value="PRACTICAL">Practical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Location</label>
                                    <input
                                        type="text"
                                        placeholder="Room 204"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-medium rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    // TODO: Replace mock session creation with real API call
                                    const newSession = {
                                        name: "New Session", // Could use state for input
                                        courseCode: courses[0]?.code || "CS101",
                                        courseName: courses[0]?.title || "Intro to CS",
                                        creator: {
                                            id: user?.id || "",
                                            name: user?.name || "",
                                            email: user?.email || "",
                                            role: "lecturer"
                                        },
                                        startTime: new Date(),
                                        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
                                        location: "Room 101",
                                        status: "OPEN" as const,
                                        mode: "CHECK_IN" as const, // Default mode
                                        type: "CLASS" as const,
                                        token: Math.random().toString(36).substr(2, 6).toUpperCase(),
                                        expectedMembersCount: courses[0]?.enrollments?.length || 0,
                                        actualMembersCount: 0,
                                        attendance: []
                                    };
                                    addSession(newSession as unknown as Parameters<typeof addSession>[0]);
                                    setShowCreateModal(false);
                                    toast.success("Session created successfully!");
                                }}
                                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/20"
                            >
                                Create Session
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* End Session Confirmation Modal */}
            {sessionToEnd && (
                <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">End Session?</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            Are you sure you want to end this session? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setSessionToEnd(null)}
                                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-medium rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (sessionToEnd) {
                                        closeSession(sessionToEnd);
                                        toast.success("Session ended successfully");
                                        setSessionToEnd(null);
                                    }
                                }}
                                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-red-600/20"
                            >
                                End Session
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <FaceScannerModal
                isOpen={showClockIn}
                onClose={() => setShowClockIn(false)}
                onVerify={handleClockInVerify}
                title="Lecturer Clock-in"
                description="Please position your face to mark your daily attendance."
            />
        </div>
    );
};

export default LecturerDashboard;

// Stat Card
const StatCard = ({
    icon: Icon,
    label,
    value,
    subtext,
    color,
    highlight,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    subtext: string;
    color: "blue" | "purple" | "amber" | "emerald";
    highlight?: boolean;
}) => {
    const colors = {
        blue: "bg-blue-600",
        purple: "bg-purple-600",
        amber: "bg-amber-600",
        emerald: "bg-emerald-600",
    };

    return (
        <div className={`bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-sm dark:shadow-none ${highlight ? "border-emerald-500 dark:border-emerald-700/50" : "border-slate-200 dark:border-slate-800"}`}>
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
                <div className={`w-10 h-10 ${colors[color]} rounded-xl flex items-center justify-center shadow-lg shadow-${color}-600/20`}>
                    <Icon size={18} className="text-white" />
                </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</p>
            <p className="text-sm text-slate-500">{subtext}</p>
        </div>
    );
};
