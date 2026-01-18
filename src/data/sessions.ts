import type { SessionInterface } from "../interfaces/session.interface";

// Helper to create dates relative to today
const today = new Date();
const getDate = (daysOffset: number, hours: number, minutes: number = 0) => {
  const date = new Date(today);
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const mockSessions: SessionInterface[] = [
  // Today's sessions
  {
    id: "SES001",
    name: "Data Structures - Lecture 12",
    type: "CLASS",
    mode: "CHECK_IN_OUT",
    status: "OPEN",
    courseId: "CRS001",
    courseName: "Data Structures & Algorithms",
    courseCode: "CS301",
    department: "Computer Science",
    location: "Block A, Room 101",
    startTime: getDate(0, 8, 0),
    endTime: getDate(0, 10, 0),
    lateThreshold: 15,
    absentThreshold: 30,
    token: "ABC123",
    expectedMembersCount: 4,
    actualMembersCount: 3,
    attendance: [],
    creator: { id: "LEC001", name: "Dr. Emmanuel Addo", email: "lecturer@demo.com", role: "lecturer" },
    createdAt: getDate(-1, 10),
  },
  {
    id: "SES002",
    name: "Database Lab - Practical 5",
    type: "PRACTICAL",
    mode: "CHECK_IN",
    status: "OPEN",
    courseId: "CRS002",
    courseName: "Database Management Systems",
    courseCode: "CS302",
    department: "Computer Science",
    location: "Computer Lab 2",
    startTime: getDate(0, 14, 0),
    endTime: getDate(0, 17, 0),
    lateThreshold: 10,
    absentThreshold: 20,
    token: "DEF456",
    expectedMembersCount: 4,
    actualMembersCount: 2,
    attendance: [],
    creator: { id: "LEC001", name: "Dr. Emmanuel Addo", email: "lecturer@demo.com", role: "lecturer" },
    createdAt: getDate(-1, 14),
  },
  {
    id: "SES003",
    name: "Network Security - Midterm Exam",
    type: "EXAM",
    mode: "CHECK_IN_OUT",
    status: "SCHEDULED",
    courseId: "CRS003",
    courseName: "Network Security",
    courseCode: "IT401",
    department: "Information Technology",
    location: "Exam Hall A",
    startTime: getDate(1, 9, 0),
    endTime: getDate(1, 12, 0),
    lateThreshold: 0,
    absentThreshold: 15,
    token: "GHI789",
    expectedMembersCount: 3,
    actualMembersCount: 0,
    attendance: [],
    creator: { id: "LEC002", name: "Prof. Grace Appiah", email: "grace.appiah@demo.com", role: "lecturer" },
    createdAt: getDate(-3, 9),
  },
  {
    id: "SES004",
    name: "Cloud Computing - Guest Lecture",
    type: "SEMINAR",
    mode: "CHECK_IN",
    status: "SCHEDULED",
    courseId: "CRS004",
    courseName: "Cloud Computing",
    courseCode: "IT402",
    department: "Information Technology",
    location: "Auditorium",
    startTime: getDate(2, 10, 0),
    endTime: getDate(2, 12, 0),
    lateThreshold: 15,
    absentThreshold: 30,
    token: "JKL012",
    expectedMembersCount: 3,
    actualMembersCount: 0,
    attendance: [],
    creator: { id: "LEC002", name: "Prof. Grace Appiah", email: "grace.appiah@demo.com", role: "lecturer" },
    createdAt: getDate(-2, 15),
  },
  // Past sessions (completed)
  {
    id: "SES005",
    name: "Data Structures - Lecture 11",
    type: "CLASS",
    mode: "CHECK_IN_OUT",
    status: "CLOSED",
    courseId: "CRS001",
    courseName: "Data Structures & Algorithms",
    courseCode: "CS301",
    department: "Computer Science",
    location: "Block A, Room 101",
    startTime: getDate(-2, 8, 0),
    endTime: getDate(-2, 10, 0),
    lateThreshold: 15,
    absentThreshold: 30,
    token: "MNO345",
    expectedMembersCount: 4,
    actualMembersCount: 4,
    attendance: [],
    creator: { id: "LEC001", name: "Dr. Emmanuel Addo", email: "lecturer@demo.com", role: "lecturer" },
    createdAt: getDate(-5, 10),
  },
  {
    id: "SES006",
    name: "Database - Quiz 2",
    type: "EXAM",
    mode: "CHECK_IN",
    status: "CLOSED",
    courseId: "CRS002",
    courseName: "Database Management Systems",
    courseCode: "CS302",
    department: "Computer Science",
    location: "Block B, Room 205",
    startTime: getDate(-3, 11, 0),
    endTime: getDate(-3, 12, 0),
    lateThreshold: 5,
    absentThreshold: 10,
    token: "PQR678",
    expectedMembersCount: 4,
    actualMembersCount: 3,
    attendance: [],
    creator: { id: "LEC001", name: "Dr. Emmanuel Addo", email: "lecturer@demo.com", role: "lecturer" },
    createdAt: getDate(-7, 11),
  },
];

// Get sessions by status
export const getSessionsByStatus = (status: "OPEN" | "CLOSED" | "SCHEDULED") => {
  return mockSessions.filter((session) => session.status === status);
};

// Get sessions by lecturer
export const getSessionsByLecturer = (lecturerId: string) => {
  return mockSessions.filter((session) => session.creator.id === lecturerId);
};

// Get sessions by course
export const getSessionsByCourse = (courseId: string) => {
  return mockSessions.filter((session) => session.courseId === courseId);
};

// Get session by token
export const getSessionByToken = (token: string) => {
  return mockSessions.find((session) => session.token === token);
};
