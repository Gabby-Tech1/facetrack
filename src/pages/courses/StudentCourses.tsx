import React, { useState, useEffect } from "react";
import { ScrollArea } from "@radix-ui/themes";
import {
    BookOpen,
    Search,
    Loader2,
    Users,
    Clock,
    ArrowRight,
    Calendar,
    GraduationCap,
} from "lucide-react";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/dashboard/Header";
import { useAuthStore } from "../../store/auth.store";
import { coursesApi } from "../../api/courses.api";
import Drawer from "../../components/ui/Drawer";
import type { Course } from "../../types";
import { toast } from "sonner";

const StudentCourses: React.FC = () => {
    const { user } = useAuthStore();
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [showDrawer, setShowDrawer] = useState(false);

    // Fetch enrolled courses from backend
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
                toast.error("Failed to load enrolled courses");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, []);

    // Filter courses by search query
    const filteredCourses = courses.filter(
        (course) =>
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-300">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-950 px-4 sm:px-8 pt-6 pb-4">
                    <Header />
                </div>

                <ScrollArea type="auto" className="flex-1">
                    <div className="px-8 pb-8">
                        {/* Page Header */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                                        <GraduationCap size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                            My Courses
                                        </h1>
                                        <p className="text-slate-500 dark:text-slate-400">
                                            {isLoading ? "Loading..." : `${courses.length} enrolled courses`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="relative w-full lg:w-80">
                                <Search
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Search courses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Stats Summary */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatCard
                                icon={BookOpen}
                                label="Total Courses"
                                value={isLoading ? "..." : courses.length}
                                color="blue"
                            />
                            <StatCard
                                icon={Users}
                                label="Total Classmates"
                                value={isLoading ? "..." : courses.reduce((acc, c) => acc + (c.enrollments?.length || 0), 0)}
                                color="purple"
                            />
                            <StatCard
                                icon={Calendar}
                                label="Total Sessions"
                                value={isLoading ? "..." : courses.reduce((acc, c) => acc + (c.sessions?.length || 0), 0)}
                                color="amber"
                            />
                            <StatCard
                                icon={Clock}
                                label="Credit Hours"
                                value={isLoading ? "..." : courses.reduce((acc, c) => acc + (c.creditHours || 0), 0)}
                                color="emerald"
                            />
                        </div>

                        {/* Courses Grid */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="flex flex-col items-center gap-4">
                                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                                    <p className="text-slate-500">Loading your courses...</p>
                                </div>
                            </div>
                        ) : filteredCourses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                                <BookOpen size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                    {searchQuery ? "No courses found" : "No courses enrolled"}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
                                    {searchQuery
                                        ? "Try adjusting your search query"
                                        : "Complete your enrollment to start accessing your courses"}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredCourses.map((course) => {
                                    const primaryLecturer = course.lecturers?.[0]?.lecturer?.user?.name || "TBA";
                                    return (
                                        <div
                                            key={course.id}
                                            onClick={() => {
                                                setSelectedCourse(course);
                                                setShowDrawer(true);
                                            }}
                                            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer"
                                        >
                                            {/* Course Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-600/20 rounded-xl flex items-center justify-center">
                                                    <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                                                        {course.code.slice(0, 2)}
                                                    </span>
                                                </div>
                                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full">
                                                    {course.code}
                                                </span>
                                            </div>

                                            {/* Course Info */}
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                                {course.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                                                {course.description || "No description available"}
                                            </p>

                                            {/* Lecturer */}
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                                    <Users size={14} className="text-slate-500" />
                                                </div>
                                                <span className="text-sm text-slate-600 dark:text-slate-300">
                                                    {primaryLecturer}
                                                </span>
                                            </div>

                                            {/* Stats */}
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-4">
                                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                                        <Users size={12} />
                                                        {course.enrollments?.length || 0} students
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                                        <Calendar size={12} />
                                                        {course.sessions?.length || 0} sessions
                                                    </span>
                                                </div>
                                                <ArrowRight
                                                    size={16}
                                                    className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Course Details Drawer */}
            <Drawer
                isOpen={showDrawer}
                onClose={() => {
                    setShowDrawer(false);
                    setSelectedCourse(null);
                }}
                title="Course Details"
                width="max-w-lg"
            >
                {selectedCourse && (
                    <div className="space-y-6">
                        {/* Course Header */}
                        <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                                    <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">
                                        {selectedCourse.code.slice(0, 2)}
                                    </span>
                                </div>
                                <span className="px-3 py-1.5 bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 text-sm font-bold rounded-lg border border-blue-200 dark:border-blue-700">
                                    {selectedCourse.code}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                {selectedCourse.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 text-sm">
                                {selectedCourse.description || "No description provided."}
                            </p>
                        </div>

                        {/* Course Info Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <InfoCard
                                label="Lecturer"
                                value={selectedCourse.lecturers?.[0]?.lecturer?.user?.name || "TBA"}
                            />
                            <InfoCard
                                label="Credit Hours"
                                value={selectedCourse.creditHours?.toString() || "N/A"}
                            />
                            <InfoCard
                                label="Enrolled Students"
                                value={`${selectedCourse.enrollments?.length || 0} students`}
                            />
                            <InfoCard
                                label="Total Sessions"
                                value={`${selectedCourse.sessions?.length || 0} sessions`}
                            />
                        </div>

                        {/* Lecturers List */}
                        {selectedCourse.lecturers && selectedCourse.lecturers.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                    Course Lecturers
                                </h4>
                                <div className="space-y-2">
                                    {selectedCourse.lecturers.map((cl) => (
                                        <div
                                            key={cl.id}
                                            className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                                        >
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-600/20 rounded-full flex items-center justify-center">
                                                <Users size={16} className="text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white text-sm">
                                                    {cl.lecturer?.user?.name || "Unknown"}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {cl.lecturer?.user?.email || ""}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Created Date */}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                            <p className="text-xs text-slate-500">
                                Course created on {new Date(selectedCourse.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default StudentCourses;

// Stat Card Component
const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: "blue" | "purple" | "amber" | "emerald";
}) => {
    const colors = {
        blue: "bg-blue-100 dark:bg-blue-600 text-blue-600 dark:text-white",
        purple: "bg-purple-100 dark:bg-purple-600 text-purple-600 dark:text-white",
        amber: "bg-amber-100 dark:bg-amber-600 text-amber-600 dark:text-white",
        emerald: "bg-emerald-100 dark:bg-emerald-600 text-emerald-600 dark:text-white",
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
                <div className={`w-10 h-10 ${colors[color]} rounded-xl flex items-center justify-center`}>
                    <Icon size={18} />
                </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    );
};

// Info Card Component
const InfoCard = ({ label, value }: { label: string; value: string }) => (
    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        <p className="font-medium text-slate-900 dark:text-white text-sm">{value}</p>
    </div>
);
