import { useState, useRef, useCallback, useEffect } from "react";
import { ScrollArea } from "@radix-ui/themes";
import {
    Camera,
    CameraOff,
    RefreshCw,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
    Upload,
    ArrowLeft,
    WifiOff,
    Clock,
    MapPin,
    Users,
    BookOpen,
} from "lucide-react";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/dashboard/Header";
import { toast } from "sonner";
import { useAuthStore } from "../../store/auth.store";
import { attendanceApi } from "../../api/attendance.api";
import { sessionsApi } from "../../api/sessions.api";
import { SessionMode } from "../../types";
import type { Session } from "../../types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFaceDetection } from "../../contexts/FaceDetectionContext";
import { FaceDetectionOverlay, FaceValidationStatus } from "../../components/face-detection";
import type { FaceValidationResult } from "../../services/faceDetection.service";

type AttendanceState = "idle" | "capturing" | "processing" | "success" | "error";

const MarkAttendance: React.FC = () => {
    useAuthStore(); // For auth context
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionIdFromUrl = searchParams.get("sessionId");

    // Camera state
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [cameraEnabled, setCameraEnabled] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

    // Session state
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [isLoadingSessions, setIsLoadingSessions] = useState(true);

    // Attendance state
    const [attendanceState, setAttendanceState] = useState<AttendanceState>("idle");
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [attendanceResult, setAttendanceResult] = useState<{
        success: boolean;
        message: string;
        score?: number;
        status?: string;
    } | null>(null);

    // File upload alternative
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Face detection state
    const { modelsLoaded, modelsLoading, loadModels } = useFaceDetection();
    const [faceValidation, setFaceValidation] = useState<FaceValidationResult | null>(null);
    const [autoCaptureProgress, setAutoCaptureProgress] = useState(0);
    const autoCaptureStartTime = useRef<number | null>(null);
    const AUTO_CAPTURE_DELAY = 1500; // 1.5 seconds of valid face to auto-capture

    // Fetch available open sessions
    const fetchOpenSessions = async () => {
        try {
            setIsLoadingSessions(true);

            // Use the dedicated endpoint that returns open sessions for the user's role
            const response = await sessionsApi.getAvailableSessions();
            const openSessions = response.sessions || [];

            setSessions(openSessions);

            // Auto-select session if sessionId is in URL
            if (sessionIdFromUrl) {
                const session = openSessions.find(s => s.id === sessionIdFromUrl);
                if (session) {
                    setSelectedSession(session);
                }
            } else if (openSessions.length === 1) {
                // Auto-select if only one session
                setSelectedSession(openSessions[0]);
            }
        } catch (error) {
            console.error("Failed to fetch sessions:", error);
            toast.error("Failed to load available sessions");
        } finally {
            setIsLoadingSessions(false);
        }
    };

    useEffect(() => {
        fetchOpenSessions();

        return () => {
            // Cleanup camera on unmount
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Load face detection models when camera is started
    useEffect(() => {
        if (cameraEnabled && !modelsLoaded && !modelsLoading) {
            loadModels();
        }
    }, [cameraEnabled, modelsLoaded, modelsLoading, loadModels]);

    // Start camera
    const startCamera = useCallback(async () => {
        try {
            setCameraError(null);
            const constraints: MediaStreamConstraints = {
                video: {
                    facingMode,
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                },
                audio: false,
            };

            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.play();
            }

            setCameraEnabled(true);
        } catch (error: unknown) {
            const err = error as Error;
            console.error("Camera error:", err);
            setCameraError(err.name === "NotAllowedError"
                ? "Camera access denied. Please allow camera access in your browser settings."
                : "Failed to access camera. Please ensure your device has a working camera.");
            setCameraEnabled(false);
        }
    }, [facingMode]);

    // Stop camera
    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraEnabled(false);
        setCapturedImage(null);
    }, [stream]);

    // Switch camera (front/back)
    const switchCamera = useCallback(() => {
        stopCamera();
        setFacingMode(prev => prev === "user" ? "environment" : "user");
    }, [stopCamera]);

    // Effect to restart camera when facing mode changes
    useEffect(() => {
        if (cameraEnabled && !stream) {
            startCamera();
        }
    }, [facingMode]);

    // Update video source when stream becomes available
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream, cameraEnabled]);

    // Capture photo
    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        setAttendanceState("capturing");

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the video frame to canvas (mirror for front camera)
        if (facingMode === "user") {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
        }
        context.drawImage(video, 0, 0);

        // Get image as data URL
        const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedImage(imageDataUrl);

        // Stop camera after capture
        stopCamera();
        setAttendanceState("idle");

        // Reset face detection state
        setFaceValidation(null);
        setAutoCaptureProgress(0);
        autoCaptureStartTime.current = null;
    }, [facingMode, stopCamera]);

    // Handle face validation updates from the overlay
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

    // Handle auto-capture when face is valid for long enough
    const handleAutoCapture = useCallback(() => {
        if (cameraEnabled && !capturedImage && faceValidation?.isValid) {
            capturePhoto();
            toast.success("Photo captured automatically!");
        }
    }, [cameraEnabled, capturedImage, faceValidation?.isValid, capturePhoto]);

    // Convert data URL to File
    const dataURLtoFile = (dataUrl: string, filename: string): File => {
        const arr = dataUrl.split(",");
        const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    // Handle file upload
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
            toast.error("Please upload a JPEG or PNG image");
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setCapturedImage(e.target?.result as string);
            stopCamera();
        };
        reader.readAsDataURL(file);
    };

    // Submit attendance
    const submitAttendance = async () => {
        if (!selectedSession || !capturedImage) {
            toast.error("Please select a session and capture your photo");
            return;
        }

        try {
            setAttendanceState("processing");
            setAttendanceResult(null);

            // Convert captured image to File
            const imageFile = dataURLtoFile(capturedImage, `attendance_${Date.now()}.jpg`);

            // Mark attendance
            const response = await attendanceApi.markAttendance(
                selectedSession.id,
                imageFile,
                "mobile" // Source: mobile for web app
            );

            setAttendanceState("success");
            setAttendanceResult({
                success: true,
                message: `Attendance marked successfully! You are ${response.attendance?.status || "recorded"}.`,
                score: response.score,
                status: response.attendance?.status,
            });

            toast.success("Attendance marked successfully!");

        } catch (error: unknown) {
            console.error("Attendance error:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to mark attendance";

            setAttendanceState("error");
            setAttendanceResult({
                success: false,
                message: errorMessage,
            });

            toast.error(errorMessage);
        }
    };

    // Reset to try again
    const resetAttendance = () => {
        setCapturedImage(null);
        setAttendanceState("idle");
        setAttendanceResult(null);
        setFaceValidation(null);
        setAutoCaptureProgress(0);
        autoCaptureStartTime.current = null;
    };

    // Get status badge styling
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PRESENT":
            case "CHECKED_IN":
                return "bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400";
            case "LATE":
                return "bg-amber-100 dark:bg-amber-600/20 text-amber-700 dark:text-amber-400";
            case "ABSENT":
                return "bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-400";
            default:
                return "bg-slate-100 dark:bg-slate-600/20 text-slate-700 dark:text-slate-400";
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
            <Sidebar />
            <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
                <Header />
                <ScrollArea className="flex-1 overflow-y-auto">
                    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
                        {/* Back button and title */}
                        <div className="flex items-center gap-4 mb-6">
                            <button
                                onClick={() => navigate("/attendance")}
                                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Mark Attendance
                                </h1>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">
                                    Use face recognition to mark your attendance
                                </p>
                            </div>
                        </div>

                        {/* Session Selection */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 mb-6">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                                Select Session
                            </h2>

                            {isLoadingSessions ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                </div>
                            ) : sessions.length === 0 ? (
                                <div className="text-center py-8">
                                    <WifiOff className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                    <p className="text-slate-600 dark:text-slate-400">
                                        No open sessions available
                                    </p>
                                    <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
                                        Wait for your lecturer to start a session
                                    </p>
                                    <button
                                        onClick={fetchOpenSessions}
                                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Refresh
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {sessions.map((session) => (
                                        <button
                                            key={session.id}
                                            onClick={() => setSelectedSession(session)}
                                            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedSession?.id === session.id
                                                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                                : "border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                                        {session.name}
                                                    </h3>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                        {session.course?.code} - {session.course?.title || "N/A"}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-500">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(session.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                            {" - "}
                                                            {new Date(session.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                        </span>
                                                        {session.location && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" />
                                                                {session.location}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {/* Threshold Info */}
                                                    <div className="flex items-center gap-2 mt-2 text-xs">
                                                        <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                                                            Late: {session.lateThreshold || 15}m
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
                                                            Absent: {session.absentThreshold || 30}m
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${session.mode === SessionMode.CHECK_IN
                                                        ? "bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400"
                                                        : "bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400"
                                                        }`}>
                                                        {session.mode === SessionMode.CHECK_IN ? "Check In" : "Check Out"}
                                                    </span>
                                                    {selectedSession?.id === session.id && (
                                                        <CheckCircle className="w-5 h-5 text-blue-600" />
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Camera / Capture Section */}
                        {selectedSession && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 mb-6">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Camera className="w-5 h-5 text-blue-600" />
                                    Capture Your Face
                                </h2>

                                {/* Result Display */}
                                {attendanceResult && (
                                    <div className={`mb-6 p-4 rounded-xl ${attendanceResult.success
                                        ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                                        : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                                        }`}>
                                        <div className="flex items-start gap-3">
                                            {attendanceResult.success ? (
                                                <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                                            ) : (
                                                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                                            )}
                                            <div>
                                                <p className={`font-medium ${attendanceResult.success
                                                    ? "text-emerald-800 dark:text-emerald-400"
                                                    : "text-red-800 dark:text-red-400"
                                                    }`}>
                                                    {attendanceResult.message}
                                                </p>
                                                {attendanceResult.score && (
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                        Confidence: {(attendanceResult.score * 100).toFixed(1)}%
                                                    </p>
                                                )}
                                                {attendanceResult.status && (
                                                    <span className={`inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(attendanceResult.status)}`}>
                                                        {attendanceResult.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {attendanceResult.success ? (
                                            <button
                                                onClick={() => navigate("/attendance")}
                                                className="mt-4 w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                            >
                                                View Attendance Records
                                            </button>
                                        ) : (
                                            <button
                                                onClick={resetAttendance}
                                                className="mt-4 w-full py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                                            >
                                                Try Again
                                            </button>
                                        )}
                                    </div>
                                )}

                                {!attendanceResult && (
                                    <>
                                        {/* Camera View or Captured Image */}
                                        <div className="relative aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden mb-4">
                                            {capturedImage ? (
                                                <img
                                                    src={capturedImage}
                                                    alt="Captured"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : cameraEnabled ? (
                                                <video
                                                    ref={videoRef}
                                                    autoPlay
                                                    playsInline
                                                    muted
                                                    className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                                    <CameraOff className="w-16 h-16 mb-4" />
                                                    {cameraError ? (
                                                        <p className="text-center px-4 text-sm">{cameraError}</p>
                                                    ) : (
                                                        <p>Camera is off</p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Face Detection Overlay */}
                                            {cameraEnabled && !capturedImage && modelsLoaded && (
                                                <FaceDetectionOverlay
                                                    videoRef={videoRef}
                                                    onFaceValidation={handleFaceValidation}
                                                    onAutoCapture={handleAutoCapture}
                                                    autoCaptureDelay={AUTO_CAPTURE_DELAY}
                                                    enabled={cameraEnabled && !capturedImage}
                                                    showOverlay={true}
                                                />
                                            )}

                                            {/* Face guide overlay (shown when models not loaded) */}
                                            {cameraEnabled && !capturedImage && !modelsLoaded && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <div className="w-48 h-60 border-2 border-dashed border-white/50 rounded-[50%]" />
                                                </div>
                                            )}

                                            {/* Processing overlay */}
                                            {attendanceState === "processing" && (
                                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                                                    <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
                                                    <p className="text-white font-medium">Processing...</p>
                                                    <p className="text-white/70 text-sm">Verifying your identity</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Hidden canvas for capture */}
                                        <canvas ref={canvasRef} className="hidden" />

                                        {/* Hidden file input */}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                        {/* Face Validation Status */}
                                        {cameraEnabled && !capturedImage && (
                                            <div className="mb-4">
                                                <FaceValidationStatus
                                                    result={faceValidation}
                                                    modelsLoading={modelsLoading}
                                                    modelsLoaded={modelsLoaded}
                                                    autoCapturing={faceValidation?.isValid && autoCaptureProgress > 0}
                                                    autoCaptureProgress={autoCaptureProgress}
                                                />
                                            </div>
                                        )}

                                        {/* Camera Controls */}
                                        <div className="flex flex-wrap gap-3 justify-center">
                                            {!capturedImage ? (
                                                <>
                                                    {!cameraEnabled ? (
                                                        <button
                                                            onClick={startCamera}
                                                            className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <Camera className="w-5 h-5" />
                                                            Start Camera
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={capturePhoto}
                                                                className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                                                            >
                                                                <Camera className="w-5 h-5" />
                                                                Capture Photo
                                                            </button>
                                                            <button
                                                                onClick={switchCamera}
                                                                className="px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                                                title="Switch Camera"
                                                            >
                                                                <RefreshCw className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={stopCamera}
                                                                className="px-4 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                                                title="Stop Camera"
                                                            >
                                                                <CameraOff className="w-5 h-5" />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
                                                    >
                                                        <Upload className="w-5 h-5" />
                                                        Upload Photo
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={resetAttendance}
                                                        className="flex-1 sm:flex-none px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <RefreshCw className="w-5 h-5" />
                                                        Retake
                                                    </button>
                                                    <button
                                                        onClick={submitAttendance}
                                                        disabled={attendanceState === "processing"}
                                                        className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {attendanceState === "processing" ? (
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                        ) : (
                                                            <CheckCircle className="w-5 h-5" />
                                                        )}
                                                        Submit Attendance
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        {/* Instructions */}
                                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                            <h3 className="font-medium text-blue-800 dark:text-blue-400 flex items-center gap-2 mb-2">
                                                <AlertCircle className="w-4 h-4" />
                                                Tips for better recognition
                                            </h3>
                                            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                                <li>• Ensure good lighting on your face</li>
                                                <li>• Remove sunglasses or face coverings</li>
                                                <li>• Position your face within the guide oval</li>
                                                <li>• Keep your face centered and look at the camera</li>
                                            </ul>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Session Info Card */}
                        {selectedSession && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-600" />
                                    Session Details
                                </h2>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-500">Session</p>
                                        <p className="font-medium text-slate-900 dark:text-white">{selectedSession.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-500">Course</p>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {selectedSession.course?.code || "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-500">Mode</p>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {selectedSession.mode === SessionMode.CHECK_IN ? "Check In" : "Check Out"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-500">Late After</p>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {selectedSession.lateThreshold} mins
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-500">Time</p>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {new Date(selectedSession.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            {" - "}
                                            {new Date(selectedSession.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-500">Location</p>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {selectedSession.location || "Not specified"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};

export default MarkAttendance;
