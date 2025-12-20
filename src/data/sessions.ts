import type { SessionInterface } from "../interfaces/session.interface";

export const sessions: SessionInterface[] = [
  {
    id: "1",
    type: "check-in",
    attendance: [],
    name: "Exams at the GCB",
    department: "Computer Science",
    location: "GCB Auditorium",
    startTime: new Date("2025-11-15"),
    endTime: new Date("2025-12-25"),
    expectedMembersCount: 500,
    actualMembersCount: 100,
    category: "Examination",
    status: "active",
    creator: {
      id: "1",
      name: "Dickson Peprah",
      email: "dickson@gmail.com",

      role: "staff",
      profilePicture:
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FyfGVufDB8fDB8fHww",
    },
  },

  {
    id: "2",
    type: "check-in",
    attendance: [],
    category: "Class",
    name: "Exams at the GCB",
    department: "Computer Science",
    location: "GCB Auditorium",
    startTime: new Date("2025-11-15"),
    endTime: new Date("2025-12-25"),
    expectedMembersCount: 500,
    actualMembersCount: 100,
    status: "scheduled",
    creator: {
      id: "1",
      name: "Dickson Peprah",
      email: "dickson@gmail.com",
      role: "staff",
      profilePicture:
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FyfGVufDB8fDB8fHww",
    },
  },
  {
    id: "3",
    type: "check-in",
    category: "Examination",
    attendance: [],
    name: "Exams at the GCB",
    department: "Computer Science",
    location: "GCB Auditorium",
    startTime: new Date("2025-11-15"),
    endTime: new Date("2025-12-25"),
    expectedMembersCount: 500,
    actualMembersCount: 100,
    status: "completed",
    creator: {
      id: "1",
      name: "Dickson Peprah",
      email: "dickson@gmail.com",
      role: "staff",
      profilePicture:
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FyfGVufDB8fDB8fHww",
    },
  },
];
