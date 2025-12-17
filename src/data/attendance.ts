import type { AttendanceInterface } from "../interfaces/attendance.interface";

export const attendance: AttendanceInterface[] = [
  {
    memberId: "1",
    id: "1",
    status: "present",
    date: new Date("2025-11-16"),
    timeOfArrival: new Date("2025-11-16T09:00:00Z"),
    timeOfDeparture: new Date("2025-11-16T17:00:00Z"),
    members: [],
    session: {
      id: "1",
      type: "check-in",
      attendance: [],
      name: "Exams at the GCB",
      department: "Computer Science",
      location: "GCB Auditorium",
      startTime: "2025-11-15",
      endTime: "2025-12-25",
      expectedMembersCount: 100,
      actualMembersCount: 500,
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
  },

  {
    memberId: "2",
    id: "2",
    status: "present",
    date: new Date("2025-11-16"),
    timeOfArrival: new Date("2025-11-16T09:00:00Z"),
    timeOfDeparture: new Date("2025-11-16T17:00:00Z"),
    members: [],
    session: {
      id: "1",
      type: "check-in",
      attendance: [],
      name: "Exams at the GCB",
      department: "Computer Science",
      location: "GCB Auditorium",
      startTime: "2025-11-15",
      endTime: "2025-12-25",
      expectedMembersCount: 100,
      actualMembersCount: 500,
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
  },
];
