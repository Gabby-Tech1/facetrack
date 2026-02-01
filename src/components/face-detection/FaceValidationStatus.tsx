/**
 * Face Validation Status Component
 * Displays real-time feedback about face detection quality.
 */

import { CheckCircle, XCircle, AlertCircle, Camera, Loader2 } from 'lucide-react';
import type { FaceValidationResult } from '../../services/faceDetection.service';

interface FaceValidationStatusProps {
    result: FaceValidationResult | null;
    modelsLoading?: boolean;
    modelsLoaded?: boolean;
    className?: string;
    showDetails?: boolean;
    autoCapturing?: boolean;
    autoCaptureProgress?: number; // 0-100
}

export default function FaceValidationStatus({
    result,
    modelsLoading = false,
    modelsLoaded = true,
    className = '',
    showDetails = false,
    autoCapturing = false,
    autoCaptureProgress = 0,
}: FaceValidationStatusProps) {
    // Models loading state
    if (modelsLoading) {
        return (
            <div className={`flex items-center gap-2 text-blue-600 dark:text-blue-400 ${className}`}>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">Loading face detection...</span>
            </div>
        );
    }

    // Models failed to load
    if (!modelsLoaded) {
        return (
            <div className={`flex items-center gap-2 text-amber-600 dark:text-amber-400 ${className}`}>
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Face detection unavailable</span>
            </div>
        );
    }

    // No result yet
    if (!result) {
        return (
            <div className={`flex items-center gap-2 text-slate-500 dark:text-slate-400 ${className}`}>
                <Camera className="w-4 h-4" />
                <span className="text-sm font-medium">Waiting for camera...</span>
            </div>
        );
    }

    // Auto-capturing state
    if (autoCapturing && result.isValid) {
        return (
            <div className={`space-y-2 ${className}`}>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Hold still - capturing...</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div
                        className="bg-emerald-500 h-full transition-all duration-100 ease-linear"
                        style={{ width: `${autoCaptureProgress}%` }}
                    />
                </div>
            </div>
        );
    }

    // Valid face detected
    if (result.isValid) {
        return (
            <div className={`space-y-1 ${className}`}>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Face detected - ready to capture!</span>
                </div>
                {showDetails && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                        Confidence: {(result.confidence * 100).toFixed(0)}%
                    </div>
                )}
            </div>
        );
    }

    // Face detected but not valid
    if (result.faceDetected) {
        // Multiple faces
        if (result.faceCount > 1) {
            return (
                <div className={`flex items-center gap-2 text-amber-600 dark:text-amber-400 ${className}`}>
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                        Multiple faces detected ({result.faceCount}). Please ensure only one face is visible.
                    </span>
                </div>
            );
        }

        // Face size issues
        if (result.faceSize === 'too_small') {
            return (
                <div className={`flex items-center gap-2 text-amber-600 dark:text-amber-400 ${className}`}>
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Move closer to the camera</span>
                </div>
            );
        }

        if (result.faceSize === 'too_large') {
            return (
                <div className={`flex items-center gap-2 text-amber-600 dark:text-amber-400 ${className}`}>
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Move away from the camera</span>
                </div>
            );
        }

        // Not centered
        if (!result.faceCentered) {
            return (
                <div className={`flex items-center gap-2 text-amber-600 dark:text-amber-400 ${className}`}>
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Center your face in the frame</span>
                </div>
            );
        }

        // Low confidence
        if (result.confidence < 0.7) {
            return (
                <div className={`flex items-center gap-2 text-amber-600 dark:text-amber-400 ${className}`}>
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Improve lighting for better detection</span>
                </div>
            );
        }

        // Generic error
        return (
            <div className={`flex items-center gap-2 text-amber-600 dark:text-amber-400 ${className}`}>
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{result.errorMessage || 'Adjust your position'}</span>
            </div>
        );
    }

    // No face detected
    return (
        <div className={`flex items-center gap-2 text-red-600 dark:text-red-400 ${className}`}>
            <XCircle className="w-4 h-4" />
            <span className="text-sm font-medium">No face detected</span>
        </div>
    );
}
