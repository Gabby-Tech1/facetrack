import type { MemberInterface } from "../interfaces/members.interface";
import type { UserInterface } from "../interfaces/members.interface";

export const members: MemberInterface[] = [
  {
    id: "1",
    department: "Computer Science",
    user: {
      id: "u1",
      name: "John Doe",
      email: "john.doe@example.com",
      role: "staff",
      profilePicture: "https://example.com/profiles/johndoe.jpg",
    } as UserInterface,
    embeddings: "[0.1, 0.2, 0.3, 0.4]",
    isMinor: true,
    guardianName: "Jane Doe",
    guardianPhone: "0551875432",
    guardianEmail: "jane@example.com",
    attendanceRecords: [],
  },
  {
    id: "2",
    user: {
      id: "u2",
      name: "Alice Johnson",
      email: "danny@example.com",
      role: "rep",
      profilePicture: "https://example.com/profiles/johndoe.jpg",
    },
    department: "Computer Science",
    embeddings: "[0.1, 0.2, 0.3, 0.4]",
    isMinor: true,
    guardianName: "Jane Doe",
    guardianPhone: "0551875432",
    guardianEmail: "jane@example.com",
    attendanceRecords: [],
  },
  {
    id: "3",
    user: {
      id: "u3",
      name: "Bob Smith",
      email: "john@doe.com",
      role: "admin",
      profilePicture: "https://example.com/profiles/johndoe.jpg",
    } as UserInterface,
    department: "Computer Science",
    embeddings: "[0.1, 0.2, 0.3, 0.4]",
    isMinor: true,
    guardianName: "Jane Doe",
    guardianPhone: "0551875432",
    guardianEmail: "jane@example.com",
    attendanceRecords: [],
  },
];
