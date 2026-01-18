import React from "react";
import { ScrollArea } from "@radix-ui/themes";
import {
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    TrendingUp,
    XCircle,
    ArrowRight,
    AlertCircle,
} from "lucide-react";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/dashboard/Header";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import type { Student } from "../../interfaces/user.interface";
import FaceScannerModal from "../../components/attendance/FaceScannerModal";
import Drawer from "../../components/ui/Drawer";
import type { Course } from "../../interfaces/course.interface";
import { toast } from "sonner";

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const { addAttendanceRecord, sessions, courses, attendance } = useData();
    const student = user as Student;
    const [showScanner, setShowScanner] = React.useState(false);
    const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null);
    const [showDrawer, setShowDrawer] = React.useState(false);
    // Find the current open session for this student
    const currentSession = sessions.find(s =>
        s.status === "OPEN" &&
        student.enrolledCourses.includes(s.courseId)
    );

    const handleAttendanceVerify = async () => {
        if (!currentSession) return;

        addAttendanceRecord({
            sessionId: currentSession.id,
            userId: student.id,
            userName: student.name,
            userEmail: student.email,
            date: new Date(),
            status: "PRESENT",
            checkInTime: new Date(),
            sessionName: currentSession.name,
            courseCode: currentSession.courseCode,
            source: "mobile"
        });

        toast.success("Attendance marked successfully!");
        setShowScanner(false);
    };

    // Derived Data from Context
    const enrolledCourses = courses.filter(c => student.enrolledCourses.includes(c.id));

    // Get student's attendance records
    const myAttendance = attendance.filter(a => a.userId === student.id);
    const recentAttendance = [...myAttendance]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    // Calculate Stats
    const totalRecords = myAttendance.length;
    const present = myAttendance.filter(a => a.status === "PRESENT").length;
    const late = myAttendance.filter(a => a.status === "LATE").length;
    const absent = myAttendance.filter(a => a.status === "ABSENT").length;
    // Simple rate calculation: (Present + Late) / Total Expected. 
    // For now, we compare against total records. Ideally we'd compare against total past sessions.
    const rate = totalRecords > 0 ? ((present + late) / totalRecords) * 100 : 0;

    const attendanceStats = {
        present,
        late,
        absent,
        rate
    };

    const upcomingSessions = sessions
        .filter(
            (session) =>
                student.enrolledCourses.includes(session.courseId) &&
                (session.status === "OPEN" || session.status === "SCHEDULED")
        )
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, 3);



    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-300">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-950 px-4 sm:px-8 pt-6 pb-4">
                    <Header />
                </div>

                <ScrollArea type="auto" className="flex-1">
                    <div className="px-8 pb-8">
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl">👋</span>
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    Welcome back, {student.name.split(" ")[0]}
                                </h1>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-lg">
                                Track your classes, monitor attendance, and stay on top of your academic journey.
                            </p>
                        </div>

                        {/* Attendance Overview Banner */}
                        <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg shadow-blue-600/10">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">
                                        Semester Attendance Rate
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-5xl font-bold ${attendanceStats.rate >= 75 ? 'text-white' : 'text-amber-300'}`}>
                                            {attendanceStats.rate.toFixed(1)}%
                                        </span>
                                        <span className="text-blue-200">
                                            {attendanceStats.rate >= 75 ? "Great work!" : "Needs improvement"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-8">
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-white">{attendanceStats.present}</p>
                                        <p className="text-blue-200 text-sm">Present</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-amber-300">{attendanceStats.late}</p>
                                        <p className="text-blue-200 text-sm">Late</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-red-300">{attendanceStats.absent}</p>
                                        <p className="text-blue-200 text-sm">Absent</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatCard
                                icon={TrendingUp}
                                label="Attendance Rate"
                                value={`${attendanceStats.rate.toFixed(0)}%`}
                                trend={attendanceStats.rate >= 75 ? "On Track" : "Below Target"}
                                trendUp={attendanceStats.rate >= 75}
                                color="emerald"
                            />
                            <StatCard
                                icon={CheckCircle}
                                label="Classes Attended"
                                value={attendanceStats.present + attendanceStats.late}
                                subValue={`${attendanceStats.present} on time`}
                                color="blue"
                            />
                            <StatCard
                                icon={Clock}
                                label="Late Arrivals"
                                value={attendanceStats.late}
                                subValue="This semester"
                                color="amber"
                            />
                            <StatCard
                                icon={XCircle}
                                label="Absences"
                                value={attendanceStats.absent}
                                subValue="This semester"
                                color="red"
                            />
                        </div>

                        {/* Main Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Enrolled Courses */}
                            <div className="lg:col-span-2">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-600 rounded-xl flex items-center justify-center">
                                            <BookOpen size={20} className="text-blue-600 dark:text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">My Courses</h2>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{enrolledCourses.length} enrolled</p>
                                        </div>
                                    </div>
                                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                                        View All
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {enrolledCourses.map((course) => (
                                        <div
                                            key={course.id}
                                            onClick={() => { setSelectedCourse(course); setShowDrawer(true); }}
                                            className="group flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer shadow-sm dark:shadow-none"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-600/20 rounded-xl flex items-center justify-center">
                                                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">{course.code.slice(0, 3)}</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {course.name}
                                                    </h3>
                                                    <p className="text-sm text-slate-500">
                                                        {course.lecturerName} • {course.department}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-full">
                                                    {course.code}
                                                </span>
                                                <ArrowRight size={18} className="text-slate-400 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Upcoming Sessions */}
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-600 rounded-xl flex items-center justify-center">
                                        <Calendar size={20} className="text-purple-600 dark:text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Upcoming</h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Next sessions</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {upcomingSessions.length === 0 ? (
                                        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center shadow-sm dark:shadow-none">
                                            <AlertCircle size={32} className="mx-auto text-slate-400 dark:text-slate-600 mb-3" />
                                            <p className="text-slate-500 dark:text-slate-400">No upcoming sessions</p>
                                        </div>
                                    ) : (
                                        upcomingSessions.map((session) => (
                                            <div
                                                key={session.id}
                                                className={`p-4 bg-white dark:bg-slate-900 border rounded-xl shadow-sm dark:shadow-none ${session.status === "OPEN" ? "border-emerald-500 dark:border-emerald-600/50" : "border-slate-200 dark:border-slate-800"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <span
                                                        className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 ${session.status === "OPEN"
                                                            ? "bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400"
                                                            : "bg-amber-100 dark:bg-amber-600/20 text-amber-700 dark:text-amber-400"
                                                            }`}
                                                    >
                                                        {session.status === "OPEN" && (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                                                        )}
                                                        {session.status === "OPEN" ? "Live Now" : "Scheduled"}
                                                    </span>
                                                    <span className="text-xs text-slate-500 font-medium">{session.courseCode}</span>
                                                </div>
                                                <h3 className="font-medium text-slate-900 dark:text-white mb-2">{session.name}</h3>
                                                <div className="space-y-1 text-xs text-slate-500">
                                                    <p className="flex items-center gap-2">
                                                        <Clock size={12} />
                                                        {session.startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {session.endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    </p>
                                                    <p>📍 {session.location}</p>
                                                </div>
                                                {session.status === "OPEN" && (
                                                    <button
                                                        onClick={() => setShowScanner(true)}
                                                        className="w-full mt-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                                                    >
                                                        Check In Now
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Attendance Table */}
                        <div className="mt-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recent Attendance</h2>
                                <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                                    View All Records
                                </button>
                            </div>
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm dark:shadow-none">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Session</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Course</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                        {recentAttendance.map((record) => (
                                            <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{record.sessionName}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400 text-xs font-medium rounded">
                                                        {record.courseCode}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(record.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                                    {record.checkInTime
                                                        ? new Date(record.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                                        : "-"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={record.status} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>

            <FaceScannerModal
                isOpen={showScanner}
                onClose={() => setShowScanner(false)}
                onVerify={handleAttendanceVerify}
                title="Student Check-in"
                description="Please position your face to mark your attendance for the current session."
            />

            <Drawer
                isOpen={showDrawer}
                onClose={() => { setShowDrawer(false); setSelectedCourse(null); }}
                title="Course Details"
                width="max-w-lg"
            >
                {selectedCourse && (
                    <div className="space-y-6">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedCourse.name}</h3>
                                <span className="px-2 py-1 bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 text-xs font-bold rounded border border-blue-100 dark:border-blue-700">
                                    {selectedCourse.code}
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{selectedCourse.description || "No description provided."}</p>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <p className="text-xs text-slate-500 mb-1">Lecturer</p>
                                    <p className="font-medium text-slate-900 dark:text-white text-sm">{selectedCourse.lecturerName}</p>
                                </div>
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <p className="text-xs text-slate-500 mb-1">Department</p>
                                    <p className="font-medium text-slate-900 dark:text-white text-sm">{selectedCourse.department || "N/A"}</p>
                                </div>
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <p className="text-xs text-slate-500 mb-1">Enrolled</p>
                                    <p className="font-medium text-slate-900 dark:text-white text-sm">{selectedCourse.enrolledStudents.length} Students</p>
                                </div>
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <p className="text-xs text-slate-500 mb-1">Created</p>
                                    <p className="font-medium text-slate-900 dark:text-white text-sm">{new Date(selectedCourse.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Drawer>
        </div >
    );
};

export default StudentDashboard;

// Stat Card
interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    subValue?: string;
    trend?: string;
    trendUp?: boolean;
    color: "emerald" | "blue" | "amber" | "red" | "purple";
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, subValue, trend, trendUp, color }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
            <div className={`w-10 h-10 ${color === "emerald" ? "bg-emerald-100 dark:bg-emerald-600" :
                color === "blue" ? "bg-blue-100 dark:bg-blue-600" :
                    color === "amber" ? "bg-amber-100 dark:bg-amber-600" :
                        color === "red" ? "bg-red-100 dark:bg-red-600" :
                            "bg-purple-100 dark:bg-purple-600"} rounded-xl flex items-center justify-center shadow-lg shadow-${color}-600/20`}>
                <Icon size={18} className={`${color === "emerald" ? "text-emerald-600 dark:text-white" :
                    color === "blue" ? "text-blue-600 dark:text-white" :
                        color === "amber" ? "text-amber-600 dark:text-white" :
                            color === "red" ? "text-red-600 dark:text-white" :
                                "text-purple-600 dark:text-white"}`} />
            </div>
        </div>
        <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</p>
        {subValue && <p className="text-sm text-slate-500">{subValue}</p>}
        {trend && (
            <p className={`text-sm font-medium ${trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                {trend}
            </p>
        )}
    </div>
);

// Status Badge
const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, { bg: string; text: string }> = {
        PRESENT: { bg: "bg-emerald-100 dark:bg-emerald-600/20", text: "text-emerald-700 dark:text-emerald-400" },
        LATE: { bg: "bg-amber-100 dark:bg-amber-600/20", text: "text-amber-700 dark:text-amber-400" },
        ABSENT: { bg: "bg-red-100 dark:bg-red-600/20", text: "text-red-700 dark:text-red-400" },
    };

    const style = styles[status] || { bg: "bg-slate-200 dark:bg-slate-600/20", text: "text-slate-600 dark:text-slate-400" };

    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${style.bg} ${style.text}`}>
            {status}
        </span>
    );
};
