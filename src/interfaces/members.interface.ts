import type { AttendanceInterface } from "./attendance.interface";
import type { SessionInterface } from "./session.interface";

export interface MemberInterface {
  id: string;
  department?: string;
  user: UserInterface;
  embeddings: string;
  isMinor: boolean;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianName?: string;
  attendanceRecords: AttendanceInterface[];
}

export interface UserInterface {
  id: string;
  name: string;
  email: string;
  role: "admin" | "rep" | "staff" | "student";
  profilePicture?: string;
}

export interface Staff {
  id: string;
  user: UserInterface;
  sessions: SessionInterface[];
  members: MemberInterface[];
}
