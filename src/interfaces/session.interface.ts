import type { AttendanceInterface } from "./attendance.interface";
import type { UserInterface } from "./members.interface";

export interface SessionInterface {
  id: string;
  category?: string;
  type: "check-in" | "check-out";
  name: string;
  attendance: AttendanceInterface[];
  department?: string;
  location?: string;
  yearGroup?: string;
  startTime: Date;
  endTime: Date;
  expectedMembersCount?: number;
  actualMembersCount?: number;
  status: "active" | "scheduled" | "completed";
  creator: UserInterface;
}
