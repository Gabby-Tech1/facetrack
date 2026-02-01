/**
 * Face Detection Service using face-api.js
 * Handles face detection, validation, and quality assessment for attendance marking.
 * 
 * Note: This service only handles DETECTION and VALIDATION.
 * Actual face matching/recognition is done by the backend Python microservice.
 */

import * as faceapi from 'face-api.js';

// Validation result returned by face detection
export interface FaceValidationResult {
    isValid: boolean;
    faceDetected: boolean;
    faceCount: number;
    faceCentered: boolean;
    faceSize: 'too_small' | 'ok' | 'too_large';
    confidence: number;
    boundingBox?: { x: number; y: number; width: number; height: number };
    landmarks?: faceapi.FaceLandmarks68;
    errorMessage?: string;
}

// Configuration for face validation
export interface FaceValidationConfig {
    minFaceWidth: number;       // Minimum face width in pixels
    maxFaceWidth: number;       // Maximum face width in pixels
    centerTolerance: number;    // How far from center is acceptable (0-1)
    minConfidence: number;      // Minimum confidence for valid face
    targetFrameWidth: number;   // Expected frame width for calculations
    targetFrameHeight: number;  // Expected frame height for calculations
}

const DEFAULT_CONFIG: FaceValidationConfig = {
    minFaceWidth: 80,
    maxFaceWidth: 350,
    centerTolerance: 0.25,
    minConfidence: 0.7,
    targetFrameWidth: 640,
    targetFrameHeight: 480,
};

class FaceDetectionService {
    private modelsLoaded = false;
    private modelsLoading = false;
    private loadError: string | null = null;
    private config: FaceValidationConfig;

