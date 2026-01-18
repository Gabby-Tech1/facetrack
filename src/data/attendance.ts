import type { AttendanceInterface } from "../interfaces/attendance.interface";

// Helper to create dates relative to today
const today = new Date();
const getDate = (daysOffset: number, hours: number, minutes: number = 0) => {
  const date = new Date(today);
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const mockAttendance: AttendanceInterface[] = [
  // Today's attendance for Session SES001
  {
    id: "ATT001",
    sessionId: "SES001",
    sessionName: "Data Structures - Lecture 12",
    userId: "STU001",
    userName: "Kwame Asante",
    userEmail: "student@demo.com",
    date: getDate(0, 8, 5),
    checkInTime: getDate(0, 8, 5),
    checkOutTime: getDate(0, 9, 55),
    status: "PRESENT",
    confidenceScore: 0.94,
    source: "kiosk",
    courseName: "Data Structures & Algorithms",
    courseCode: "CS301",
  },
  {
    id: "ATT002",
    sessionId: "SES001",
    sessionName: "Data Structures - Lecture 12",
    userId: "STU002",
    userName: "Ama Mensah",
    userEmail: "ama.mensah@demo.com",
    date: getDate(0, 8, 20),
    checkInTime: getDate(0, 8, 20),
    checkOutTime: getDate(0, 9, 50),
    status: "LATE",
    confidenceScore: 0.91,
    source: "mobile",
    courseName: "Data Structures & Algorithms",
    courseCode: "CS301",
  },
  {
    id: "ATT003",
    sessionId: "SES001",
    sessionName: "Data Structures - Lecture 12",
    userId: "STU003",
    userName: "Kofi Owusu",
    userEmail: "kofi.owusu@demo.com",
    date: getDate(0, 7, 55),
    checkInTime: getDate(0, 7, 55),
    checkOutTime: getDate(0, 10, 0),
    status: "PRESENT",
    confidenceScore: 0.97,
    source: "kiosk",
    courseName: "Data Structures & Algorithms",
    courseCode: "CS301",
  },
  // Today's attendance for Session SES002
  {
    id: "ATT004",
    sessionId: "SES002",
    sessionName: "Database Lab - Practical 5",
    userId: "STU001",
    userName: "Kwame Asante",
    userEmail: "student@demo.com",
    date: getDate(0, 14, 3),
    checkInTime: getDate(0, 14, 3),
    status: "PRESENT",
    confidenceScore: 0.89,
    source: "kiosk",
    courseName: "Database Management Systems",
    courseCode: "CS302",
  },
  {
    id: "ATT005",
    sessionId: "SES002",
    sessionName: "Database Lab - Practical 5",
    userId: "STU005",
    userName: "Yaw Dartey",
    userEmail: "yaw.dartey@demo.com",
    date: getDate(0, 14, 8),
    checkInTime: getDate(0, 14, 8),
    status: "PRESENT",
    confidenceScore: 0.92,
    source: "mobile",
    courseName: "Database Management Systems",
    courseCode: "CS302",
  },
  // Past attendance for Session SES005 (2 days ago)
  {
    id: "ATT006",
    sessionId: "SES005",
    sessionName: "Data Structures - Lecture 11",
    userId: "STU001",
    userName: "Kwame Asante",
    userEmail: "student@demo.com",
    date: getDate(-2, 8, 0),
    checkInTime: getDate(-2, 8, 0),
    checkOutTime: getDate(-2, 10, 0),
    status: "PRESENT",
    confidenceScore: 0.95,
    source: "kiosk",
    courseName: "Data Structures & Algorithms",
    courseCode: "CS301",
  },
  {
    id: "ATT007",
    sessionId: "SES005",
    sessionName: "Data Structures - Lecture 11",
    userId: "STU002",
    userName: "Ama Mensah",
    userEmail: "ama.mensah@demo.com",
    date: getDate(-2, 8, 5),
    checkInTime: getDate(-2, 8, 5),
    checkOutTime: getDate(-2, 9, 55),
    status: "PRESENT",
    confidenceScore: 0.88,
    source: "kiosk",
    courseName: "Data Structures & Algorithms",
    courseCode: "CS301",
  },
  {
    id: "ATT008",
    sessionId: "SES005",
    sessionName: "Data Structures - Lecture 11",
    userId: "STU003",
    userName: "Kofi Owusu",
    userEmail: "kofi.owusu@demo.com",
    date: getDate(-2, 8, 2),
    checkInTime: getDate(-2, 8, 2),
    checkOutTime: getDate(-2, 10, 0),
    status: "PRESENT",
    confidenceScore: 0.96,
    source: "kiosk",
    courseName: "Data Structures & Algorithms",
    courseCode: "CS301",
  },
  {
    id: "ATT009",
    sessionId: "SES005",
    sessionName: "Data Structures - Lecture 11",
    userId: "STU005",
    userName: "Yaw Dartey",
    userEmail: "yaw.dartey@demo.com",
    date: getDate(-2, 8, 25),
    checkInTime: getDate(-2, 8, 25),
    checkOutTime: getDate(-2, 9, 45),
    status: "LATE",
    confidenceScore: 0.91,
    source: "mobile",
    courseName: "Data Structures & Algorithms",
    courseCode: "CS301",
  },
  // Past attendance for Session SES006 (Quiz - 3 days ago)
  {
    id: "ATT010",
    sessionId: "SES006",
    sessionName: "Database - Quiz 2",
    userId: "STU001",
    userName: "Kwame Asante",
    userEmail: "student@demo.com",
    date: getDate(-3, 11, 0),
    checkInTime: getDate(-3, 11, 0),
    status: "PRESENT",
    confidenceScore: 0.93,
    source: "kiosk",
    courseName: "Database Management Systems",
    courseCode: "CS302",
  },
  {
    id: "ATT011",
    sessionId: "SES006",
    sessionName: "Database - Quiz 2",
    userId: "STU002",
    userName: "Ama Mensah",
    userEmail: "ama.mensah@demo.com",
    date: getDate(-3, 11, 3),
    checkInTime: getDate(-3, 11, 3),
    status: "PRESENT",
    confidenceScore: 0.90,
    source: "kiosk",
    courseName: "Database Management Systems",
    courseCode: "CS302",
  },
  {
    id: "ATT012",
    sessionId: "SES006",
    sessionName: "Database - Quiz 2",
    userId: "STU005",
    userName: "Yaw Dartey",
    userEmail: "yaw.dartey@demo.com",
    date: getDate(-3, 11, 8),
    checkInTime: getDate(-3, 11, 8),
    status: "LATE",
    confidenceScore: 0.87,
    source: "mobile",
    courseName: "Database Management Systems",
    courseCode: "CS302",
  },
  // Absent record example
  {
    id: "ATT013",
    sessionId: "SES006",
    sessionName: "Database - Quiz 2",
    userId: "STU004",
    userName: "Akosua Boateng",
    userEmail: "akosua.boateng@demo.com",
    date: getDate(-3, 11, 0),
    status: "ABSENT",
    source: "admin",
    courseName: "Database Management Systems",
    courseCode: "CS302",
  },
];

// Get attendance by session
export const getAttendanceBySession = (sessionId: string) => {
  return mockAttendance.filter((att) => att.sessionId === sessionId);
};

// Get attendance by user
export const getAttendanceByUser = (userId: string) => {
  return mockAttendance.filter((att) => att.userId === userId);
};

// Get attendance by user email
export const getAttendanceByEmail = (email: string) => {
  return mockAttendance.filter((att) => att.userEmail.toLowerCase() === email.toLowerCase());
};

// Calculate attendance stats for a user
export const getUserAttendanceStats = (userId: string) => {
  const userAttendance = getAttendanceByUser(userId);
  const total = userAttendance.length;
  const present = userAttendance.filter((a) => a.status === "PRESENT").length;
  const late = userAttendance.filter((a) => a.status === "LATE").length;
  const absent = userAttendance.filter((a) => a.status === "ABSENT").length;
  const rate = total > 0 ? ((present + late) / total) * 100 : 0;

  return { total, present, late, absent, rate };
};
