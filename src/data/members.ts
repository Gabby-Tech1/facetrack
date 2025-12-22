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
      profilePicture:
        "https://media.istockphoto.com/id/1443965653/photo/man-satisfied-with-his-online-purchase-decided-to-repeat-a-purchase.webp?a=1&b=1&s=612x612&w=0&k=20&c=4zNUqTp_QzNkt8tlQsG-whhI3NlkyKiMnp4lgX66k88=",
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
      profilePicture:
        "https://media.istockphoto.com/id/1443965653/photo/man-satisfied-with-his-online-purchase-decided-to-repeat-a-purchase.webp?a=1&b=1&s=612x612&w=0&k=20&c=4zNUqTp_QzNkt8tlQsG-whhI3NlkyKiMnp4lgX66k88=",
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
      profilePicture:
        "https://media.istockphoto.com/id/1443965653/photo/man-satisfied-with-his-online-purchase-decided-to-repeat-a-purchase.webp?a=1&b=1&s=612x612&w=0&k=20&c=4zNUqTp_QzNkt8tlQsG-whhI3NlkyKiMnp4lgX66k88=",
    } as UserInterface,
    department: "Computer Science",
    embeddings: "[0.1, 0.2, 0.3, 0.4]",
    isMinor: true,
    guardianName: "Jane Doe",
    guardianPhone: "0551875432",
    guardianEmail: "jane@example.com",
    attendanceRecords: [],
  },
  {
    id: "4",
    user: {
      id: "u3",
      name: "Bob Smith",
      email: "john@doe.com",
      role: "admin",
      profilePicture:
        "https://media.istockphoto.com/id/1443965653/photo/man-satisfied-with-his-online-purchase-decided-to-repeat-a-purchase.webp?a=1&b=1&s=612x612&w=0&k=20&c=4zNUqTp_QzNkt8tlQsG-whhI3NlkyKiMnp4lgX66k88=",
    } as UserInterface,
    department: "Computer Science",
    embeddings: "[0.1, 0.2, 0.3, 0.4]",
    isMinor: true,
    guardianName: "Jane Doe",
    guardianPhone: "0551875432",
    guardianEmail: "jane@example.com",
    attendanceRecords: [],
  },
  {
    id: "5",
    user: {
      id: "u3",
      name: "Bob Smith",
      email: "john@doe.com",
      role: "admin",
      profilePicture:
        "https://media.istockphoto.com/id/1443965653/photo/man-satisfied-with-his-online-purchase-decided-to-repeat-a-purchase.webp?a=1&b=1&s=612x612&w=0&k=20&c=4zNUqTp_QzNkt8tlQsG-whhI3NlkyKiMnp4lgX66k88=",
    } as UserInterface,
    department: "Computer Science",
    embeddings: "[0.1, 0.2, 0.3, 0.4]",
    isMinor: true,
    guardianName: "Jane Doe",
    guardianPhone: "0551875432",
    guardianEmail: "jane@example.com",
    attendanceRecords: [],
  },
  {
    id: "6",
    user: {
      id: "u3",
      name: "Bob Smith",
      email: "john@doe.com",
      role: "admin",
      profilePicture:
        "https://media.istockphoto.com/id/1443965653/photo/man-satisfied-with-his-online-purchase-decided-to-repeat-a-purchase.webp?a=1&b=1&s=612x612&w=0&k=20&c=4zNUqTp_QzNkt8tlQsG-whhI3NlkyKiMnp4lgX66k88=",
    } as UserInterface,
    department: "Computer Science",
    embeddings: "[0.1, 0.2, 0.3, 0.4]",
    isMinor: true,
    guardianName: "Jane Doe",
    guardianPhone: "0551875432",
    guardianEmail: "jane@example.com",
    attendanceRecords: [],
  },
  {
    id: "6",
    user: {
      id: "u3",
      name: "Bob Smith",
      email: "john@doe.com",
      role: "student",
      profilePicture:
        "https://media.istockphoto.com/id/1443965653/photo/man-satisfied-with-his-online-purchase-decided-to-repeat-a-purchase.webp?a=1&b=1&s=612x612&w=0&k=20&c=4zNUqTp_QzNkt8tlQsG-whhI3NlkyKiMnp4lgX66k88=",
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
