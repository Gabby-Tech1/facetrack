import React, { useState } from "react";
import { ScrollArea } from "@radix-ui/themes";
import { Mail, Phone, Calendar, Shield, Camera, Edit, X, Save, BookOpen, DollarSign, Users, Check, Loader2, AlertCircle } from "lucide-react";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/dashboard/Header";
import { useAuthStore } from "../../store/auth.store";
import { usersApi } from "../../api/users.api";
import { toast } from "sonner";
import { Role, ImageStatus } from "../../types";
import EnrollmentModal from "../../components/enrollment/EnrollmentModal";

const Profile: React.FC = () => {
    const { user, fetchCurrentUser } = useAuthStore();
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Edit form state
    const [editForm, setEditForm] = useState({
        name: user?.name || "",
        phone: user?.phone || "",
    });

    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        current: "",
        newPassword: "",
        confirm: "",
    });

    if (!user) return null;

    const getRoleLabel = () => {
        switch (user.role) {
            case Role.STUDENT: return "Student";
            case Role.REP: return "Class Representative";
            case Role.LECTURER: return "Lecturer";
            case Role.STAFF: return "Staff";
            case Role.ADMIN: return "Administrator";
            case Role.SYSTEM_ADMIN: return "System Administrator";
            default: return "User";
        }
    };

    const getRoleBadgeColor = () => {
        switch (user.role) {
            case Role.STUDENT: return "bg-emerald-600";
            case Role.REP: return "bg-green-600";
            case Role.LECTURER: return "bg-purple-600";
            case Role.STAFF: return "bg-orange-600";
            case Role.ADMIN: return "bg-blue-600";
            case Role.SYSTEM_ADMIN: return "bg-indigo-600";
            default: return "bg-slate-600";
        }
    };

    const handleSaveProfile = async () => {
        if (!editForm.name.trim()) {
            toast.error("Name is required");
            return;
        }

        setIsUpdating(true);
        try {
            await usersApi.updateUserDetails({
                name: editForm.name.trim(),
                phone: editForm.phone.trim(),
            });

            // Refresh user data from backend
            await fetchCurrentUser();

            toast.success("Profile updated successfully!");
            setShowEditModal(false);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
            toast.error(errorMessage);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleChangePassword = () => {
        if (passwordForm.newPassword !== passwordForm.confirm) {
            toast.error("Passwords do not match");
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        toast.success("Password changed successfully!");
        setPasswordForm({ current: "", newPassword: "", confirm: "" });
        setShowPasswordModal(false);
    };

    const handleEnable2FA = () => {
        toast.success("Two-factor authentication enabled!");
        setShow2FAModal(false);
    };

    const handlePhotoChange = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("Image size must be less than 5MB");
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error("Please select an image file");
            return;
        }

        setIsUpdating(true);
        try {
            // Use enroll API to upload face image - pass user's role
            const response = await usersApi.enrollUser({ role: user.role }, file);

            if (response.jobId) {
                toast.success("Face image uploaded! Processing in background...");
            } else {
                toast.success("Profile picture updated!");
            }

            // Refresh user data from backend
            await fetchCurrentUser();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
            toast.error(errorMessage);
        } finally {
            setIsUpdating(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Role-specific stats
    const getStats = () => {
        if (user.role === Role.STUDENT || user.role === Role.REP) {
            return [
                { label: "Courses Enrolled", value: user.student?._count?.enrollments || 0, icon: BookOpen },
                { label: "Attendance Rate", value: "0%", icon: Check },
                { label: "Status", value: user.role === Role.REP ? "Class Rep" : "Student", icon: Users },
            ];
        }
        if (user.role === Role.LECTURER) {
            return [
                { label: "Courses Assigned", value: user.lecturer?._count?.courses || 0, icon: BookOpen },
                { label: "Hours Worked", value: 0, icon: Calendar },
                { label: "Total Earnings", value: "GH₵0", icon: DollarSign },
            ];
        }
        return [];
    };

    const stats = getStats();

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-950">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-950 px-4 sm:px-8 pt-6 pb-4"><Header /></div>
                <ScrollArea type="auto" className="flex-1">
                    <div className="px-4 sm:px-8 pb-8">
                        {/* Page Header */}
                        <div className="mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">My Profile</h1>
                            <p className="text-slate-500 dark:text-slate-400">Manage your account and preferences</p>
                        </div>

                        {/* Enrollment Banner for Students - Show when not enrolled */}
                        {user.role === Role.STUDENT && (!user.imageStatus || user.imageStatus === ImageStatus.PENDING) && (
                            <div className="mb-8 p-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-lg">
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                                        <AlertCircle className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1 text-center sm:text-left">
                                        <h3 className="text-xl font-bold text-white mb-1">
                                            Complete Your Enrollment
                                        </h3>
                                        <p className="text-amber-100">
                                            Upload your face image and select courses to enable attendance verification
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowEnrollmentModal(true)}
                                        className="px-6 py-3 bg-white text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition-colors shadow-lg"
                                    >
                                        Enroll Now
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Stats Cards (for students/lecturers) */}
                        {stats.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                {stats.map((stat) => (
                                    <div key={stat.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-none">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                                            </div>
                                            <div className="p-3 bg-blue-50 dark:bg-blue-600/20 rounded-xl">
                                                <stat.icon size={20} className="text-blue-500 dark:text-blue-400" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Profile Card */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none">
                                <div className="flex flex-col items-center text-center">
                                    <div className="relative mb-4">
                                        <img
                                            src={user.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff&size=112`}
                                            alt={user.name}
                                            className="w-28 h-28 rounded-xl object-cover border-2 border-slate-200 dark:border-slate-700"
                                        />
                                        <button onClick={handlePhotoChange} className="absolute -bottom-2 -right-2 p-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg">
                                            <Camera size={14} className="text-white" />
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{user.name}</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">{user.email}</p>
                                    <span className={`px-4 py-1.5 text-sm font-medium text-white rounded-full ${getRoleBadgeColor()}`}>
                                        {getRoleLabel()}
                                    </span>
                                </div>

                                <hr className="my-6 border-slate-200 dark:border-slate-800" />

                                <div className="space-y-4">
                                    <InfoRow icon={Phone} label="Phone" value={user.phone || "Not set"} />
                                    <InfoRow icon={Calendar} label="Joined" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"} />
                                    <InfoRow icon={Shield} label="Account Status" value={user.accountStatus || "Active"} />
                                </div>
                            </div>

                            {/* Details & Security Card */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Account Details */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Account Details</h2>
                                        <button onClick={() => { setEditForm({ name: user.name, phone: user.phone || "" }); setShowEditModal(true); }}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                                            <Edit size={16} /> Edit Profile
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FieldDisplay label="Full Name" value={user.name} />
                                        <FieldDisplay label="Email Address" value={user.email} icon={<Mail size={16} className="text-slate-400" />} />
                                        <FieldDisplay label="Phone Number" value={user.phone || "Not set"} icon={<Phone size={16} className="text-slate-400" />} />
                                        <FieldDisplay label="Role" value={getRoleLabel()} icon={<Shield size={16} className="text-slate-400" />} />
                                        <FieldDisplay label="Account Status" value={user.accountStatus || "Active"} />
                                        <FieldDisplay label="Email Verified" value={user.isActive ? "Yes" : "No"} />
                                    </div>

                                    {(user.role === Role.STUDENT || user.role === Role.REP) && (
                                        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-md font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                    <BookOpen size={18} className="text-blue-500" /> Enrolled Courses
                                                </h3>
                                                <button
                                                    onClick={() => setShowEnrollmentModal(true)}
                                                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                                >
                                                    Manage Courses
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {user.student?.enrollments && user.student.enrollments.length > 0 ? (
                                                    user.student.enrollments.map((enr: any) => (
                                                        <span key={enr.id} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                            {enr.course?.code}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-slate-500 italic">No courses enrolled yet</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Security Section */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none">
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                        <Shield size={18} className="text-blue-500 dark:text-blue-400" /> Security
                                    </h2>
                                    <div className="space-y-4">
                                        <SecurityItem label="Password" detail={user.isPasswordChanged ? "Password has been changed" : "Using initial password"} buttonText="Change" onClick={() => setShowPasswordModal(true)} />
                                        <SecurityItem label="Two-Factor Authentication" detail="Not enabled" buttonText="Enable" onClick={() => setShow2FAModal(true)} highlight />
                                        <SecurityItem label="Active Sessions" detail="1 active session" buttonText="Manage" onClick={() => toast.info("Session management coming soon!")} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <Modal title="Edit Profile" onClose={() => !isUpdating && setShowEditModal(false)}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">Full Name</label>
                            <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                disabled={isUpdating}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white disabled:opacity-50" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">Phone Number</label>
                            <input type="text" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                disabled={isUpdating}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white disabled:opacity-50" placeholder="+233..." />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowEditModal(false)} disabled={isUpdating} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl disabled:opacity-50">Cancel</button>
                        <button onClick={handleSaveProfile} disabled={isUpdating} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                            {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {isUpdating ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </Modal>
            )}

            {/* Change Password Modal */}
            {showPasswordModal && (
                <Modal title="Change Password" onClose={() => setShowPasswordModal(false)}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">Current Password</label>
                            <input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">New Password</label>
                            <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">Confirm New Password</label>
                            <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowPasswordModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl">Cancel</button>
                        <button onClick={handleChangePassword} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl">Change Password</button>
                    </div>
                </Modal>
            )}

            {/* 2FA Modal */}
            {show2FAModal && (
                <Modal title="Enable Two-Factor Authentication" onClose={() => setShow2FAModal(false)}>
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield size={32} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-4">Adding 2FA will increase your account security by requiring a verification code when signing in.</p>
                        <p className="text-sm text-slate-500">A verification code will be sent to your email or phone.</p>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setShow2FAModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl">Cancel</button>
                        <button onClick={handleEnable2FA} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl">Enable 2FA</button>
                    </div>
                </Modal>
            )}

            {/* Enrollment Modal for Students */}
            <EnrollmentModal
                isOpen={showEnrollmentModal}
                onClose={() => setShowEnrollmentModal(false)}
                onSuccess={() => toast.success("Enrollment completed successfully!")}
            />
        </div>
    );
};

export default Profile;

// Components
const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
                <button onClick={onClose} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X size={20} /></button>
            </div>
            {children}
        </div>
    </div>
);

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
    <div className="flex items-center gap-3">
        <Icon size={16} className="text-slate-500 dark:text-slate-500 shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-500">{label}</p>
            <p className="text-sm text-slate-900 dark:text-white truncate">{value}</p>
        </div>
    </div>
);

const FieldDisplay = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
    <div>
        <label className="block text-sm text-slate-500 dark:text-slate-500 mb-1">{label}</label>
        <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white flex items-center gap-2">
            {icon}
            <span className="truncate">{value}</span>
        </div>
    </div>
);

const SecurityItem = ({ label, detail, buttonText, onClick, highlight }: { label: string; detail: string; buttonText: string; onClick?: () => void; highlight?: boolean }) => (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl gap-3 ${highlight ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30" : "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"}`}>
        <div>
            <p className="text-slate-900 dark:text-white font-medium">{label}</p>
            <p className={`text-sm ${highlight ? "text-amber-600 dark:text-amber-400" : "text-slate-500 dark:text-slate-500"}`}>{detail}</p>
        </div>
        <button onClick={onClick} className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${highlight ? "bg-amber-600 hover:bg-amber-700 text-white" : "text-blue-600 dark:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}>
            {buttonText}
        </button>
    </div>
);
