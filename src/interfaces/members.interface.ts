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

export type MemberTypes = {
  name: string;
  profilePicture: string;
  role: string;
  globalRole: string;
  id: string;
  email: string;
  yearGroup?: number;
  isMinor?: boolean;
  phone: string;
  status?: string;
  guardianName?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  department: string;
  isHovered?: boolean | undefined;
  inputFieldChange?: (value: string) => void;
  isMinorChange?: (value: boolean) => void;
  hoverChange: (isHovered: boolean) => void;
  attendanceRecords?: AttendanceInterface[];
};
