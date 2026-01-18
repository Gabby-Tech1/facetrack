export type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED" | "CHECKED_IN";

export interface AttendanceInterface {
  id: string;
  sessionId: string;
  sessionName: string;
  userId: string;
  userName: string;
  userEmail: string;
  date: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  status: AttendanceStatus;
  confidenceScore?: number; // face recognition confidence
  source: "kiosk" | "mobile" | "admin";
  courseName?: string;
  courseCode?: string;
}
