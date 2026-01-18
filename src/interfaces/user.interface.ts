export type UserRole = "student" | "lecturer" | "system_admin";

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    profilePicture?: string;
    department?: string;
    phone?: string;
    createdAt: Date;
}

export interface Student extends User {
    role: "student";
    studentId: string;
    yearGroup: number;
    enrolledCourses: string[]; // course IDs
    attendanceRate: number;
}

export interface Lecturer extends User {
    role: "lecturer";
    staffNumber: string;
    assignedCourses: string[]; // course IDs
    hourlyRate: number;
    totalHoursWorked: number;
    totalEarnings: number;
    paymentDetails?: {
        provider: "MTN" | "VODAFONE" | "AIRTELTIGO" | "BANK";
        accountName: string;
        accountNumber: string;
    };
}

export interface SystemAdmin extends User {
    role: "system_admin";
    adminNumber: string;
    permissions: string[];
}

export type AnyUser = Student | Lecturer | SystemAdmin;
