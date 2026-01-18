import React, { useState, useMemo } from "react";
import { ScrollArea } from "@radix-ui/themes";
import { Users, Search, Plus, MoreVertical, Edit, Trash2, Eye, X } from "lucide-react";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/dashboard/Header";
import { useData } from "../../contexts/DataContext";
import { toast } from "sonner";
import Drawer from "../../components/ui/Drawer";
import type { AnyUser } from "../../interfaces/user.interface";

type UserRole = "student" | "lecturer" | "system_admin";

const UsersPage: React.FC = () => {
    const { students, lecturers, admins, deleteUser, addStudent, addLecturer, addAdmin, updateStudent, updateLecturer, updateAdmin } = useData();

    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    // Modified: Using Drawer for view details
    const [showDrawer, setShowDrawer] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AnyUser | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "", email: "", phone: "", department: "", role: "student" as UserRole,
        studentId: "", yearGroup: 1, staffNumber: "", hourlyRate: 50, adminNumber: "",
    });

    const allUsers = useMemo(() => [
        ...students.map((s) => ({ ...s, displayRole: "Student" as const })),
        ...lecturers.map((l) => ({ ...l, displayRole: "Lecturer" as const })),
        ...admins.map((a) => ({ ...a, displayRole: "Admin" as const })),
    ], [students, lecturers, admins]);

    const filteredUsers = allUsers.filter((user) => {
        const matchesRole = roleFilter === "all" || user.role === roleFilter ||
            (roleFilter === "system_admin" && user.role === "system_admin");
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesRole && matchesSearch;
    });

    const resetForm = () => {
        setFormData({ name: "", email: "", phone: "", department: "", role: "student", studentId: "", yearGroup: 1, staffNumber: "", hourlyRate: 50, adminNumber: "" });
    };

    const handleAddUser = () => {
        if (!formData.name || !formData.email) {
            toast.error("Name and email are required");
            return;
        }
        const pic = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=3b82f6&color=fff`;

        if (formData.role === "student") {
            addStudent({
                role: "student", name: formData.name, email: formData.email, phone: formData.phone,
                department: formData.department, profilePicture: pic, studentId: formData.studentId || `STU-${Date.now()}`,
                yearGroup: formData.yearGroup, enrolledCourses: [], attendanceRate: 0,
            });
        } else if (formData.role === "lecturer") {
            addLecturer({
                role: "lecturer", name: formData.name, email: formData.email, phone: formData.phone,
                department: formData.department, profilePicture: pic, staffNumber: formData.staffNumber || `STAFF-${Date.now()}`,
                assignedCourses: [], hourlyRate: formData.hourlyRate, totalHoursWorked: 0, totalEarnings: 0,
            });
        } else {
            addAdmin({
                role: "system_admin", name: formData.name, email: formData.email, phone: formData.phone,
                department: formData.department, profilePicture: pic, adminNumber: formData.adminNumber || `ADM-${Date.now()}`,
                permissions: ["all"],
            });
        }
        toast.success(`${formData.role.replace("_", " ")} added successfully!`);
        setShowAddModal(false);
        resetForm();
    };

    const handleEditUser = () => {
        if (!selectedUser || !formData.name) return;
        const updates = { name: formData.name, email: formData.email, phone: formData.phone, department: formData.department };
        if (selectedUser.role === "student") updateStudent(selectedUser.id, updates);
        else if (selectedUser.role === "lecturer") updateLecturer(selectedUser.id, { ...updates, hourlyRate: formData.hourlyRate });
        else updateAdmin(selectedUser.id, updates);
        toast.success("User updated successfully!");
        setShowEditModal(false);
        setSelectedUser(null);
    };

    const handleDeleteUser = () => {
        if (!selectedUser) return;
        deleteUser(selectedUser.id, selectedUser.role);
        toast.success("User deleted successfully!");
        setShowDeleteModal(false);
        setSelectedUser(null);
    };

    const openEditModal = (user: AnyUser) => {
        setSelectedUser(user);
        setFormData({
            name: user.name, email: user.email, phone: user.phone || "", department: user.department || "",
            role: user.role, studentId: (user as any).studentId || "", yearGroup: (user as any).yearGroup || 1,
            staffNumber: (user as any).staffNumber || "", hourlyRate: (user as any).hourlyRate || 50,
            adminNumber: (user as any).adminNumber || "",
        });
        setShowEditModal(true);
        setDropdownOpen(null);
    };

    const getRoleBadge = (role: string) => {
        const map: Record<string, string> = { student: "bg-emerald-600", lecturer: "bg-purple-600", system_admin: "bg-blue-600" };
        return map[role] || "bg-slate-600";
    };

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
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">User Management</h1>
                                <p className="text-slate-500 dark:text-slate-400">Manage all system users</p>
                            </div>
                            <button onClick={() => { resetForm(); setShowAddModal(true); }} className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all">
                                <Plus size={20} /> Add User
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatCard label="Total Users" value={allUsers.length} color="blue" />
                            <StatCard label="Students" value={students.length} color="emerald" />
                            <StatCard label="Lecturers" value={lecturers.length} color="purple" />
                            <StatCard label="Admins" value={admins.length} color="amber" />
                        </div>

                        {/* Filters */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6 shadow-sm dark:shadow-none">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search users..." className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                                </div>
                                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
                                    className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                                    <option value="all">All Roles</option>
                                    <option value="student">Students</option>
                                    <option value="lecturer">Lecturers</option>
                                    <option value="system_admin">Admins</option>
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
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Email</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Role</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Department</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={user.profilePicture} alt={user.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                                                        <span className="text-slate-900 dark:text-white font-medium">{user.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{user.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 text-xs font-medium text-white rounded-full ${getRoleBadge(user.role)}`}>
                                                        {user.displayRole}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{user.department || "-"}</td>
                                                <td className="px-6 py-4 relative">
                                                    <button onClick={() => setDropdownOpen(dropdownOpen === user.id ? null : user.id)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                    {dropdownOpen === user.id && (
                                                        <div className="absolute right-6 top-12 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-10 overflow-hidden">
                                                            <button onClick={() => { setSelectedUser(user); setShowDrawer(true); setDropdownOpen(null); }}
                                                                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                                                <Eye size={14} /> View
                                                            </button>
                                                            <button onClick={() => openEditModal(user)}
                                                                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                                                <Edit size={14} /> Edit
                                                            </button>
                                                            <button onClick={() => { setSelectedUser(user); setShowDeleteModal(true); setDropdownOpen(null); }}
                                                                className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                                                <Trash2 size={14} /> Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredUsers.length === 0 && (
                                <div className="text-center py-12"><Users size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" /><p className="text-slate-500 dark:text-slate-400">No users found</p></div>
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <Modal title="Add New User" onClose={() => setShowAddModal(false)}>
                    <UserForm formData={formData} setFormData={setFormData} isEdit={false} />
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl">Cancel</button>
                        <button onClick={handleAddUser} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl">Add User</button>
                    </div>
                </Modal>
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <Modal title="Edit User" onClose={() => setShowEditModal(false)}>
                    <UserForm formData={formData} setFormData={setFormData} isEdit />
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl">Cancel</button>
                        <button onClick={handleEditUser} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl">Save Changes</button>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedUser && (
                <Modal title="Delete User" onClose={() => setShowDeleteModal(false)}>
                    <p className="text-slate-600 dark:text-slate-300 mb-2">Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{selectedUser.name}</strong>?</p>
                    <p className="text-sm text-slate-500">This action cannot be undone.</p>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl">Cancel</button>
                        <button onClick={handleDeleteUser} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl">Delete</button>
                    </div>
                </Modal>
            )}

            {/* View User Drawer (Replaces Modal) */}
            <Drawer
                isOpen={showDrawer}
                onClose={() => { setShowDrawer(false); setSelectedUser(null); }}
                title="User Details"
            >
                {selectedUser && (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <img src={selectedUser.profilePicture} alt={selectedUser.name} className="w-24 h-24 rounded-2xl shadow-lg mb-4 object-cover" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center">{selectedUser.name}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">{selectedUser.email}</p>
                            <span className={`px-3 py-1 text-sm font-medium text-white rounded-full ${getRoleBadge(selectedUser.role)}`}>
                                {selectedUser.role.replace("_", " ")}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Information</h4>
                            <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                                <DetailRow label="Phone" value={selectedUser.phone || "Not set"} />
                                <DetailRow label="Department" value={selectedUser.department || "Not set"} />
                                <DetailRow label="Joined" value={new Date().toLocaleDateString()} />
                            </div>

                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Role Sppecific</h4>
                            <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                                {selectedUser.role === "student" && (
                                    <>
                                        <DetailRow label="Student ID" value={(selectedUser as any).studentId} />
                                        <DetailRow label="Year Group" value={`Year ${(selectedUser as any).yearGroup}`} />
                                    </>
                                )}
                                {selectedUser.role === "lecturer" && (
                                    <>
                                        <DetailRow label="Staff Number" value={(selectedUser as any).staffNumber} />
                                        <DetailRow label="Hourly Rate" value={`GH₵${(selectedUser as any).hourlyRate}`} />
                                    </>
                                )}
                                {selectedUser.role === "system_admin" && <DetailRow label="Admin Number" value={(selectedUser as any).adminNumber} />}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                            <button onClick={() => { setShowDrawer(false); openEditModal(selectedUser); }} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
                                Edit User
                            </button>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default UsersPage;

// === COMPONENTS ===

const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => {
    const colors: Record<string, string> = { blue: "bg-blue-600", emerald: "bg-emerald-600", purple: "bg-purple-600", amber: "bg-amber-600" };
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-none">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{label}</p>
            <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
                <div className={`p-2 ${colors[color]} rounded-lg`}><Users size={18} className="text-white" /></div>
            </div>
        </div>
    );
};

const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
                <button onClick={onClose} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X size={20} /></button>
            </div>
            {children}
        </div>
    </div>
);

const UserForm = ({ formData, setFormData, isEdit }: { formData: any; setFormData: (d: any) => void; isEdit: boolean }) => (
    <div className="space-y-4">
        {!isEdit && (
            <div>
                <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="system_admin">System Admin</option>
                </select>
            </div>
        )}
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">Full Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" placeholder="John Doe" />
            </div>
            <div>
                <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">Email *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" placeholder="john@example.com" />
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">Phone</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" placeholder="+233..." />
            </div>
            <div>
                <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">Department</label>
                <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" placeholder="Computer Science" />
            </div>
        </div>
        {formData.role === "student" && !isEdit && (
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">Student ID</label>
                    <input type="text" value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" placeholder="Auto-generated" />
                </div>
                <div>
                    <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">Year Group</label>
                    <select value={formData.yearGroup} onChange={(e) => setFormData({ ...formData, yearGroup: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                        {[1, 2, 3, 4].map((y) => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                </div>
            </div>
        )}
        {formData.role === "lecturer" && (
            <div className="grid grid-cols-2 gap-4">
                {!isEdit && <div>
                    <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">Staff Number</label>
                    <input type="text" value={formData.staffNumber} onChange={(e) => setFormData({ ...formData, staffNumber: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" placeholder="Auto-generated" />
                </div>}
                <div>
                    <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">Hourly Rate (GH₵)</label>
                    <input type="number" value={formData.hourlyRate} onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" />
                </div>
            </div>
        )}
    </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
        <span className="text-slate-500 dark:text-slate-400">{label}</span>
        <span className="text-slate-900 dark:text-white font-medium">{value}</span>
    </div>
);
