/**
 * Face Detection Context
 * Provides face detection service access and model loading state throughout the app.
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { faceDetectionService, type FaceValidationResult } from '../services/faceDetection.service';

interface FaceDetectionContextType {
    modelsLoaded: boolean;
    modelsLoading: boolean;
    loadError: string | null;
    loadModels: () => Promise<void>;
    detectFace: (input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement) => Promise<FaceValidationResult>;
    drawFaceOverlay: (
        canvas: HTMLCanvasElement,
        result: FaceValidationResult,
        inputDimensions: { width: number; height: number }
    ) => void;
}

const FaceDetectionContext = createContext<FaceDetectionContextType | null>(null);

interface FaceDetectionProviderProps {
    children: ReactNode;
    autoLoad?: boolean;
}

export function FaceDetectionProvider({ children, autoLoad = true }: FaceDetectionProviderProps) {
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [modelsLoading, setModelsLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const loadModels = useCallback(async () => {
        if (modelsLoaded || modelsLoading) return;

        setModelsLoading(true);
        setLoadError(null);

        try {
            await faceDetectionService.loadModels();
            setModelsLoaded(true);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load face detection models';
            setLoadError(message);
            console.error('[FaceDetectionContext] Load error:', message);
        } finally {
            setModelsLoading(false);
        }
    }, [modelsLoaded, modelsLoading]);

    const detectFace = useCallback(
        async (input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement): Promise<FaceValidationResult> => {
            return faceDetectionService.detectFace(input);
        },
        []
    );

    const drawFaceOverlay = useCallback(
        (
            canvas: HTMLCanvasElement,
            result: FaceValidationResult,
            inputDimensions: { width: number; height: number }
        ) => {
            faceDetectionService.drawFaceOverlay(canvas, result, inputDimensions);
        },
        []
    );

    // Auto-load models when provider mounts
    useEffect(() => {
        if (autoLoad) {
            loadModels();
        }
    }, [autoLoad, loadModels]);

    const value: FaceDetectionContextType = {
        modelsLoaded,
        modelsLoading,
        loadError,
        loadModels,
        detectFace,
        drawFaceOverlay,
    };

    return (
        <FaceDetectionContext.Provider value={value}>
            {children}
        </FaceDetectionContext.Provider>
    );
}

export function useFaceDetection(): FaceDetectionContextType {
    const context = useContext(FaceDetectionContext);
    if (!context) {
        throw new Error('useFaceDetection must be used within a FaceDetectionProvider');
    }
    return context;
}

export { FaceDetectionContext };
