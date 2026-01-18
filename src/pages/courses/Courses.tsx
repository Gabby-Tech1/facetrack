import React, { useState, useMemo } from "react";
import { ScrollArea } from "@radix-ui/themes";
import { BookOpen, Users, Search, Plus, Edit, Trash2, X, MoreVertical, CheckCircle } from "lucide-react";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/dashboard/Header";
import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import Drawer from "../../components/ui/Drawer";
import type { Course } from "../../interfaces/course.interface";

const Courses: React.FC = () => {
    const { courses, lecturers, students, addCourse, updateCourse, deleteCourse, enrollStudent, unenrollStudent } = useData();
    const { user } = useAuth();

    const [searchQuery, setSearchQuery] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false); // Using Drawer instead of Modal
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        code: "", name: "", department: "", lecturerId: "", lecturerName: "",
    });

    const filteredCourses = courses.filter(
        (c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const resetForm = () => setFormData({ code: "", name: "", department: "", lecturerId: "", lecturerName: "" });

    const handleAddCourse = () => {
        if (!formData.code || !formData.name) { toast.error("Code and name are required"); return; }
        const lecturer = lecturers.find((l) => l.id === formData.lecturerId);
        addCourse({
            code: formData.code, name: formData.name, department: formData.department,
            lecturerId: formData.lecturerId, lecturerName: lecturer?.name || "TBD",
            enrolledStudents: [], totalSessions: 0, createdAt: new Date(),
        });
        toast.success("Course added successfully!");
        setShowAddModal(false);
        resetForm();
    };

    const handleEditCourse = () => {
        if (!selectedCourse || !formData.name) return;
        const lecturer = lecturers.find((l) => l.id === formData.lecturerId);
        updateCourse(selectedCourse.id, {
            code: formData.code, name: formData.name, department: formData.department,
            lecturerId: formData.lecturerId, lecturerName: lecturer?.name || selectedCourse.lecturerName,
        });
        toast.success("Course updated!");
        setShowEditModal(false);
        setSelectedCourse(null);
    };

    const handleDeleteCourse = () => {
        if (!selectedCourse) return;
        deleteCourse(selectedCourse.id);
        toast.success("Course deleted!");
        setShowDeleteModal(false);
        setSelectedCourse(null);
    };

    const handleEnroll = (courseId: string) => {
        if (!user || user.role !== "student") return;
        enrollStudent(user.id, courseId);
        toast.success("Enrolled successfully!");
    };

    const handleUnenroll = (courseId: string) => {
        if (!user || user.role !== "student") return;
        unenrollStudent(user.id, courseId);
        toast.success("Unenrolled successfully!");
    };

    const openEditModal = (course: Course) => {
        setSelectedCourse(course);
        setFormData({ code: course.code, name: course.name, department: course.department || "", lecturerId: course.lecturerId, lecturerName: course.lecturerName });
        setShowEditModal(true);
        setDropdownOpen(null);
    };

    const enrolledStudentsList = useMemo(() => {
        if (!selectedCourse) return [];
        return students.filter((s) => selectedCourse.enrolledStudents.includes(s.id));
    }, [selectedCourse, students]);

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
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Course Management</h1>
                                <p className="text-slate-500 dark:text-slate-400">Manage all courses in the system</p>
                            </div>
                            {user?.role !== "student" && (
                                <button onClick={() => { resetForm(); setShowAddModal(true); }} className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all">
                                    <Plus size={20} /> Add Course
                                </button>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatCard label="Total Courses" value={courses.length} color="blue" />
                            <StatCard label="Total Students" value={students.length} color="emerald" />
                            <StatCard label="Total Lecturers" value={lecturers.length} color="purple" />
                            <StatCard label="Departments" value={new Set(courses.map(c => c.department)).size} color="amber" />
                        </div>

                        {/* Search */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6 shadow-sm dark:shadow-none">
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search courses..." className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm dark:shadow-none">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Code</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Course Name</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Lecturer</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Students</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Department</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredCourses.map((course) => (
                                            <tr key={course.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-300 text-xs font-medium rounded border border-blue-200 dark:border-blue-600/30">
                                                        {course.code}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{course.name}</td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{course.lecturerName}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex -space-x-2">
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300">
                                                            {course.enrolledStudents.length}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{course.department || "-"}</td>
                                                <td className="px-6 py-4 relative">
                                                    <button onClick={() => setDropdownOpen(dropdownOpen === course.id ? null : course.id)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                    {dropdownOpen === course.id && (
                                                        <div className="absolute right-6 top-12 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-10 overflow-hidden">
                                                            {user?.role === "student" ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (user) { // Ensure user is not null before accessing user.id
                                                                                if (course.enrolledStudents.includes(user.id)) {
                                                                                    handleUnenroll(course.id);
                                                                                } else {
                                                                                    handleEnroll(course.id);
                                                                                }
                                                                            }
                                                                            setDropdownOpen(null);
                                                                        }}
                                                                        className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 ${course.enrolledStudents.includes(user?.id || "") // Use optional chaining for user.id
                                                                            ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                            : "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                                            }`}
                                                                    >
                                                                        {course.enrolledStudents.includes(user?.id || "") ? ( // Use optional chaining for user.id
                                                                            <>
                                                                                <X size={14} /> Unenroll
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <CheckCircle size={14} /> Enroll Now
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                    <button onClick={() => { setSelectedCourse(course); setShowDrawer(true); setDropdownOpen(null); }}
                                                                        className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                                                        <BookOpen size={14} /> View Details
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button onClick={() => { setSelectedCourse(course); setShowDrawer(true); setDropdownOpen(null); }}
                                                                        className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                                                        <Users size={14} /> View Students
                                                                    </button>
                                                                    <button onClick={() => openEditModal(course)}
                                                                        className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                                                        <Edit size={14} /> Edit Course
                                                                    </button>
                                                                    <button onClick={() => { setSelectedCourse(course); setShowDeleteModal(true); setDropdownOpen(null); }}
                                                                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700 flex items-center gap-2">
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
                                <div className="text-center py-12"><BookOpen size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" /><p className="text-slate-500 dark:text-slate-400">No courses found</p></div>
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* Add/Edit Modal */}
            {(showAddModal || showEditModal) && (
                <Modal title={showAddModal ? "Add New Course" : "Edit Course"} onClose={() => { setShowAddModal(false); setShowEditModal(false); }}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">Code *</label>
                                <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" placeholder="CS101" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">Course Name *</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" placeholder="Introduction to CS" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">Department</label>
                            <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">Lecturer</label>
                            <select value={formData.lecturerId} onChange={(e) => setFormData({ ...formData, lecturerId: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                                <option value="">Select Lecturer</option>
                                {lecturers.map((l) => (
                                    <option key={l.id} value={l.id}>{l.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl">Cancel</button>
                        <button onClick={showAddModal ? handleAddCourse : handleEditCourse} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl">
                            {showAddModal ? "Add Course" : "Save Changes"}
                        </button>
                    </div>
                </Modal>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedCourse && (
                <Modal title="Delete Course" onClose={() => setShowDeleteModal(false)}>
                    <p className="text-slate-600 dark:text-slate-300 mb-2">Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{selectedCourse.name}</strong>?</p>
                    <p className="text-sm text-slate-500">All session and attendance data will be permanently removed.</p>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl">Cancel</button>
                        <button onClick={handleDeleteCourse} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl">Delete</button>
                    </div>
                </Modal>
            )}

            {/* Enrolled Students Drawer (Replaces Modal) */}
            <Drawer
                isOpen={showDrawer}
                onClose={() => { setShowDrawer(false); setSelectedCourse(null); }}
                title={user?.role === "student" ? "Course Details" : "Enrolled Students"}
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

                        {user?.role !== "student" && (
                            <div className="space-y-3">
                                <h4 className="font-semibold text-slate-900 dark:text-white">Enrolled Students List</h4>
                                {enrolledStudentsList.length > 0 ? (
                                    enrolledStudentsList.map((student) => (
                                        <div key={student.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <img src={student.profilePicture} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{student.name}</p>
                                                    <p className="text-xs text-slate-500">{student.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-mono text-slate-400">ID: {(student as any).studentId}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                        No students enrolled yet.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default Courses;

// Components
const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => {
    const colors: Record<string, string> = { blue: "bg-blue-600", emerald: "bg-emerald-600", purple: "bg-purple-600", amber: "bg-amber-600" };
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-none">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{label}</p>
            <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
                <div className={`p-2 ${colors[color]} rounded-lg`}><BookOpen size={18} className="text-white" /></div>
            </div>
        </div>
    );
};

const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
                <button onClick={onClose} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X size={20} /></button>
            </div>
            {children}
        </div>
    </div>
);
