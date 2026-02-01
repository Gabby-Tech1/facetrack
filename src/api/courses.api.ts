import apiClient, { deduplicatedGet } from "./client";
import type {
  Course,
  CreateCourseDto,
  UpdateCourseDto,
  ApiResponse,
} from "../types";

/**
 * Courses API endpoints
 * Matches backend: src/courses/courses.controller.ts
 */
export const coursesApi = {
  /**
   * Add a new course
   * POST /courses/add
   * Roles: ADMIN, SYSTEM_ADMIN
   * Body: { title, courseCode, description, lecturerId? }
   */
  addCourse: async (data: CreateCourseDto): Promise<ApiResponse & { data?: Course }> => {
    const response = await apiClient.post<ApiResponse & { data?: Course }>("/courses/add", data);
    return response.data;
  },

  /**
   * Update a course
   * PATCH /courses/update?courseId=xxx
   * Roles: ADMIN, SYSTEM_ADMIN
   * Body: { title?, description?, courseCode?, lecturerId? }
   */
  updateCourse: async (courseId: string, data: UpdateCourseDto): Promise<ApiResponse & { data?: Course }> => {
    const response = await apiClient.patch<ApiResponse & { data?: Course }>(
      "/courses/update",
      data,
      { params: { courseId } }
    );
    return response.data;
  },

  /**
   * Get all courses
   * GET /courses/all
   * Roles: ADMIN, SYSTEM_ADMIN, LECTURER, STUDENT
   * Returns: { success: true, data: Course[] }
   */
  getAllCourses: async (): Promise<{ success: boolean; data: Course[] }> => {
    return deduplicatedGet<{ success: boolean; data: Course[] }>("/courses/all");
  },

  /**
   * Remove a course
   * GET /courses/remove?courseId=xxx
   * Roles: ADMIN, SYSTEM_ADMIN
   */
  removeCourse: async (courseId: string): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>("/courses/remove", {
      params: { courseId },
    });
    return response.data;
  },

  /**
   * Remove student from course
   * GET /courses/remove-student-course?courseId=xxx&studentId=xxx
   * Roles: ADMIN, SYSTEM_ADMIN
   */
  removeStudentFromCourse: async (courseId: string, studentId: string): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>("/courses/remove-student-course", {
      params: { courseId, studentId },
    });
    return response.data;
  },


  /**
    * Assign a Class Rep to a course
    * POST /courses/assign-rep
    * Roles: ADMIN, SYSTEM_ADMIN, LECTURER
    * Body: { courseId, studentId }
    */
  assignRep: async (courseId: string, studentId: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>("/courses/assign-rep", { courseId, studentId });
    return response.data;
  },
};