    constructor(config: Partial<FaceValidationConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Load face-api.js models from public directory
     * Should be called once during app initialization
     */
    async loadModels(): Promise<void> {
        if (this.modelsLoaded) {
            return;
        }

        if (this.modelsLoading) {
            // Wait for existing load to complete
            while (this.modelsLoading) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return;
        }

        this.modelsLoading = true;
        this.loadError = null;

        try {
            const MODEL_URL = '/models';

            console.log('[FaceDetection] Loading models from:', MODEL_URL);

            // Load SSD MobileNet for face detection (more accurate)
            await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
            console.log('[FaceDetection] SSD MobileNet model loaded');

            // Load face landmarks model for face positioning
            await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
            console.log('[FaceDetection] Face landmarks model loaded');

            // Also load tiny face detector as fallback (faster, less accurate)
            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
            console.log('[FaceDetection] Tiny face detector model loaded');

            this.modelsLoaded = true;
            console.log('[FaceDetection] All models loaded successfully');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error loading models';
            this.loadError = message;
            console.error('[FaceDetection] Failed to load models:', message);
            throw error;
        } finally {
            this.modelsLoading = false;
        }
    }

    /**
     * Check if models are loaded
     */
    isReady(): boolean {
        return this.modelsLoaded;
    }

    /**
     * Check if models are currently loading
     */
    isLoading(): boolean {
        return this.modelsLoading;
    }

    /**
     * Get any load error that occurred
     */
    getLoadError(): string | null {
        return this.loadError;
    }

    /**
     * Detect a single face in an image or video element
     * Returns validation result with face quality assessment
     */
    async detectFace(
        input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
    ): Promise<FaceValidationResult> {
        if (!this.modelsLoaded) {
            return {
                isValid: false,
                faceDetected: false,
                faceCount: 0,
                faceCentered: false,
                faceSize: 'ok',
                confidence: 0,
                errorMessage: 'Face detection models not loaded',
            };
        }

        try {
            // Detect all faces with landmarks
            const detections = await faceapi
                .detectAllFaces(input, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
                .withFaceLandmarks();

            if (detections.length === 0) {
                return {
                    isValid: false,
                    faceDetected: false,
                    faceCount: 0,
                    faceCentered: false,
                    faceSize: 'ok',
                    confidence: 0,
                    errorMessage: 'No face detected',
                };
            }

            if (detections.length > 1) {
                return {
                    isValid: false,
                    faceDetected: true,
                    faceCount: detections.length,
                    faceCentered: false,
                    faceSize: 'ok',
                    confidence: 0,
                    errorMessage: 'Multiple faces detected. Please ensure only one face is visible.',
                };
            }

            // Single face detected - validate quality
            const detection = detections[0];
            return this.validateFaceQuality(detection, input);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Face detection failed';
            console.error('[FaceDetection] Detection error:', message);
            return {
                isValid: false,
                faceDetected: false,
                faceCount: 0,
                faceCentered: false,
                faceSize: 'ok',
                confidence: 0,
                errorMessage: message,
            };
        }
    }

    /**
     * Validate face quality (size, position, confidence)
     */
    private validateFaceQuality(
        detection: faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>,
        input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
    ): FaceValidationResult {
        const box = detection.detection.box;
        const confidence = detection.detection.score;

        // Get input dimensions
        const inputWidth = 'videoWidth' in input ? input.videoWidth : input.width;
        const inputHeight = 'videoHeight' in input ? input.videoHeight : input.height;

        // Calculate face center
        const faceCenterX = box.x + box.width / 2;
        const faceCenterY = box.y + box.height / 2;

        // Calculate frame center
        const frameCenterX = inputWidth / 2;
        const frameCenterY = inputHeight / 2;

        // Check if face is centered (within tolerance)
        const xOffset = Math.abs(faceCenterX - frameCenterX) / inputWidth;
        const yOffset = Math.abs(faceCenterY - frameCenterY) / inputHeight;
        const faceCentered = xOffset <= this.config.centerTolerance && yOffset <= this.config.centerTolerance;

        // Check face size
        let faceSize: 'too_small' | 'ok' | 'too_large' = 'ok';
        const scaledMinWidth = (this.config.minFaceWidth / this.config.targetFrameWidth) * inputWidth;
        const scaledMaxWidth = (this.config.maxFaceWidth / this.config.targetFrameWidth) * inputWidth;

        if (box.width < scaledMinWidth) {
            faceSize = 'too_small';
        } else if (box.width > scaledMaxWidth) {
            faceSize = 'too_large';
        }

        // Check confidence
        const confidenceOk = confidence >= this.config.minConfidence;

        // Overall validity
        const isValid = faceCentered && faceSize === 'ok' && confidenceOk;

        // Generate error message
        let errorMessage: string | undefined;
        if (!confidenceOk) {
            errorMessage = 'Low detection confidence. Improve lighting.';
        } else if (!faceCentered) {
            errorMessage = 'Center your face in the frame';
        } else if (faceSize === 'too_small') {
            errorMessage = 'Move closer to the camera';
        } else if (faceSize === 'too_large') {
            errorMessage = 'Move away from the camera';
        }

        return {
            isValid,
            faceDetected: true,
            faceCount: 1,
            faceCentered,
            faceSize,
            confidence,
            boundingBox: {
                x: box.x,
                y: box.y,
                width: box.width,
                height: box.height,
            },
            landmarks: detection.landmarks,
            errorMessage,
        };
    }

    /**
     * Draw face detection overlay on a canvas
     */
    drawFaceOverlay(
        canvas: HTMLCanvasElement,
        result: FaceValidationResult,
        inputDimensions: { width: number; height: number }
    ): void {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Scale factors
        const scaleX = canvas.width / inputDimensions.width;
        const scaleY = canvas.height / inputDimensions.height;

        if (result.boundingBox) {
            const { x, y, width, height } = result.boundingBox;

            // Set color based on validity
            ctx.strokeStyle = result.isValid ? '#22c55e' : result.faceDetected ? '#f59e0b' : '#ef4444';
            ctx.lineWidth = 3;

            // Draw bounding box with rounded corners
            const scaledX = x * scaleX;
            const scaledY = y * scaleY;
            const scaledWidth = width * scaleX;
            const scaledHeight = height * scaleY;
            const radius = 10;

            ctx.beginPath();
            ctx.moveTo(scaledX + radius, scaledY);
            ctx.lineTo(scaledX + scaledWidth - radius, scaledY);
            ctx.quadraticCurveTo(scaledX + scaledWidth, scaledY, scaledX + scaledWidth, scaledY + radius);
            ctx.lineTo(scaledX + scaledWidth, scaledY + scaledHeight - radius);
            ctx.quadraticCurveTo(scaledX + scaledWidth, scaledY + scaledHeight, scaledX + scaledWidth - radius, scaledY + scaledHeight);
            ctx.lineTo(scaledX + radius, scaledY + scaledHeight);
            ctx.quadraticCurveTo(scaledX, scaledY + scaledHeight, scaledX, scaledY + scaledHeight - radius);
            ctx.lineTo(scaledX, scaledY + radius);
            ctx.quadraticCurveTo(scaledX, scaledY, scaledX + radius, scaledY);
            ctx.closePath();
            ctx.stroke();

            // Draw corner accents
            const cornerLength = 20;
            ctx.lineWidth = 4;

            // Top-left corner
            ctx.beginPath();
            ctx.moveTo(scaledX, scaledY + cornerLength);
            ctx.lineTo(scaledX, scaledY);
            ctx.lineTo(scaledX + cornerLength, scaledY);
            ctx.stroke();

            // Top-right corner
            ctx.beginPath();
            ctx.moveTo(scaledX + scaledWidth - cornerLength, scaledY);
            ctx.lineTo(scaledX + scaledWidth, scaledY);
            ctx.lineTo(scaledX + scaledWidth, scaledY + cornerLength);
            ctx.stroke();

            // Bottom-left corner
            ctx.beginPath();
            ctx.moveTo(scaledX, scaledY + scaledHeight - cornerLength);
            ctx.lineTo(scaledX, scaledY + scaledHeight);
            ctx.lineTo(scaledX + cornerLength, scaledY + scaledHeight);
            ctx.stroke();

            // Bottom-right corner
            ctx.beginPath();
            ctx.moveTo(scaledX + scaledWidth - cornerLength, scaledY + scaledHeight);
            ctx.lineTo(scaledX + scaledWidth, scaledY + scaledHeight);
            ctx.lineTo(scaledX + scaledWidth, scaledY + scaledHeight - cornerLength);
            ctx.stroke();
        }
    }

    /**
     * Get current configuration
     */
    getConfig(): FaceValidationConfig {
        return { ...this.config };
    }

    /**
     * Update configuration
     */
    updateConfig(config: Partial<FaceValidationConfig>): void {
        this.config = { ...this.config, ...config };
    }
}

// Export singleton instance
export const faceDetectionService = new FaceDetectionService();

// Export class for testing/custom instances
export { FaceDetectionService };
