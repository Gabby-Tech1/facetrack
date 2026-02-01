import { create } from "zustand";
import type { Course, CreateCourseDto, UpdateCourseDto } from "../types";
import { coursesApi } from "../api/courses.api";

// ============================================
// COURSE STORE TYPES
// ============================================

interface CourseState {
  // State
  courses: Course[];
  selectedCourse: Course | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAllCourses: () => Promise<void>;
  addCourse: (data: CreateCourseDto) => Promise<{ success: boolean; error?: string; course?: Course }>;
  updateCourse: (courseId: string, data: UpdateCourseDto) => Promise<{ success: boolean; error?: string }>;
  removeCourse: (courseId: string) => Promise<{ success: boolean; error?: string }>;
  removeStudentFromCourse: (courseId: string, studentId: string) => Promise<{ success: boolean; error?: string }>;
  setSelectedCourse: (course: Course | null) => void;
  clearError: () => void;
}

// ============================================
// COURSE STORE
// ============================================

export const useCourseStore = create<CourseState>()((set, get) => ({
  // Initial State
  courses: [],
  selectedCourse: null,
  isLoading: false,
  error: null,

  // Fetch all courses
  fetchAllCourses: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await coursesApi.getAllCourses();
      set({ courses: response.data, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch courses";
      set({ isLoading: false, error: errorMessage });
    }
  },

  // Add course
  addCourse: async (data: CreateCourseDto) => {
    set({ isLoading: true, error: null });

    try {
      const response = await coursesApi.addCourse(data);
      // Refresh courses list
      await get().fetchAllCourses();
      set({ isLoading: false });
      return { success: true, course: response.data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add course";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Update course
  updateCourse: async (courseId: string, data: UpdateCourseDto) => {
    set({ isLoading: true, error: null });

    try {
      await coursesApi.updateCourse(courseId, data);
      // Refresh courses list
      await get().fetchAllCourses();
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update course";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Remove course
  removeCourse: async (courseId: string) => {
    set({ isLoading: true, error: null });

    try {
      await coursesApi.removeCourse(courseId);
      // Refresh courses list
      await get().fetchAllCourses();
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to remove course";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Remove student from course
  removeStudentFromCourse: async (courseId: string, studentId: string) => {
    set({ isLoading: true, error: null });

    try {
      await coursesApi.removeStudentFromCourse(courseId, studentId);
      // Refresh courses list
      await get().fetchAllCourses();
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to remove student";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Set selected course
  setSelectedCourse: (course: Course | null) => {
    set({ selectedCourse: course });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
