import type { AttendanceInterface } from "./attendance.interface";

export type SessionType = "CLASS" | "EXAM" | "PRACTICAL" | "SEMINAR" | "OTHER";
export type SessionMode = "CHECK_IN" | "CHECK_OUT" | "CHECK_IN_OUT";
export type SessionStatus = "OPEN" | "CLOSED" | "SCHEDULED";

export interface SessionCreator {
  id: string;
  name: string;
  email: string;
  role: "lecturer" | "system_admin";
}

export interface SessionInterface {
  id: string;
  name: string;
  type: SessionType;
  mode: SessionMode;
  status: SessionStatus;
  courseId: string;
  courseName: string;
  courseCode: string;
  department?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  lateThreshold: number; // minutes after start to be marked late
  absentThreshold: number; // minutes after start to be marked absent
  token: string; // 6-char access token
  expectedMembersCount: number;
  actualMembersCount: number;
  attendance: AttendanceInterface[];
  creator: SessionCreator;
  createdAt: Date;
}
