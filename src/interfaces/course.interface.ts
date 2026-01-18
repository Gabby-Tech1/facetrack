export interface Course {
    id: string;
    code: string;
    name: string;
    department: string;
    description?: string;
    lecturerId: string;
    lecturerName: string;
    enrolledStudents: string[]; // student IDs
    totalSessions: number;
    createdAt: Date;
}

export interface CourseEnrollment {
    id: string;
    courseId: string;
    studentId: string;
    enrolledAt: Date;
    status: "active" | "dropped" | "completed";
}
