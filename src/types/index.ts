// ============================================
// CONSTANTS - Matching Backend Prisma Schema
// ============================================

export const Role = {
  ADMIN: "ADMIN",
  SYSTEM_ADMIN: "SYSTEM_ADMIN",
  LECTURER: "LECTURER",
  STAFF: "STAFF",
  STUDENT: "STUDENT",
  REP: "REP",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const AccountStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;
export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];

export const ImageStatus = {
  PENDING: "PENDING",
  UPLOADED: "UPLOADED",
  FAILED: "FAILED",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
} as const;
export type ImageStatus = (typeof ImageStatus)[keyof typeof ImageStatus];

export const SessionMode = {
  CHECK_IN: "CHECK_IN",
  CHECK_OUT: "CHECK_OUT",
} as const;
export type SessionMode = (typeof SessionMode)[keyof typeof SessionMode];

export const SessionStatus = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  SCHEDULED: "SCHEDULED",
} as const;
export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus];

export const SessionType = {
  CLASS: "CLASS",
  EXAM: "EXAM",
  LAB: "LAB",
  TUTORIAL: "TUTORIAL",
  EVENT: "EVENT",
  WORKSHIFT: "WORKSHIFT",
} as const;
export type SessionType = (typeof SessionType)[keyof typeof SessionType];

export const AttendanceStatus = {
  PRESENT: "PRESENT",
  LATE: "LATE",
  EXCUSED: "EXCUSED",
  ABSENT: "ABSENT",
  CHECKED_IN: "CHECKED_IN",
} as const;
export type AttendanceStatus = (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

export const Priority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;
export type Priority = (typeof Priority)[keyof typeof Priority];

export const NotificationStatus = {
  READ: "READ",
  UNREAD: "UNREAD",
} as const;
export type NotificationStatus = (typeof NotificationStatus)[keyof typeof NotificationStatus];

// ============================================
// USER TYPES - Matching Backend Schema
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: Role;
  isActive: boolean;
  isPasswordChanged: boolean;
  accountStatus: AccountStatus;
  imageUrl?: string | null;
  imageStatus?: ImageStatus | null;
  embeddingStatus: ImageStatus;
  faceEmbedding?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  // Nested relations
  student?: Student | null;
  lecturer?: Lecturer | null;
  staff?: Staff | null;
  admin?: Admin | null;
}

export interface Student {
  id: string;
  userId: string;
  matricNo?: string | null;
  studentId: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  enrollments?: CourseEnrollment[];
  courseReps?: CourseRep[];
  _count?: {
    enrollments: number;
  };
}

export interface Lecturer {
  id: string;
  userId: string;
  staffNo?: string | null;
  recipientCode?: string | null;
  hourlyRate: number;
  creditHours: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  courses?: CourseLecturer[];
  thresholds?: Thresholds | null;
  _count?: {
    courses: number;
  };
}

export interface Staff {
  id: string;
  userId: string;
  staffNo: string;
  recipientCode?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Admin {
  id: string;
  userId: string;
  adminNo: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// ============================================
// COURSE TYPES
// ============================================

export interface Course {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  creditHours?: number | null;
  createdAt: string;
  updatedAt: string;
  enrollments?: CourseEnrollment[];
  lecturers?: CourseLecturer[];
  reps?: CourseRep[];
  sessions?: Session[];
}

export interface CourseEnrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  student?: Student;
  course?: Course;
}

export interface CourseLecturer {
  id: string;
  lecturerId: string;
  courseId: string;
  assignedAt: string;
  lecturer?: Lecturer;
  course?: Course;
}

export interface CourseRep {
  id: string;
  studentId: string;
  courseId: string;
  student?: Student;
  course?: Course;
  thresholds?: Thresholds | null;
}

// ============================================
// SESSION TYPES
// ============================================

export interface Session {
  id: string;
  userId: string;
  name: string;
  token: string;
  location?: string | null;
  lecturerId?: string | null;
  courseId?: string | null;
  startTime: string;
  endTime: string;
  mode: SessionMode;
  type: SessionType;
  status: SessionStatus;
  lateThreshold: number;
  absentThreshold: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
  course?: Course | null;
  lecturer?: Lecturer | null;
  attendances?: Attendance[];
}

// ============================================
// ATTENDANCE TYPES
// ============================================

export interface Attendance {
  id: string;
  sessionId: string;
  userId: string;
  timestamp: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  confidence?: number | null;
  source?: string | null;
  status: AttendanceStatus;
  session?: Session;
  user?: User;
}

// ============================================
// THRESHOLD TYPES
// ============================================

export interface Thresholds {
  id: string;
  lateThreshold: number;
  absentThreshold: number;
  lecturerId?: string | null;
  courseRepId?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// LOG TYPES
// ============================================

export interface Log {
  id: string;
  userId?: string | null;
  action: string;
  priority: Priority;
  status: NotificationStatus;
  ipAddress?: string | null;
  createdAt: string;
  user?: User | null;
}

export interface SystemLog {
  id: string;
  action: string;
  status: NotificationStatus;
  ipAddress?: string | null;
  priority: Priority;
  createdAt: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  message?: string;
  data?: T;
  error?: string;
}

export interface LoginResponse {
  token: string;
  role: Role;
}

export interface RegisterResponse {
  message: string;
  user: Partial<User>;
}

export interface UserResponse {
  user: User;
}

export interface UsersResponse {
  users: User[];
}

export interface StudentsResponse {
  students: Student[];
}

export interface CoursesResponse {
  courses: Course[];
}

export interface SessionsResponse {
  sessions: Session[];
}

export interface AttendancesResponse {
  attendances: Attendance[];
}

export interface JobStatusResponse {
  state: "completed" | "failed" | "active" | "waiting" | "delayed" | "paused" | "stuck" | "unknown";
  status: unknown; // The job's return value
}

// ============================================
// DTO TYPES (Request Payloads)
// ============================================

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
}

export interface EnrollUserDto {
  role: Role;
  fullName?: string;
  email?: string;
  phone?: string;
  studentId?: string;
  staffId?: string;
  lecturerId?: string;
  lecturerHourlyRate?: number;
  lecturerCreditHours?: number;
  courses?: string[];
}

export interface CreateSessionDto {
  name: string;
  type: SessionType;
  mode?: SessionMode;
  courseId?: string;
  lecturerId?: string;
  location?: string;
  startTime: string;
  endTime: string;
}

export interface UpdateSessionDto {
  name?: string;
  type?: SessionType;
  mode?: SessionMode;
  location?: string;
  startTime?: string;
  endTime?: string;
}

export interface CreateCourseDto {
  title: string;
  courseCode: string;
  description?: string;
  lecturerId?: string;
}

export interface UpdateCourseDto {
  title?: string;
  description?: string;
  courseCode?: string;
  lecturerId?: string;
}

export interface ResetPasswordDto {
  oldPassword: string;
  newPassword: string;
}

export interface UpdateThresholdsDto {
  lateThreshold: number;
  absentThreshold: number;
}

export interface CreateAdminDto {
  email: string;
  name: string;
  phone: string;
}
