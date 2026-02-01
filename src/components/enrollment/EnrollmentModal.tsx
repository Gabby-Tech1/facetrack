import React, { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Camera,
  Upload,
  X,
  Check,
  Loader2,
  User,
  BookOpen,
  AlertCircle,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { usersApi } from "../../api/users.api";
import { coursesApi } from "../../api/courses.api";
import { Role, ImageStatus } from "../../types";
import type { Course } from "../../types";
import { useFaceDetection } from "../../contexts/FaceDetectionContext";
import { FaceDetectionOverlay, FaceValidationStatus } from "../../components/face-detection";
import type { FaceValidationResult } from "../../services/faceDetection.service";

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EnrollmentModal: React.FC<EnrollmentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, fetchCurrentUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Form state
  const [studentId, setStudentId] = useState(user?.student?.studentId || "");
  const [selectedCourses, setSelectedCourses] = useState<string[]>(
    user?.student?.enrollments?.map(e => e.course?.code).filter(Boolean) as string[] || []
  );
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);

  // Face detection state
  const { modelsLoaded, modelsLoading, loadModels } = useFaceDetection();
  const [faceValidation, setFaceValidation] = useState<FaceValidationResult | null>(null);
  const [autoCaptureProgress, setAutoCaptureProgress] = useState(0);
  const autoCaptureStartTime = useRef<number | null>(null);
  const AUTO_CAPTURE_DELAY = 1500; // 1.5 seconds of valid face to auto-capture

  // Load models on mount if needed
  useEffect(() => {
    if (isOpen && !modelsLoaded && !modelsLoading) {
      loadModels();
    }
  }, [isOpen, modelsLoaded, modelsLoading, loadModels]);

  // Job tracking state
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Check if already enrolled
  const isAlreadyEnrolled = user?.imageStatus === ImageStatus.UPLOADED ||
    user?.imageStatus === ImageStatus.COMPLETED;

  // Fetch available courses when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const response = await coursesApi.getAllCourses();
        setCourses(response.data || []);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        toast.error("Failed to load courses");
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [isOpen]);

  // Cleanup camera stream on unmount or modal close
  useEffect(() => {
    if (!isOpen && stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setShowCamera(false);
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, stream]);

  // Poll job status
  const pollJobStatus = useCallback(async (id: string) => {
    try {
      const response = await usersApi.getJobStatus(id);
      setJobStatus(response.status as string);

      if (response.status === "completed") {
        setIsPolling(false);
        toast.success("Face image processed successfully!");
        await fetchCurrentUser();
        onSuccess?.();
        setTimeout(() => handleClose(), 1500);
      } else if (response.status === "failed") {
        setIsPolling(false);
        toast.error("Face image processing failed. Please try again.");
      }
    } catch (error) {
      console.error("Failed to get job status:", error);
    }
  }, [fetchCurrentUser, onSuccess]);

  useEffect(() => {
    if (!jobId || !isPolling) return;

    const interval = setInterval(() => {
      pollJobStatus(jobId);
    }, 3000);

    return () => clearInterval(interval);
  }, [jobId, isPolling, pollJobStatus]);

  // Reset form state
  const resetForm = () => {
    setStudentId(user?.student?.studentId || "");
    setSelectedCourses(user?.student?.enrollments?.map(e => e.course?.code).filter(Boolean) as string[] || []);
    setFaceImage(null);
    setImagePreview(null);
    setShowCamera(false);
    setJobId(null);
    setJobStatus(null);
    setIsPolling(false);
    setShowCourseDropdown(false);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Handle close
  const handleClose = () => {
    if (isLoading || isPolling) return;
    resetForm();
    onClose();
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, PNG)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setFaceImage(file);
      setImagePreview(URL.createObjectURL(file));
      setShowCamera(false);
    }
  };



  // Sync stream to video ref when camera is shown
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, showCamera]);
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowCamera(true);
    } catch (error) {
      console.error("Camera access denied:", error);
      toast.error("Unable to access camera. Please allow camera permissions.");
    }
  };

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setFaceValidation(null);
    setAutoCaptureProgress(0);
    autoCaptureStartTime.current = null;
  }, [stream]);

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Ensure canvas dimensions match video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    context.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], "face-capture.jpg", { type: "image/jpeg" });
          setFaceImage(file);
          setImagePreview(canvas.toDataURL("image/jpeg"));
          stopCamera();
        }
      },
      "image/jpeg",
      0.9
    );
  }, [stopCamera]);

  // Handle face validation updates
  const handleFaceValidation = useCallback((result: FaceValidationResult) => {
    setFaceValidation(result);

    // Update auto-capture progress
    if (result.isValid) {
      if (autoCaptureStartTime.current === null) {
        autoCaptureStartTime.current = Date.now();
      }
      const elapsed = Date.now() - autoCaptureStartTime.current;
      const progress = Math.min(100, (elapsed / AUTO_CAPTURE_DELAY) * 100);
      setAutoCaptureProgress(progress);
    } else {
      autoCaptureStartTime.current = null;
      setAutoCaptureProgress(0);
    }
  }, []);

  // Handle auto-capture
  const handleAutoCapture = useCallback(() => {
    if (showCamera && !faceImage && faceValidation?.isValid) {
      capturePhoto();
      toast.success("Photo captured automatically!");
    }
  }, [showCamera, faceImage, faceValidation?.isValid, capturePhoto]);




  // Clear selected image
  const clearImage = () => {
    setFaceImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Toggle course selection
  const toggleCourse = (courseCode: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseCode)
        ? prev.filter((c) => c !== courseCode)
        : [...prev, courseCode]
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId.trim()) {
      toast.error("Please enter your student ID");
      return;
    }

    if (selectedCourses.length === 0) {
      toast.error("Please select at least one course");
      return;
    }

    if (!faceImage && !isAlreadyEnrolled) {
      toast.error("Please upload or capture a face image");
      return;
    }

    setIsLoading(true);

    try {
      if (faceImage) {
        // Full enrollment (or update with new face)
        const response = await usersApi.enrollUser(
          {
            role: Role.STUDENT,
            studentId: studentId.trim(),
            courses: selectedCourses,
          },
          faceImage
        );

        toast.success(response.message || "Enrollment submitted successfully!");

        if (response.jobId) {
          setJobId(response.jobId);
          setIsPolling(true);
          toast.info("Processing your face image in the background...");
        } else {
          await fetchCurrentUser();
          onSuccess?.();
          setTimeout(() => handleClose(), 1500);
        }
      } else {
        // Just updating courses/student info
        const response = await usersApi.updateRecords({
          studentId: studentId.trim(),
          courses: selectedCourses,
        });

        toast.success(response.message || "Records updated successfully!");
        await fetchCurrentUser();
        onSuccess?.();
        setTimeout(() => handleClose(), 1500);
      }
    } catch (error) {
      console.error("Enrollment failed:", error);
      toast.error(error instanceof Error ? error.message : "Enrollment failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Complete Enrollment</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Upload face image & select courses</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading || isPolling}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Enrollment Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Student ID */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Student ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter your student ID (e.g., STU001)"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={isLoading || isPolling}
            />
          </div>

          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <BookOpen className="w-4 h-4 inline mr-1" />
              Select Courses <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCourseDropdown(!showCourseDropdown)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                disabled={loadingCourses || isLoading || isPolling}
              >
                <span className={selectedCourses.length > 0 ? "text-slate-900 dark:text-white" : "text-slate-400"}>
                  {loadingCourses
                    ? "Loading courses..."
                    : selectedCourses.length > 0
                      ? `${selectedCourses.length} course(s) selected`
                      : "Select your courses"}
                </span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showCourseDropdown ? "rotate-180" : ""}`} />
              </button>

              {showCourseDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg max-h-60 overflow-y-auto">
                  {courses.length === 0 ? (
                    <div className="px-4 py-3 text-slate-500 text-center">
                      No courses available
                    </div>
                  ) : (
                    courses.map((course) => (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => toggleCourse(course.code)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedCourses.includes(course.code)
                            ? "bg-blue-600 border-blue-600"
                            : "border-slate-300 dark:border-slate-600"
                            }`}
                        >
                          {selectedCourses.includes(course.code) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-900 dark:text-white font-medium">
                            {course.code}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">
                            {course.title}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Selected courses chips */}
            {selectedCourses.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedCourses.map((code) => (
                  <span
                    key={code}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                  >
                    {code}
                    <button
                      type="button"
                      onClick={() => toggleCourse(code)}
                      className="hover:text-blue-900 dark:hover:text-blue-100"
                      disabled={isLoading || isPolling}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Face Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <Camera className="w-4 h-4 inline mr-1" />
              Face Image <span className="text-red-500">*</span>
            </label>

            {!imagePreview && !showCamera ? (
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Camera className="w-7 h-7 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
                      Upload a clear photo of your face for attendance verification
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        disabled={isLoading || isPolling}
                      >
                        <Camera className="w-4 h-4" />
                        Take Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
                        disabled={isLoading || isPolling}
                      >
                        <Upload className="w-4 h-4" />
                        Upload Image
                      </button>
                    </div>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : showCamera ? (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3]">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Face Detection Overlay */}
                  {modelsLoaded && (
                    <FaceDetectionOverlay
                      videoRef={videoRef}
                      onFaceValidation={handleFaceValidation}
                      onAutoCapture={handleAutoCapture}
                      autoCaptureDelay={AUTO_CAPTURE_DELAY}
                      enabled={true}
                      showOverlay={true}
                    />
                  )}

                  {!modelsLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-60 border-2 border-dashed border-white/50 rounded-[50%]" />
                    </div>
                  )}

                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      disabled={!faceValidation?.isValid && modelsLoaded}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg text-sm transition-colors ${!faceValidation?.isValid && modelsLoaded
                        ? "bg-slate-500 cursor-not-allowed text-slate-300"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                    >
                      <Camera className="w-4 h-4" />
                      Capture
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg text-sm"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Face Validation Status */}
                <FaceValidationStatus
                  result={faceValidation}
                  modelsLoading={modelsLoading}
                  modelsLoaded={modelsLoaded}
                  autoCapturing={faceValidation?.isValid && autoCaptureProgress > 0}
                  autoCaptureProgress={autoCaptureProgress}
                  className="justify-center"
                />
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview!}
                  alt="Face preview"
                  className="w-full max-h-64 object-contain rounded-xl bg-slate-100 dark:bg-slate-800"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                  disabled={isLoading || isPolling}
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-3 right-3 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur text-slate-700 dark:text-slate-300 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors shadow text-sm"
                    disabled={isLoading || isPolling}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retake
                  </button>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {isAlreadyEnrolled
                ? "Leave blank to keep your current face image. Face must be clearly visible if uploading a new one."
                : "Face must be clearly visible. Supported formats: JPEG, PNG. Max size: 5MB."}
            </p>
          </div>

          {/* Job Status */}
          {isPolling && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <div>
                  <p className="text-blue-700 dark:text-blue-300 font-medium">
                    Processing your face image...
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 text-sm">
                    Status: {jobStatus || "Queued"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading || isPolling}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isPolling || !faceImage || !studentId || selectedCourses.length === 0}
              className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : isPolling ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  {isAlreadyEnrolled ? "Update Enrollment" : "Complete Enrollment"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnrollmentModal;
