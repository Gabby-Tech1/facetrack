import React, { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@radix-ui/themes";
import {
  Users as UsersIcon,
  Search,
  Plus,
  Trash2,
  X,
  Loader2,
  Mail,
  Phone,
  Shield,
  Camera,
  Upload,
  ChevronDown,
  Check,
  AlertCircle,
  RefreshCw,
  UserPlus,
  GraduationCap,
  Briefcase,
  BookOpen,
} from "lucide-react";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/dashboard/Header";
import { usersApi } from "../../api/users.api";
import { coursesApi } from "../../api/courses.api";
import { toast } from "sonner";
import { Role, ImageStatus } from "../../types";
import type { User, Course } from "../../types";
import { useFaceDetection } from "../../contexts/FaceDetectionContext";
import { FaceDetectionOverlay, FaceValidationStatus } from "../../components/face-detection";
import type { FaceValidationResult } from "../../services/faceDetection.service";

const Users: React.FC = () => {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch users and courses on mount
  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [usersRes, coursesRes] = await Promise.all([
          usersApi.getAllUsers(),
          coursesApi.getAllCourses(),
        ]);

        if (!isCancelled) {
          setUsers(usersRes.users || []);
          setCourses(coursesRes.data || []);
        }
      } catch (error) {
        if (!isCancelled) {
          // Don't show error for rate limiting - user can retry manually
          if (error instanceof Error && error.message.includes("429")) {
            console.warn("Rate limited, please wait and try again");
          } else {
            console.error("Failed to fetch data:", error);
            toast.error("Failed to load data. Please try again.");
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

  // Filter users when search or role filter changes
  useEffect(() => {
    let filtered = users;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.phone?.toLowerCase().includes(query)
      );
    }

    if (roleFilter !== "ALL") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, roleFilter]);

  const refreshData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, coursesRes] = await Promise.all([
        usersApi.getAllUsers(),
        coursesApi.getAllCourses(),
      ]);
      setUsers(usersRes.users || []);
      setCourses(coursesRes.data || []);
    } catch (error) {
      console.error("Failed to refresh data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      await usersApi.removeUser(selectedUser.email);
      toast.success(`User ${selectedUser.name} deleted successfully`);
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case Role.STUDENT:
        return "bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400";
      case Role.REP:
        return "bg-green-100 dark:bg-green-600/20 text-green-700 dark:text-green-400";
      case Role.LECTURER:
        return "bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-400";
      case Role.STAFF:
        return "bg-orange-100 dark:bg-orange-600/20 text-orange-700 dark:text-orange-400";
      case Role.ADMIN:
        return "bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400";
      case Role.SYSTEM_ADMIN:
        return "bg-indigo-100 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-400";
      default:
        return "bg-slate-100 dark:bg-slate-600/20 text-slate-700 dark:text-slate-400";
    }
  };

  const getImageStatusBadge = (status?: ImageStatus | null) => {
    switch (status) {
      case ImageStatus.COMPLETED:
        return <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400">Verified</span>;
      case ImageStatus.UPLOADED:
        return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400">Uploaded</span>;
      case ImageStatus.PROCESSING:
        return <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 dark:bg-amber-600/20 text-amber-700 dark:text-amber-400">Processing</span>;
      case ImageStatus.FAILED:
        return <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-400">Failed</span>;
      default:
        return <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-600/20 text-slate-700 dark:text-slate-400">Pending</span>;
    }
  };

  // Stats
  const stats = {
    total: users.length,
    students: users.filter((u) => u.role === Role.STUDENT || u.role === Role.REP).length,
    lecturers: users.filter((u) => u.role === Role.LECTURER).length,
    staff: users.filter((u) => u.role === Role.STAFF).length,
    admins: users.filter((u) => u.role === Role.ADMIN || u.role === Role.SYSTEM_ADMIN).length,
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
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  User Management
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                  Manage all users in the system
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
              >
                <Plus className="w-5 h-5" />
                Add User
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <StatCard icon={UsersIcon} label="Total Users" value={stats.total} color="blue" />
              <StatCard icon={GraduationCap} label="Students" value={stats.students} color="emerald" />
              <StatCard icon={BookOpen} label="Lecturers" value={stats.lecturers} color="purple" />
              <StatCard icon={Briefcase} label="Staff" value={stats.staff} color="orange" />
              <StatCard icon={Shield} label="Admins" value={stats.admins} color="indigo" />
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Role Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as Role | "ALL")}
                  className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Roles</option>
                  <option value={Role.STUDENT}>Students</option>
                  <option value={Role.REP}>Class Reps</option>
                  <option value={Role.LECTURER}>Lecturers</option>
                  <option value={Role.STAFF}>Staff</option>
                  <option value={Role.ADMIN}>Admins</option>
                  <option value={Role.SYSTEM_ADMIN}>System Admins</option>
                </select>

                {/* Refresh */}
                <button
                  onClick={refreshData}
                  disabled={isLoading}
                  className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <UsersIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">User</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Contact</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Role</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Face Status</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Joined</th>
                        <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={user.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff&size=40`}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                              />
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {user.student?.studentId || user.lecturer?.staffNo || user.staff?.staffNo || "—"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="text-sm text-slate-900 dark:text-white flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                {user.email}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                {user.phone || "—"}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {getImageStatusBadge(user.imageStatus)}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDeleteModal(true);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-600/10 rounded-lg transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          courses={courses}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            refreshData();
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete User?</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Are you sure you want to delete <strong>{selectedUser.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  {isSubmitting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

// Stat Card Component
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: "blue" | "emerald" | "purple" | "orange" | "indigo";
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    blue: "bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400",
    emerald: "bg-emerald-100 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400",
    purple: "bg-purple-100 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-100 dark:bg-orange-600/20 text-orange-600 dark:text-orange-400",
    indigo: "bg-indigo-100 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400",
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      </div>
    </div>
  );
};

// Create User Modal Component
interface CreateUserModalProps {
  courses: Course[];
  onClose: () => void;
  onSuccess: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ courses, onClose, onSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Form state
  const [userRole, setUserRole] = useState<Role>(Role.LECTURER);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    lecturerId: "",
    staffId: "",
    lecturerHourlyRate: "",
    lecturerCreditHours: "",
  });
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Face detection state
  const { modelsLoaded, modelsLoading, loadModels } = useFaceDetection();
  const [faceValidation, setFaceValidation] = useState<FaceValidationResult | null>(null);
  const [autoCaptureProgress, setAutoCaptureProgress] = useState(0);
  const autoCaptureStartTime = useRef<number | null>(null);
  const AUTO_CAPTURE_DELAY = 1500; // 1.5 seconds of valid face to auto-capture

  // Load models on mount just in case
  useEffect(() => {
    if (!modelsLoaded && !modelsLoading) {
      loadModels();
    }
  }, [modelsLoaded, modelsLoading, loadModels]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Poll job status with proper cleanup and rate limit handling
  useEffect(() => {
    if (!jobId || !isPolling) return;

    let isCancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let consecutiveErrors = 0;
    const MAX_ERRORS = 5;

    const pollStatus = async () => {
      if (isCancelled) return;

      try {
        const response = await usersApi.getJobStatus(jobId);
        consecutiveErrors = 0; // Reset on success

        // Check the 'state' field from BullMQ job status
        if (response.state === "completed") {
          setIsPolling(false);
          toast.success("User created and face image processed!");
          onSuccess();
          return;
        } else if (response.state === "failed") {
          setIsPolling(false);
          toast.error("Face image processing failed");
          return;
        }

        // Continue polling with longer interval (5 seconds)
        if (!isCancelled) {
          timeoutId = setTimeout(pollStatus, 5000);
        }
      } catch (error) {
        consecutiveErrors++;
        console.error("Failed to get job status:", error);

        // Stop polling after too many consecutive errors
        if (consecutiveErrors >= MAX_ERRORS) {
          setIsPolling(false);
          toast.error("Failed to track image processing. Please check the user list.");
          return;
        }

        // Exponential backoff on errors (10s, 15s, 20s, etc.)
        if (!isCancelled) {
          const delay = 5000 + (consecutiveErrors * 5000);
          timeoutId = setTimeout(pollStatus, delay);
        }
      }
    };

    // Start polling after initial delay
    timeoutId = setTimeout(pollStatus, 3000);

    return () => {
      isCancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [jobId, isPolling, onSuccess]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, PNG)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setFaceImage(file);
      setImagePreview(URL.createObjectURL(file));
      setShowCamera(false);
    }
  };

  // Sync stream to video ref when camera is shown
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, showCamera]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowCamera(true);
    } catch (error) {
      console.error("Camera access denied:", error);
      toast.error("Unable to access camera");
    }
  };

  const capturePhoto = React.useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Ensure canvas dimensions match video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    context.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], "face-capture.jpg", { type: "image/jpeg" });
          setFaceImage(file);
          setImagePreview(canvas.toDataURL("image/jpeg"));
          stopCamera();
        }
      },
      "image/jpeg",
      0.9
    );
  }, [stopCamera]);

  // Handle face validation updates
  const handleFaceValidation = React.useCallback((result: FaceValidationResult) => {
    setFaceValidation(result);

    // Update auto-capture progress
    if (result.isValid) {
      if (autoCaptureStartTime.current === null) {
        autoCaptureStartTime.current = Date.now();
      }
      const elapsed = Date.now() - autoCaptureStartTime.current;
      const progress = Math.min(100, (elapsed / AUTO_CAPTURE_DELAY) * 100);
      setAutoCaptureProgress(progress);
    } else {
      autoCaptureStartTime.current = null;
      setAutoCaptureProgress(0);
    }
  }, []);

  // Handle auto-capture
  const handleAutoCapture = React.useCallback(() => {
    if (showCamera && !faceImage && faceValidation?.isValid) {
      capturePhoto();
      toast.success("Photo captured automatically!");
    }
  }, [showCamera, faceImage, faceValidation?.isValid, capturePhoto]);

  const stopCamera = React.useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setFaceValidation(null);
    setAutoCaptureProgress(0);
    autoCaptureStartTime.current = null;
  }, [stream]);

  const clearImage = () => {
    setFaceImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleCourse = (courseCode: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseCode)
        ? prev.filter((c) => c !== courseCode)
        : [...prev, courseCode]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    if (!faceImage) {
      toast.error("Face image is required");
      return;
    }

    if (userRole === Role.LECTURER) {
      if (!formData.lecturerId.trim()) {
        toast.error("Staff number is required for lecturer");
        return;
      }
      if (!formData.lecturerHourlyRate) {
        toast.error("Hourly rate is required for lecturer");
        return;
      }
      if (!formData.lecturerCreditHours) {
        toast.error("Credit hours is required for lecturer");
        return;
      }
      if (selectedCourses.length === 0) {
        toast.error("At least one course must be assigned to the lecturer");
        return;
      }
    }

    if (userRole === Role.STAFF && !formData.staffId.trim()) {
      toast.error("Staff ID is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const enrollData = {
        role: userRole,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        ...(userRole === Role.LECTURER && {
          lecturerId: formData.lecturerId.trim(),
          lecturerHourlyRate: parseFloat(formData.lecturerHourlyRate),
          lecturerCreditHours: parseInt(formData.lecturerCreditHours, 10),
          courses: selectedCourses,
        }),
        ...(userRole === Role.STAFF && {
          staffId: formData.staffId.trim(),
        }),
      };

      // Debug: Log the enrollment data
      console.log("Enrollment data:", enrollData);
      console.log("Face image:", faceImage?.name, faceImage?.type, faceImage?.size);

      const response = await usersApi.enrollUser(enrollData, faceImage!);

      toast.success(response.message || "User created successfully!");

      if (response.jobId) {
        setJobId(response.jobId);
        setIsPolling(true);
        toast.info("Processing face image in background...");
      } else {
        onSuccess();
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create user";
      // Provide more helpful error messages for common issues
      if (errorMessage.includes("500") || errorMessage.includes("Internal Server Error")) {
        toast.error("Server error during enrollment. Please ensure all fields are correct and try again.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New User</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Add a lecturer or staff member</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting || isPolling}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              User Role <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserRole(Role.LECTURER)}
                className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${userRole === Role.LECTURER
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-600/10"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
              >
                <BookOpen className={`w-5 h-5 ${userRole === Role.LECTURER ? "text-blue-600" : "text-slate-400"}`} />
                <span className={`font-medium ${userRole === Role.LECTURER ? "text-blue-600" : "text-slate-700 dark:text-slate-300"}`}>
                  Lecturer
                </span>
              </button>
              <button
                type="button"
                onClick={() => setUserRole(Role.STAFF)}
                className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${userRole === Role.STAFF
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-600/10"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
              >
                <Briefcase className={`w-5 h-5 ${userRole === Role.STAFF ? "text-blue-600" : "text-slate-400"}`} />
                <span className={`font-medium ${userRole === Role.STAFF ? "text-blue-600" : "text-slate-700 dark:text-slate-300"}`}>
                  Staff
                </span>
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting || isPolling}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting || isPolling}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+233..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting || isPolling}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {userRole === Role.LECTURER ? "Staff Number" : "Staff ID"} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={userRole === Role.LECTURER ? formData.lecturerId : formData.staffId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [userRole === Role.LECTURER ? "lecturerId" : "staffId"]: e.target.value,
                  })
                }
                placeholder={userRole === Role.LECTURER ? "LEC001" : "STF001"}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting || isPolling}
              />
            </div>
          </div>

          {/* Lecturer-specific fields */}
          {userRole === Role.LECTURER && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Hourly Rate (GH₵) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.lecturerHourlyRate}
                    onChange={(e) => setFormData({ ...formData, lecturerHourlyRate: e.target.value })}
                    placeholder="50"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting || isPolling}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Credit Hours <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.lecturerCreditHours}
                    onChange={(e) => setFormData({ ...formData, lecturerCreditHours: e.target.value })}
                    placeholder="3"
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting || isPolling}
                  />
                </div>
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Assign Courses <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCourseDropdown(!showCourseDropdown)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting || isPolling}
                  >
                    <span className={selectedCourses.length > 0 ? "text-slate-900 dark:text-white" : "text-slate-400"}>
                      {selectedCourses.length > 0
                        ? `${selectedCourses.length} course(s) selected`
                        : "Select courses to assign"}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showCourseDropdown ? "rotate-180" : ""}`} />
                  </button>

                  {showCourseDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg max-h-48 overflow-y-auto">
                      {courses.length === 0 ? (
                        <div className="px-4 py-3 text-slate-500 text-center">No courses available</div>
                      ) : (
                        courses.map((course) => (
                          <button
                            key={course.id}
                            type="button"
                            onClick={() => toggleCourse(course.code)}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                          >
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedCourses.includes(course.code)
                                ? "bg-blue-600 border-blue-600"
                                : "border-slate-300 dark:border-slate-600"
                                }`}
                            >
                              {selectedCourses.includes(course.code) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-slate-900 dark:text-white font-medium">{course.code}</p>
                              <p className="text-slate-500 dark:text-slate-400 text-sm">{course.title}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {selectedCourses.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedCourses.map((code) => (
                      <span
                        key={code}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                      >
                        {code}
                        <button
                          type="button"
                          onClick={() => toggleCourse(code)}
                          className="hover:text-blue-900 dark:hover:text-blue-100"
                          disabled={isSubmitting || isPolling}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Face Image */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <Camera className="w-4 h-4 inline mr-1" />
              Face Image <span className="text-red-500">*</span>
            </label>

            {!imagePreview && !showCamera ? (
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Camera className="w-7 h-7 text-slate-400" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      disabled={isSubmitting || isPolling}
                    >
                      <Camera className="w-4 h-4" />
                      Take Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
                      disabled={isSubmitting || isPolling}
                    >
                      <Upload className="w-4 h-4" />
                      Upload Image
                    </button>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : showCamera ? (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3]">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Face Detection Overlay */}
                  {modelsLoaded && (
                    <FaceDetectionOverlay
                      videoRef={videoRef}
                      onFaceValidation={handleFaceValidation}
                      onAutoCapture={handleAutoCapture}
                      autoCaptureDelay={AUTO_CAPTURE_DELAY}
                      enabled={true}
                      showOverlay={true}
                    />
                  )}

                  {!modelsLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-60 border-2 border-dashed border-white/50 rounded-[50%]" />
                    </div>
                  )}

                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      disabled={!faceValidation?.isValid && modelsLoaded}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg text-sm transition-colors ${!faceValidation?.isValid && modelsLoaded
                        ? "bg-slate-500 cursor-not-allowed text-slate-300"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                    >
                      <Camera className="w-4 h-4" />
                      Capture
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg text-sm"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Face Validation Status */}
                <FaceValidationStatus
                  result={faceValidation}
                  modelsLoading={modelsLoading}
                  modelsLoaded={modelsLoaded}
                  autoCapturing={faceValidation?.isValid && autoCaptureProgress > 0}
                  autoCaptureProgress={autoCaptureProgress}
                  className="justify-center"
                />
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview!}
                  alt="Face preview"
                  className="w-full max-h-48 object-contain rounded-xl bg-slate-100 dark:bg-slate-800"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                  disabled={isSubmitting || isPolling}
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-3 right-3 flex justify-center">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur text-slate-700 dark:text-slate-300 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors shadow text-sm"
                    disabled={isSubmitting || isPolling}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retake
                  </button>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Face must be clearly visible. Supported formats: JPEG, PNG. Max size: 5MB.
            </p>
          </div>

          {/* Processing Status */}
          {isPolling && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <p className="text-blue-700 dark:text-blue-300 font-medium">
                  Processing face image in background...
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isPolling}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isPolling || !faceImage}
              className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : isPolling ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Create User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
