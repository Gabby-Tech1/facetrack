import { useState, useCallback, useRef } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ScanFace, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface FaceScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerify: () => Promise<void>;
    title?: string;
    description?: string;
}

export default function FaceScannerModal({
    isOpen,
    onClose,
    onVerify,
    title = "Face Verification",
    description = "Please position your face within the frame to verify your identity."
}: FaceScannerModalProps) {
    const webcamRef = useRef<Webcam>(null);
    const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
    const [progress, setProgress] = useState(0);

    const startScanning = useCallback(async () => {
        setStatus('scanning');
        setProgress(0);

        // Simulate scanning progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 2;
            });
        }, 40);

        // Simulate verification delay (2 seconds)
        setTimeout(async () => {
            clearInterval(interval);
            try {
                await onVerify();
                setStatus('success');
                toast.success("Identity verified successfully!");

                // Close modal after success
                setTimeout(() => {
                    onClose();
                    // Reset state after closing
                    setTimeout(() => {
                        setStatus('idle');
                        setProgress(0);
                    }, 300);
                }, 1500);
            } catch (error) {
                setStatus('error');
                console.error(error);
            }
        }, 2000);
    }, [onVerify, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
                {/* Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <ScanFace className="w-5 h-5 text-blue-600" />
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col items-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
                        {description}
                    </p>

                    <div className="relative w-full aspect-square max-w-[320px] bg-slate-950 rounded-2xl overflow-hidden shadow-inner mb-6 ring-4 ring-slate-100 dark:ring-slate-800">
                        {/* Camera Feed */}
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
                        />

                        {/* Overlays */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            {/* Face Frame */}
                            <div className={`w-[70%] h-[70%] border-2 rounded-[30%] transition-colors duration-300 ${status === 'success' ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' :
                                status === 'error' ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' :
                                    status === 'scanning' ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' :
                                        'border-white/50'
                                }`}>
                                {/* Scanning Scanline */}
                                {status === 'scanning' && (
                                    <motion.div
                                        initial={{ top: '0%', opacity: 0 }}
                                        animate={{ top: '100%', opacity: [0, 1, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                        className="absolute w-full h-[2px] bg-blue-500 shadow-[0_0_10px_#3b82f6]"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Status Icons */}
                        <AnimatePresence>
                            {status === 'success' && (
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
                                >
                                    <div className="bg-green-500 text-white p-4 rounded-full shadow-lg">
                                        <CheckCircle2 size={48} />
                                    </div>
                                </motion.div>
                            )}
                            {status === 'error' && (
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
                                >
                                    <div className="bg-red-500 text-white p-4 rounded-full shadow-lg">
                                        <AlertCircle size={48} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Controls */}
                    <div className="w-full flex flex-col gap-3">
                        {status === 'idle' || status === 'error' ? (
                            <button
                                onClick={startScanning}
                                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-medium transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                            >
                                <ScanFace size={20} />
                                {status === 'error' ? 'Try Again' : 'Start Verification'}
                            </button>
                        ) : (
                            <div className="w-full space-y-2">
                                <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                                    <span>{status === 'scanning' ? 'Scanning...' : 'Verified'}</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full ${status === 'success' ? 'bg-green-500' : 'bg-blue-600'}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            className="py-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
