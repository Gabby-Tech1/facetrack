import type { Course } from "../interfaces/course.interface";

export const courses: Course[] = [
    {
        id: "CRS001",
        code: "CS301",
        name: "Data Structures & Algorithms",
        department: "Computer Science",
        description: "Advanced study of data structures including trees, graphs, and hash tables. Algorithm design and analysis techniques.",
        lecturerId: "LEC001",
        lecturerName: "Dr. Emmanuel Addo",
        enrolledStudents: ["STU001", "STU002", "STU003", "STU005"],
        totalSessions: 24,
        createdAt: new Date("2024-01-10"),
    },
    {
        id: "CRS002",
        code: "CS302",
        name: "Database Management Systems",
        department: "Computer Science",
        description: "Principles of database design, SQL, normalization, and transaction management.",
        lecturerId: "LEC001",
        lecturerName: "Dr. Emmanuel Addo",
        enrolledStudents: ["STU001", "STU002", "STU004", "STU005"],
        totalSessions: 20,
        createdAt: new Date("2024-01-10"),
    },
    {
        id: "CRS003",
        code: "IT401",
        name: "Network Security",
        department: "Information Technology",
        description: "Introduction to network security principles, cryptography, and secure system design.",
        lecturerId: "LEC002",
        lecturerName: "Prof. Grace Appiah",
        enrolledStudents: ["STU001", "STU003", "STU005"],
        totalSessions: 18,
        createdAt: new Date("2024-01-15"),
    },
    {
        id: "CRS004",
        code: "IT402",
        name: "Cloud Computing",
        department: "Information Technology",
        description: "Cloud infrastructure, services, and deployment models. AWS, Azure, and GCP fundamentals.",
        lecturerId: "LEC002",
        lecturerName: "Prof. Grace Appiah",
        enrolledStudents: ["STU003", "STU004", "STU005"],
        totalSessions: 16,
        createdAt: new Date("2024-01-15"),
    },
];

// Get courses by lecturer ID
export const getCoursesByLecturer = (lecturerId: string) => {
    return courses.filter((course) => course.lecturerId === lecturerId);
};

// Get courses by student ID
export const getCoursesByStudent = (studentId: string) => {
    return courses.filter((course) => course.enrolledStudents.includes(studentId));
};

// Get course by ID
export const getCourseById = (courseId: string) => {
    return courses.find((course) => course.id === courseId);
};
