import type { AttendanceInterface } from "./attendance.interface";
import type { UserInterface } from "./members.interface";

export interface SessionInterface {
  id: string;
  type: "check-in" | "check-out";
  name: string;
  attendance: AttendanceInterface[];
  department?: string;
  location?: string;
  startTime: string;
  endTime: string;
  expectedMembersCount?: number;
  actualMembersCount?: number;
  status: "active" | "scheduled" | "completed";
  creator: UserInterface;
}
