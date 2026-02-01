import React, { useState, useEffect, useMemo } from "react";
import { ScrollArea } from "@radix-ui/themes";
import {
    BookOpen,
    Users,
    Search,
    Plus,
    Edit,
    Trash2,
    X,
    MoreVertical,
    Loader2,
    RefreshCw,
    GraduationCap,
    Clock,
} from "lucide-react";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/dashboard/Header";
import { useAuthStore } from "../../store/auth.store";
import { coursesApi } from "../../api/courses.api";
import { usersApi } from "../../api/users.api";
import { toast } from "sonner";
import Drawer from "../../components/ui/Drawer";
import { Role } from "../../types";
import type { Course, User } from "../../types";

const Courses: React.FC = () => {
    const { user } = useAuthStore();

    // Data state
    const [courses, setCourses] = useState<Course[]>([]);
    const [lecturers, setLecturers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // UI state
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        courseCode: "",
        title: "",
        description: "",
        lecturerId: "",
    });

    const [isAssigningRep, setIsAssigningRep] = useState(false);
    const [selectedStudentForRep, setSelectedStudentForRep] = useState("");

    // Fetch courses and lecturers on mount
    useEffect(() => {
        let isCancelled = false;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [coursesRes, usersRes] = await Promise.all([
                    coursesApi.getAllCourses(),
                    usersApi.getAllUsers().catch(() => ({ users: [] })),
                ]);

                if (!isCancelled) {
                    setCourses(coursesRes.data || []);
                    // Filter users to get only lecturers
                    const lecturerUsers = (usersRes.users || []).filter(
                        (u: User) => u.role === Role.LECTURER
                    );
                    setLecturers(lecturerUsers);
                }
            } catch (error) {
                if (!isCancelled) {
                    // Don't show error for rate limiting
                    if (error instanceof Error && error.message.includes("429")) {
                        console.warn("Rate limited, please wait and try again");
                    } else {
                        console.error("Failed to fetch data:", error);
                        toast.error("Failed to load courses");
                    }
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

    // Refresh data
    const refreshData = async () => {
        try {
            setIsLoading(true);
            const [coursesRes, usersRes] = await Promise.all([
                coursesApi.getAllCourses(),
                usersApi.getAllUsers().catch(() => ({ users: [] })),
            ]);
            setCourses(coursesRes.data || []);
            const lecturerUsers = (usersRes.users || []).filter(
                (u: User) => u.role === Role.LECTURER
            );
            setLecturers(lecturerUsers);
        } catch (error) {
            console.error("Failed to refresh data:", error);
            toast.error("Failed to refresh data");
        } finally {
            setIsLoading(false);
        }
    };

    // Filter courses
    const filteredCourses = useMemo(() => {
        return courses.filter(
            (c) =>
                c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.code.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [courses, searchQuery]);

    // Stats
    const stats = useMemo(() => {
        const totalStudents = courses.reduce(
            (acc, c) => acc + (c.enrollments?.length || 0),
            0
        );
        const totalSessions = courses.reduce(
            (acc, c) => acc + (c.sessions?.length || 0),
            0
        );
        return {
            totalCourses: courses.length,
            totalStudents,
            totalLecturers: lecturers.length,
            totalSessions,
        };
    }, [courses, lecturers]);

    // Reset form
    const resetForm = () => {
        setFormData({
            courseCode: "",
            title: "",
            description: "",
            lecturerId: "",
        });
    };

    // Handle add course
    const handleAddCourse = async () => {
        if (!formData.courseCode.trim()) {
            toast.error("Course code is required");
            return;
        }
        if (!formData.title.trim()) {
            toast.error("Course title is required");
            return;
        }
        if (!formData.description.trim()) {
            toast.error("Course description is required");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await coursesApi.addCourse({
                courseCode: formData.courseCode.trim(),
                title: formData.title.trim(),
                description: formData.description.trim(),
                lecturerId: formData.lecturerId || undefined,
            });

            if (response.success && response.data) {
                setCourses((prev) => [response.data!, ...prev]);
                toast.success("Course added successfully!");
                setShowAddModal(false);
                resetForm();
            } else if (response.message) {
                toast.info(response.message);
                setShowAddModal(false);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to add course");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle edit course
    const handleEditCourse = async () => {
        if (!selectedCourse) return;
        if (!formData.title.trim()) {
            toast.error("Course title is required");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await coursesApi.updateCourse(selectedCourse.id, {
                title: formData.title.trim(),
                description: formData.description.trim() || undefined,
                courseCode: formData.courseCode.trim() || undefined,
                lecturerId: formData.lecturerId || undefined,
            });

            if (response.success && response.data) {
                setCourses((prev) =>
                    prev.map((c) => (c.id === selectedCourse.id ? response.data! : c))
                );
                toast.success("Course updated successfully!");
                setShowEditModal(false);
                setSelectedCourse(null);
                resetForm();
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update course");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete course
    const handleDeleteCourse = async () => {
        if (!selectedCourse) return;

        setIsSubmitting(true);
        try {
            await coursesApi.removeCourse(selectedCourse.id);
            setCourses((prev) => prev.filter((c) => c.id !== selectedCourse.id));
            toast.success("Course deleted successfully!");
            setShowDeleteModal(false);
            setSelectedCourse(null);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete course");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Open edit modal
    const openEditModal = (course: Course) => {
        setSelectedCourse(course);
        // Find lecturer from lecturers relation
        const courseLecturer = course.lecturers?.[0];
        setFormData({
            courseCode: course.code,
            title: course.title,
            description: course.description || "",
            lecturerId: courseLecturer?.lecturerId || "",
        });
        setShowEditModal(true);
        setDropdownOpen(null);
    };

    // Get lecturer name for a course
    const getLecturerName = (course: Course) => {
        const courseLecturer = course.lecturers?.[0];
        if (courseLecturer?.lecturer?.user) {
            return courseLecturer.lecturer.user.name;
        }
        // Fallback: find from lecturers list
        const lecturer = lecturers.find((l) => l.id === courseLecturer?.lecturerId);
        return lecturer?.name || "Not Assigned";

    };

    // Handle assign rep
    const handleAssignRep = async () => {
        if (!selectedCourse || !selectedStudentForRep) return;
        setIsSubmitting(true);
        try {
            await coursesApi.assignRep(selectedCourse.id, selectedStudentForRep);
            toast.success("Class Rep assigned successfully");
            setIsAssigningRep(false);
            setSelectedStudentForRep("");

            // Close drawer and refresh to see update
            setShowDrawer(false);
            refreshData();
        } catch (error) {
            // Cast error to handle response message
            const message = (error as any)?.response?.data?.message || (error instanceof Error ? error.message : "Failed to assign rep");
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Check if user can manage courses
    const canManageCourses = user?.role === Role.ADMIN || user?.role === Role.SYSTEM_ADMIN;

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
                                    Course Management
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Manage all courses in the system
                                </p>
                            </div>
                            {canManageCourses && (
                                <button
                                    onClick={() => {
                                        resetForm();
                                        setShowAddModal(true);
                                    }}
                                    className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20"
                                >
                                    <Plus size={20} /> Add Course
                                </button>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatCard
                                label="Total Courses"
                                value={stats.totalCourses}
                                icon={BookOpen}
                                color="blue"
                            />
                            <StatCard
                                label="Enrolled Students"
                                value={stats.totalStudents}
                                icon={GraduationCap}
                                color="emerald"
                            />
                            <StatCard
                                label="Lecturers"
                                value={stats.totalLecturers}
                                icon={Users}
                                color="purple"
                            />
                            <StatCard
                                label="Total Sessions"
                                value={stats.totalSessions}
                                icon={Clock}
                                color="amber"
                            />
                        </div>

                        {/* Search & Filter */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by course name or code..."
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <button
                                    onClick={refreshData}
                                    disabled={isLoading}
                                    className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
                                </button>
                            </div>
                        </div>

                        {/* Loading State */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                        ) : (
                            /* Table */
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                                    Code
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                                    Course Name
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                                    Lecturer
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                                    Students
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                                    Sessions
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {filteredCourses.map((course) => (
                                                <tr
                                                    key={course.id}
                                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-lg border border-blue-200 dark:border-blue-600/30">
                                                            {course.code}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="text-slate-900 dark:text-white font-medium">
                                                                {course.title}
                                                            </p>
                                                            {course.description && (
                                                                <p className="text-slate-500 dark:text-slate-400 text-sm truncate max-w-xs">
                                                                    {course.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                        {getLecturerName(course)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-600/20 flex items-center justify-center text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                                                {course.enrollments?.length || 0}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-slate-600 dark:text-slate-400">
                                                            {course.sessions?.length || 0}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 relative">
                                                        <button
                                                            onClick={() =>
                                                                setDropdownOpen(
                                                                    dropdownOpen === course.id ? null : course.id
                                                                )
                                                            }
                                                            className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                        >
                                                            <MoreVertical size={18} />
                                                        </button>
                                                        {dropdownOpen === course.id && (
                                                            <div className="absolute right-6 top-12 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-10 overflow-hidden">
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedCourse(course);
                                                                        setShowDrawer(true);
                                                                        setDropdownOpen(null);
                                                                    }}
                                                                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                                                >
                                                                    <BookOpen size={14} /> View Details
                                                                </button>
                                                                {canManageCourses && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => openEditModal(course)}
                                                                            className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                                                        >
                                                                            <Edit size={14} /> Edit Course
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedCourse(course);
                                                                                setShowDeleteModal(true);
                                                                                setDropdownOpen(null);
                                                                            }}
                                                                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                                                        >
                                                                            <Trash2 size={14} /> Delete Course
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {filteredCourses.length === 0 && (
                                    <div className="text-center py-12">
                                        <BookOpen
                                            size={48}
                                            className="mx-auto text-slate-300 dark:text-slate-600 mb-4"
                                        />
                                        <p className="text-slate-500 dark:text-slate-400">
                                            {searchQuery ? "No courses found matching your search" : "No courses available"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <Modal
                    title="Add New Course"
                    onClose={() => {
                        if (!isSubmitting) {
                            setShowAddModal(false);
                            resetForm();
                        }
                    }}
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.courseCode}
                                    onChange={(e) =>
                                        setFormData({ ...formData, courseCode: e.target.value })
                                    }
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="CS101"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Course Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Introduction to Computer Science"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Enter course description..."
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Lecturer (Optional)
                            </label>
                            <select
                                value={formData.lecturerId}
                                onChange={(e) =>
                                    setFormData({ ...formData, lecturerId: e.target.value })
                                }
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isSubmitting}
                            >
                                <option value="">Select Lecturer</option>
                                {lecturers.filter(l => l.lecturer?.id).map((l) => (
                                    <option key={l.lecturer!.id} value={l.lecturer!.id}>
                                        {l.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={() => {
                                setShowAddModal(false);
                                resetForm();
                            }}
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-medium disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddCourse}
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                "Add Course"
                            )}
                        </button>
                    </div>
                </Modal>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedCourse && (
                <Modal
                    title="Edit Course"
                    onClose={() => {
                        if (!isSubmitting) {
                            setShowEditModal(false);
                            setSelectedCourse(null);
                            resetForm();
                        }
                    }}
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Code
                                </label>
                                <input
                                    type="text"
                                    value={formData.courseCode}
                                    onChange={(e) =>
                                        setFormData({ ...formData, courseCode: e.target.value })
                                    }
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Course Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Lecturer
                            </label>
                            <select
                                value={formData.lecturerId}
                                onChange={(e) =>
                                    setFormData({ ...formData, lecturerId: e.target.value })
                                }
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isSubmitting}
                            >
                                <option value="">Select Lecturer</option>
                                {lecturers.filter(l => l.lecturer?.id).map((l) => (
                                    <option key={l.lecturer!.id} value={l.lecturer!.id}>
                                        {l.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={() => {
                                setShowEditModal(false);
                                setSelectedCourse(null);
                                resetForm();
                            }}
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-medium disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleEditCourse}
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </Modal>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedCourse && (
                <Modal
                    title="Delete Course"
                    onClose={() => {
                        if (!isSubmitting) {
                            setShowDeleteModal(false);
                            setSelectedCourse(null);
                        }
                    }}
                >
                    <div className="text-center py-4">
                        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-600/20 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-8 h-8 text-red-600" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-2">
                            Are you sure you want to delete{" "}
                            <strong className="text-slate-900 dark:text-white">
                                {selectedCourse.title}
                            </strong>
                            ?
                        </p>
                        <p className="text-sm text-slate-500">
                            This action cannot be undone. All session and attendance data will be
                            permanently removed.
                        </p>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={() => {
                                setShowDeleteModal(false);
                                setSelectedCourse(null);
                            }}
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-medium disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteCourse}
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Course"
                            )}
                        </button>
                    </div>
                </Modal>
            )}

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
                        {/* Course Info Card */}
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {selectedCourse.title}
                                </h3>
                                <span className="px-2.5 py-1 bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-lg border border-blue-100 dark:border-blue-700">
                                    {selectedCourse.code}
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                                {selectedCourse.description || "No description provided."}
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <p className="text-xs text-slate-500 mb-1">Lecturer</p>
                                    <p className="font-medium text-slate-900 dark:text-white text-sm">
                                        {getLecturerName(selectedCourse)}
                                    </p>
                                </div>
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <p className="text-xs text-slate-500 mb-1">Enrolled</p>
                                    <p className="font-medium text-slate-900 dark:text-white text-sm">
                                        {selectedCourse.enrollments?.length || 0} Students
                                    </p>
                                </div>
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <p className="text-xs text-slate-500 mb-1">Sessions</p>
                                    <p className="font-medium text-slate-900 dark:text-white text-sm">
                                        {selectedCourse.sessions?.length || 0} Total
                                    </p>
                                </div>
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <p className="text-xs text-slate-500 mb-1">Created</p>
                                    <p className="font-medium text-slate-900 dark:text-white text-sm">
                                        {new Date(selectedCourse.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Enrolled Students */}
                        {canManageCourses && selectedCourse.enrollments && selectedCourse.enrollments.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-semibold text-slate-900 dark:text-white">
                                    Enrolled Students ({selectedCourse.enrollments.length})
                                </h4>
                                <div className="max-h-64 overflow-y-auto space-y-2">
                                    {selectedCourse.enrollments.map((enrollment) => (
                                        <div
                                            key={enrollment.id}
                                            className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-600/20 flex items-center justify-center">
                                                    <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">
                                                        {enrollment.student?.user?.name || "Unknown"}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {enrollment.student?.studentId || "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-slate-400">
                                                {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Course Reps */}
                        {(selectedCourse.reps?.length || 0) > 0 || (user?.role === Role.ADMIN || user?.role === Role.SYSTEM_ADMIN || (user?.role === Role.LECTURER && selectedCourse.lecturers?.some(cl => cl.lecturer?.userId === user.id))) ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-slate-900 dark:text-white">
                                        Course Representatives
                                    </h4>
                                    {!isAssigningRep && (user?.role === Role.ADMIN || user?.role === Role.SYSTEM_ADMIN || (user?.role === Role.LECTURER && selectedCourse.lecturers?.some(cl => cl.lecturer?.userId === user.id))) && (
                                        <button
                                            onClick={() => setIsAssigningRep(true)}
                                            className="text-xs text-blue-600 font-medium hover:underline"
                                        >
                                            + Assign Rep
                                        </button>
                                    )}
                                </div>

                                {isAssigningRep && (
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Student</p>
                                        <select
                                            value={selectedStudentForRep}
                                            onChange={(e) => setSelectedStudentForRep(e.target.value)}
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="">Select a student...</option>
                                            {selectedCourse.enrollments?.filter(e => !selectedCourse.reps?.some(r => r.studentId === e.studentId)).map(e => (
                                                <option key={e.student?.id} value={e.student?.id}>
                                                    {e.student?.user?.name || e.student?.matricNo || "Unknown"}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setIsAssigningRep(false)}
                                                className="flex-1 py-2 text-xs font-medium text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAssignRep}
                                                disabled={!selectedStudentForRep || isSubmitting}
                                                className="flex-1 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg disabled:opacity-50 hover:bg-blue-700"
                                            >
                                                {isSubmitting ? "Assigning..." : "Confirm"}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {selectedCourse.reps && selectedCourse.reps.map((rep) => (
                                    <div
                                        key={rep.id}
                                        className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-600/20 flex items-center justify-center">
                                                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    {rep.student?.user?.name || "Unknown"}
                                                </p>
                                                <p className="text-xs text-purple-600 dark:text-purple-400">
                                                    Course Rep
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default Courses;

// ============================================
// COMPONENTS
// ============================================

interface StatCardProps {
    label: string;
    value: number;
    icon: React.ElementType;
    color: "blue" | "emerald" | "purple" | "amber";
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color }) => {
    const colors = {
        blue: "bg-blue-600",
        emerald: "bg-emerald-600",
        purple: "bg-purple-600",
        amber: "bg-amber-600",
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{label}</p>
            <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
                <div className={`p-2.5 ${colors[color]} rounded-xl`}>
                    <Icon size={20} className="text-white" />
                </div>
            </div>
        </div>
    );
};

interface ModalProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => (
    <div
        className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
    >
        <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
                <button
                    onClick={onClose}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                    <X size={20} />
                </button>
            </div>
            {children}
        </div>
    </div>
);
