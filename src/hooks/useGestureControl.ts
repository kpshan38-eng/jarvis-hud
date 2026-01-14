import { useCallback, useEffect, useRef, useState } from "react";

interface GestureState {
  isActive: boolean;
  gesture: "none" | "swipe-left" | "swipe-right" | "swipe-up" | "swipe-down" | "pinch" | "spread" | "fist" | "open-palm";
  confidence: number;
  handPosition: { x: number; y: number } | null;
}

interface UseGestureControlProps {
  enabled: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: () => void;
  onSpread?: () => void;
  onFist?: () => void;
  onOpenPalm?: () => void;
}

export const useGestureControl = ({
  enabled,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onSpread,
  onFist,
  onOpenPalm,
}: UseGestureControlProps) => {
  const [gestureState, setGestureState] = useState<GestureState>({
    isActive: false,
    gesture: "none",
    confidence: 0,
    handPosition: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const lastPositionRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastPinchDistanceRef = useRef<number | null>(null);
  const gestureTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const calculateDistance = (p1: any, p2: any) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const detectGesture = useCallback((landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) return;

    const hand = landmarks[0];
    const wrist = hand[0];
    const thumbTip = hand[4];
    const indexTip = hand[8];
    const middleTip = hand[12];
    const ringTip = hand[16];
    const pinkyTip = hand[20];

    // Current palm center
    const palmCenter = {
      x: (wrist.x + hand[5].x + hand[9].x + hand[13].x + hand[17].x) / 5,
      y: (wrist.y + hand[5].y + hand[9].y + hand[13].y + hand[17].y) / 5,
    };

    // Check for pinch gesture (thumb and index close)
    const pinchDistance = calculateDistance(thumbTip, indexTip);
    
    if (lastPinchDistanceRef.current !== null) {
      const distanceChange = pinchDistance - lastPinchDistanceRef.current;
      
      if (distanceChange < -0.05 && pinchDistance < 0.1) {
        setGestureState(prev => ({ ...prev, gesture: "pinch", confidence: 0.8 }));
        onPinch?.();
        if (gestureTimeoutRef.current) clearTimeout(gestureTimeoutRef.current);
        gestureTimeoutRef.current = setTimeout(() => {
          setGestureState(prev => ({ ...prev, gesture: "none" }));
        }, 500);
      } else if (distanceChange > 0.05 && pinchDistance > 0.15) {
        setGestureState(prev => ({ ...prev, gesture: "spread", confidence: 0.8 }));
        onSpread?.();
        if (gestureTimeoutRef.current) clearTimeout(gestureTimeoutRef.current);
        gestureTimeoutRef.current = setTimeout(() => {
          setGestureState(prev => ({ ...prev, gesture: "none" }));
        }, 500);
      }
    }
    lastPinchDistanceRef.current = pinchDistance;

    // Check for fist (all fingers curled)
    const fingerDistances = [
      calculateDistance(indexTip, hand[5]),
      calculateDistance(middleTip, hand[9]),
      calculateDistance(ringTip, hand[13]),
      calculateDistance(pinkyTip, hand[17]),
    ];
    const avgFingerDist = fingerDistances.reduce((a, b) => a + b, 0) / 4;

    if (avgFingerDist < 0.08) {
      setGestureState(prev => ({ ...prev, gesture: "fist", confidence: 0.9 }));
      onFist?.();
    } else if (avgFingerDist > 0.18) {
      // Open palm
      setGestureState(prev => ({ ...prev, gesture: "open-palm", confidence: 0.85 }));
      onOpenPalm?.();
    }

    // Swipe detection
    const now = Date.now();
    if (lastPositionRef.current && now - lastPositionRef.current.time < 300) {
      const dx = palmCenter.x - lastPositionRef.current.x;
      const dy = palmCenter.y - lastPositionRef.current.y;
      
      const swipeThreshold = 0.15;
      
      if (Math.abs(dx) > swipeThreshold && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
          setGestureState(prev => ({ ...prev, gesture: "swipe-left", confidence: 0.75 }));
          onSwipeLeft?.();
        } else {
          setGestureState(prev => ({ ...prev, gesture: "swipe-right", confidence: 0.75 }));
          onSwipeRight?.();
        }
        lastPositionRef.current = null; // Reset to prevent multiple triggers
        if (gestureTimeoutRef.current) clearTimeout(gestureTimeoutRef.current);
        gestureTimeoutRef.current = setTimeout(() => {
          setGestureState(prev => ({ ...prev, gesture: "none" }));
        }, 500);
      } else if (Math.abs(dy) > swipeThreshold && Math.abs(dy) > Math.abs(dx)) {
        if (dy > 0) {
          setGestureState(prev => ({ ...prev, gesture: "swipe-up", confidence: 0.75 }));
          onSwipeUp?.();
        } else {
          setGestureState(prev => ({ ...prev, gesture: "swipe-down", confidence: 0.75 }));
          onSwipeDown?.();
        }
        lastPositionRef.current = null;
        if (gestureTimeoutRef.current) clearTimeout(gestureTimeoutRef.current);
        gestureTimeoutRef.current = setTimeout(() => {
          setGestureState(prev => ({ ...prev, gesture: "none" }));
        }, 500);
      }
    }

    lastPositionRef.current = { x: palmCenter.x, y: palmCenter.y, time: now };
    setGestureState(prev => ({ 
      ...prev, 
      handPosition: { x: 1 - palmCenter.x, y: palmCenter.y },
      isActive: true 
    }));
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onPinch, onSpread, onFist, onOpenPalm]);

  const startCamera = useCallback(async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Dynamically import MediaPipe
      const { Hands } = await import("@mediapipe/hands");
      const { Camera } = await import("@mediapipe/camera_utils");

      // Create video element
      const video = document.createElement("video");
      video.setAttribute("playsinline", "");
      video.style.display = "none";
      document.body.appendChild(video);
      videoRef.current = video;

      // Create canvas for processing
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      canvas.style.display = "none";
      document.body.appendChild(canvas);
      canvasRef.current = canvas;

      // Initialize MediaPipe Hands
      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      hands.onResults((results: any) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          detectGesture(results.multiHandLandmarks);
        } else {
          setGestureState(prev => ({ 
            ...prev, 
            isActive: false, 
            handPosition: null,
            gesture: "none" 
          }));
        }
      });

      handsRef.current = hands;

      // Start camera
      const camera = new Camera(video, {
        onFrame: async () => {
          await hands.send({ image: video });
        },
        width: 640,
        height: 480,
      });

      cameraRef.current = camera;
      await camera.start();
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to start gesture control:", err);
      setError("Failed to access camera. Please ensure camera permissions are granted.");
      setIsLoading(false);
    }
  }, [enabled, detectGesture]);

  const stopCamera = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    if (handsRef.current) {
      handsRef.current.close();
      handsRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.remove();
      videoRef.current = null;
    }
    if (canvasRef.current) {
      canvasRef.current.remove();
      canvasRef.current = null;
    }
    if (gestureTimeoutRef.current) {
      clearTimeout(gestureTimeoutRef.current);
    }
    setGestureState({
      isActive: false,
      gesture: "none",
      confidence: 0,
      handPosition: null,
    });
  }, []);

  useEffect(() => {
    if (enabled) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [enabled, startCamera, stopCamera]);

  return {
    ...gestureState,
    isLoading,
    error,
    startCamera,
    stopCamera,
  };
};
