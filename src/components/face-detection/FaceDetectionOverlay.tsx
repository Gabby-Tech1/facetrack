/**
 * Face Detection Overlay Component
 * Renders real-time face detection bounding box and landmarks over video feed.
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useFaceDetection } from '../../contexts/FaceDetectionContext';
import type { FaceValidationResult } from '../../services/faceDetection.service';

interface FaceDetectionOverlayProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    onFaceValidation: (result: FaceValidationResult) => void;
    onAutoCapture?: () => void;
    autoCaptureDelay?: number; // ms to wait with valid face before auto-capture
    enabled?: boolean;
    showOverlay?: boolean;
}

export default function FaceDetectionOverlay({
    videoRef,
    onFaceValidation,
    onAutoCapture,
    autoCaptureDelay = 1500,
    enabled = true,
    showOverlay = true,
}: FaceDetectionOverlayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const validFaceStartTime = useRef<number | null>(null);
    const hasAutoCaputred = useRef(false);

    const { modelsLoaded, detectFace, drawFaceOverlay } = useFaceDetection();
    const [, setFrameCount] = useState(0); // Force re-render for overlay updates

    const runDetection = useCallback(async () => {
        if (!enabled || !modelsLoaded || !videoRef.current || !canvasRef.current) {
            animationRef.current = requestAnimationFrame(runDetection);
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Ensure video is playing and has dimensions
        if (video.paused || video.ended || video.videoWidth === 0) {
            animationRef.current = requestAnimationFrame(runDetection);
            return;
        }

        // Match canvas size to video
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }

        try {
            // Run face detection
            const result = await detectFace(video);
            onFaceValidation(result);

            // Draw overlay if enabled
            if (showOverlay) {
                drawFaceOverlay(canvas, result, {
                    width: video.videoWidth,
                    height: video.videoHeight,
                });
            }

            // Handle auto-capture
            if (onAutoCapture && !hasAutoCaputred.current) {
                if (result.isValid) {
                    if (validFaceStartTime.current === null) {
                        validFaceStartTime.current = Date.now();
                    } else if (Date.now() - validFaceStartTime.current >= autoCaptureDelay) {
                        hasAutoCaputred.current = true;
                        onAutoCapture();
                    }
                } else {
                    validFaceStartTime.current = null;
                }
            }

            setFrameCount(prev => prev + 1);
        } catch (error) {
            console.error('[FaceDetectionOverlay] Detection error:', error);
        }

        // Run at ~15 FPS for performance
        setTimeout(() => {
            animationRef.current = requestAnimationFrame(runDetection);
        }, 66); // ~15 FPS
    }, [enabled, modelsLoaded, videoRef, detectFace, drawFaceOverlay, showOverlay, onFaceValidation, onAutoCapture, autoCaptureDelay]);

    // Reset auto-capture when disabled
    useEffect(() => {
        if (!enabled) {
            hasAutoCaputred.current = false;
            validFaceStartTime.current = null;
        }
    }, [enabled]);

    // Start/stop detection loop
    useEffect(() => {
        if (enabled && modelsLoaded) {
            hasAutoCaputred.current = false;
            validFaceStartTime.current = null;
            animationRef.current = requestAnimationFrame(runDetection);
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        };
    }, [enabled, modelsLoaded, runDetection]);

    // Clear canvas when detection is disabled
    useEffect(() => {
        if (!enabled && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        }
    }, [enabled]);

    if (!showOverlay) {
        return null;
    }

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ objectFit: 'cover' }}
        />
    );
}
