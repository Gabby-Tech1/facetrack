import type { Student, Lecturer, SystemAdmin } from "../interfaces/user.interface";

// Demo Students
export const students: Student[] = [
    {
        id: "STU001",
        email: "student@demo.com",
        name: "Kwame Asante",
        role: "student",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=kwame",
        department: "Computer Science",
        phone: "+233 24 123 4567",
        studentId: "CS2023001",
        yearGroup: 2,
        enrolledCourses: ["CRS001", "CRS002", "CRS003"],
        attendanceRate: 92.5,
        createdAt: new Date("2023-09-01"),
    },
    {
        id: "STU002",
        email: "ama.mensah@demo.com",
        name: "Ama Mensah",
        role: "student",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=ama",
        department: "Computer Science",
        phone: "+233 24 234 5678",
        studentId: "CS2023002",
        yearGroup: 2,
        enrolledCourses: ["CRS001", "CRS002"],
        attendanceRate: 88.3,
        createdAt: new Date("2023-09-01"),
    },
    {
        id: "STU003",
        email: "kofi.owusu@demo.com",
        name: "Kofi Owusu",
        role: "student",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=kofi",
        department: "Information Technology",
        phone: "+233 24 345 6789",
        studentId: "IT2023001",
        yearGroup: 3,
        enrolledCourses: ["CRS001", "CRS003", "CRS004"],
        attendanceRate: 95.0,
        createdAt: new Date("2022-09-01"),
    },
    {
        id: "STU004",
        email: "akosua.boateng@demo.com",
        name: "Akosua Boateng",
        role: "student",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=akosua",
        department: "Computer Science",
        phone: "+233 24 456 7890",
        studentId: "CS2023003",
        yearGroup: 1,
        enrolledCourses: ["CRS002", "CRS004"],
        attendanceRate: 78.5,
        createdAt: new Date("2024-09-01"),
    },
    {
        id: "STU005",
        email: "yaw.dartey@demo.com",
        name: "Yaw Dartey",
        role: "student",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=yaw",
        department: "Information Technology",
        phone: "+233 24 567 8901",
        studentId: "IT2023002",
        yearGroup: 2,
        enrolledCourses: ["CRS001", "CRS002", "CRS003", "CRS004"],
        attendanceRate: 85.0,
        createdAt: new Date("2023-09-01"),
    },
];

// Demo Lecturers
export const lecturers: Lecturer[] = [
    {
        id: "LEC001",
        email: "lecturer@demo.com",
        name: "Dr. Emmanuel Addo",
        role: "lecturer",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=emmanuel",
        department: "Computer Science",
        phone: "+233 20 111 2222",
        staffNumber: "STAFF001",
        assignedCourses: ["CRS001", "CRS002"],
        hourlyRate: 150,
        totalHoursWorked: 48,
        totalEarnings: 7200,
        createdAt: new Date("2020-01-15"),
    },
    {
        id: "LEC002",
        email: "grace.appiah@demo.com",
        name: "Prof. Grace Appiah",
        role: "lecturer",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=grace",
        department: "Information Technology",
        phone: "+233 20 222 3333",
        staffNumber: "STAFF002",
        assignedCourses: ["CRS003", "CRS004"],
        hourlyRate: 180,
        totalHoursWorked: 36,
        totalEarnings: 6480,
        createdAt: new Date("2018-08-20"),
    },
];

// Demo System Admins
export const systemAdmins: SystemAdmin[] = [
    {
        id: "ADM001",
        email: "admin@demo.com",
        name: "Samuel Osei",
        role: "system_admin",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=samuel",
        department: "IT Administration",
        phone: "+233 20 333 4444",
        adminNumber: "ADMIN001",
        permissions: ["manage_users", "manage_courses", "manage_sessions", "view_analytics", "system_settings"],
        createdAt: new Date("2019-03-10"),
    },
];

// Combined users for easy lookup
export const allUsers = [...students, ...lecturers, ...systemAdmins];

// Get user by email
export const getUserByEmail = (email: string) => {
    return allUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());
};

// Get user by ID
export const getUserById = (id: string) => {
    return allUsers.find((user) => user.id === id);
};
