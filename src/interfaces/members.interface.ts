// Legacy member interface - kept for backwards compatibility with old components
// New user data uses src/interfaces/user.interface.ts and src/data/users.ts

export interface UserInterface {
  id: string;
  name: string;
  email: string;
  role: "admin" | "rep" | "staff" | "student";
  profilePicture?: string;
}

// Legacy attendance record format
export interface LegacyAttendanceRecord {
  id: string;
  memberId: string;
  sessionId: string;
  status: string;
  date: Date;
  timeOfArrival: Date;
  timeOfDeparture?: Date;
  session: LegacySession;
}

// Legacy session format
export interface LegacySession {
  id: string;
  type: string;
  name: string;
  attendance: unknown[];
  department?: string;
  startTime: Date;
  endTime: Date;
  status: string;
  creator: UserInterface;
}

export interface MemberInterface {
  id: string;
  department?: string;
  user: UserInterface;
  embeddings?: string;
  isMinor?: boolean;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianName?: string;
  attendanceRecords: LegacyAttendanceRecord[];
}

// Props interface for MemberCard component
export interface MemberTypes {
  id: string;
  name: string;
  email: string;
  role: "admin" | "rep" | "staff" | "student";
  profilePicture?: string;
  department: string;
  phone?: string;
  isHovered?: boolean;
  hoverChange: (hovered: boolean) => void;
  isMinor?: boolean;
  isMinorChange?: (isMinor: boolean) => void;
  guardianName?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  yearGroup?: number;
  status?: string;
  attendanceRecords?: LegacyAttendanceRecord[];
}
