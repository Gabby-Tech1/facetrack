import { useState, useCallback } from "react";
import { students as initialStudents, lecturers as initialLecturers, systemAdmins as initialAdmins } from "./users";
import { courses as initialCourses } from "./courses";
import { mockSessions as initialSessions } from "./sessions";
import { mockAttendance as initialAttendance } from "./attendance";
import type { Student, Lecturer, SystemAdmin, AnyUser } from "../interfaces/user.interface";
import type { Course } from "../interfaces/course.interface";
import type { SessionInterface } from "../interfaces/session.interface";
import type { AttendanceInterface } from "../interfaces/attendance.interface";

// Types
export type UserRole = "student" | "lecturer" | "system_admin";

// Generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Create the store hook
export const useDataStore = () => {
    const [studentsData, setStudents] = useState<Student[]>([...initialStudents]);
    const [lecturersData, setLecturers] = useState<Lecturer[]>([...initialLecturers]);
    const [adminsData, setAdmins] = useState<SystemAdmin[]>([...initialAdmins]);
    const [coursesData, setCourses] = useState<Course[]>([...initialCourses]);
    const [sessionsData, setSessions] = useState<SessionInterface[]>([...initialSessions]);
    const [attendanceData, setAttendance] = useState<AttendanceInterface[]>([...initialAttendance]);

    // === USERS ===
    const getAllUsers = useCallback((): (AnyUser & { isActive?: boolean })[] => {
        return [...studentsData, ...lecturersData, ...adminsData];
    }, [studentsData, lecturersData, adminsData]);

    const addStudent = useCallback((data: Omit<Student, "id" | "createdAt">) => {
        const student: Student = { ...data, id: generateId(), createdAt: new Date() };
        setStudents((prev) => [...prev, student]);
    }, []);

    const addLecturer = useCallback((data: Omit<Lecturer, "id" | "createdAt">) => {
        const lecturer: Lecturer = { ...data, id: generateId(), createdAt: new Date() };
        setLecturers((prev) => [...prev, lecturer]);
    }, []);

    const addAdmin = useCallback((data: Omit<SystemAdmin, "id" | "createdAt">) => {
        const admin: SystemAdmin = { ...data, id: generateId(), createdAt: new Date() };
        setAdmins((prev) => [...prev, admin]);
    }, []);

    const updateStudent = useCallback((id: string, updates: Partial<Student>) => {
        setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    }, []);

    const updateLecturer = useCallback((id: string, updates: Partial<Lecturer>) => {
        setLecturers((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
    }, []);

    const updateAdmin = useCallback((id: string, updates: Partial<SystemAdmin>) => {
        setAdmins((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    }, []);

    const deleteUser = useCallback((id: string, role: UserRole) => {
        if (role === "student") setStudents((prev) => prev.filter((s) => s.id !== id));
        else if (role === "lecturer") setLecturers((prev) => prev.filter((l) => l.id !== id));
        else setAdmins((prev) => prev.filter((a) => a.id !== id));
    }, []);

    // === COURSES ===
    const addCourse = useCallback((course: Omit<Course, "id">) => {
        setCourses((prev) => [...prev, { ...course, id: generateId() }]);
    }, []);

    const updateCourse = useCallback((id: string, updates: Partial<Course>) => {
        setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    }, []);

    const deleteCourse = useCallback((id: string) => {
        setCourses((prev) => prev.filter((c) => c.id !== id));
    }, []);

    // === SESSIONS ===
    const addSession = useCallback((session: Omit<SessionInterface, "id">) => {
        setSessions((prev) => [...prev, { ...session, id: generateId() }]);
    }, []);

    const closeSession = useCallback((id: string) => {
        setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, status: "CLOSED" as const } : s)));
    }, []);

    const deleteSession = useCallback((id: string) => {
        setSessions((prev) => prev.filter((s) => s.id !== id));
    }, []);

    // === ATTENDANCE ===
    const updateAttendanceStatus = useCallback((id: string, status: AttendanceInterface["status"]) => {
        setAttendance((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    }, []);

    const addAttendanceRecord = useCallback((record: Omit<AttendanceInterface, "id">) => {
        setAttendance((prev) => [...prev, { ...record, id: generateId() }]);
    }, []);

    // === ENROLLMENT ===
    const enrollStudent = useCallback((studentId: string, courseId: string) => {
        // Add course to student's enrolled courses
        setStudents((prev) => prev.map((s) => {
            if (s.id === studentId && !s.enrolledCourses.includes(courseId)) {
                return { ...s, enrolledCourses: [...s.enrolledCourses, courseId] };
            }
            return s;
        }));

        // Add student to course's enrolled students
        setCourses((prev) => prev.map((c) => {
            if (c.id === courseId && !c.enrolledStudents.includes(studentId)) {
                return { ...c, enrolledStudents: [...c.enrolledStudents, studentId] };
            }
            return c;
        }));
    }, []);

    const unenrollStudent = useCallback((studentId: string, courseId: string) => {
        // Remove course from student's enrolled courses
        setStudents((prev) => prev.map((s) => {
            if (s.id === studentId) {
                return { ...s, enrolledCourses: s.enrolledCourses.filter(id => id !== courseId) };
            }
            return s;
        }));

        // Remove student from course's enrolled students
        setCourses((prev) => prev.map((c) => {
            if (c.id === courseId) {
                return { ...c, enrolledStudents: c.enrolledStudents.filter(id => id !== studentId) };
            }
            return c;
        }));
    }, []);

    return {
        students: studentsData,
        lecturers: lecturersData,
        admins: adminsData,
        courses: coursesData,
        sessions: sessionsData,
        attendance: attendanceData,
        getAllUsers,
        addStudent,
        addLecturer,
        addAdmin,
        updateStudent,
        updateLecturer,
        updateAdmin,
        deleteUser,
        addCourse,
        updateCourse,
        deleteCourse,
        addSession,
        closeSession,
        deleteSession,
        updateAttendanceStatus,
        addAttendanceRecord,
        enrollStudent,
        unenrollStudent,
    };
};

export type DataStore = ReturnType<typeof useDataStore>;
