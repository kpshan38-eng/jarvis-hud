import { useState, useCallback, useRef, useEffect } from "react";

interface FaceDetectionResult {
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  faceBox: { x: number; y: number; width: number; height: number } | null;
  landmarks: { leftEye: { x: number; y: number }; rightEye: { x: number; y: number }; nose: { x: number; y: number }; mouth: { x: number; y: number } } | null;
  faceAngle: { yaw: number; pitch: number; roll: number };
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  start: () => Promise<void>;
  stop: () => void;
}

export const useFaceDetection = (enabled: boolean = false): FaceDetectionResult => {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faceBox, setFaceBox] = useState<FaceDetectionResult["faceBox"]>(null);
  const [landmarks, setLandmarks] = useState<FaceDetectionResult["landmarks"]>(null);
  const [faceAngle, setFaceAngle] = useState({ yaw: 0, pitch: 0, roll: 0 });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>(0);
  const faceDetectorRef = useRef<any>(null);

  const stop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
    setFaceBox(null);
    setLandmarks(null);
  }, []);

  const detectFace = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame
    ctx.drawImage(video, 0, 0);

    // Use FaceDetector API if available, otherwise use simple heuristic
    if ("FaceDetector" in window && faceDetectorRef.current) {
      try {
        const faces = await faceDetectorRef.current.detect(canvas);
        if (faces.length > 0) {
          const face = faces[0];
          const box = face.boundingBox;
          
          setFaceBox({
            x: box.x / canvas.width,
            y: box.y / canvas.height,
            width: box.width / canvas.width,
            height: box.height / canvas.height,
          });

          // Estimate landmarks from bounding box
          const centerX = (box.x + box.width / 2) / canvas.width;
          const centerY = (box.y + box.height / 2) / canvas.height;
          
          setLandmarks({
            leftEye: { x: centerX - 0.06, y: centerY - 0.05 },
            rightEye: { x: centerX + 0.06, y: centerY - 0.05 },
            nose: { x: centerX, y: centerY + 0.02 },
            mouth: { x: centerX, y: centerY + 0.12 },
          });

          // Calculate face angle from landmarks if available
          if (face.landmarks) {
            const leftEye = face.landmarks.find((l: any) => l.type === "eye")?.locations?.[0];
            const rightEye = face.landmarks.find((l: any) => l.type === "eye")?.locations?.[1];
            
            if (leftEye && rightEye) {
              const deltaX = rightEye.x - leftEye.x;
              const deltaY = rightEye.y - leftEye.y;
              const roll = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
              setFaceAngle({ yaw: 0, pitch: 0, roll });
            }
          }
        } else {
          setFaceBox(null);
          setLandmarks(null);
        }
      } catch (e) {
        console.warn("Face detection error:", e);
      }
    } else {
      // Fallback: simulate face detection with center positioning
      // This uses simple edge detection heuristics
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Simple skin tone detection
      let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
      let skinPixelCount = 0;
      
      for (let y = 0; y < canvas.height; y += 4) {
        for (let x = 0; x < canvas.width; x += 4) {
          const i = (y * canvas.width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Basic skin tone detection
          if (r > 95 && g > 40 && b > 20 && 
              r > g && r > b && 
              Math.abs(r - g) > 15 && 
              r - b > 15) {
            skinPixelCount++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      
      if (skinPixelCount > 500) {
        const width = maxX - minX;
        const height = maxY - minY;
        
        // Apply some constraints to approximate a face
        const faceWidth = Math.min(width, height * 0.8);
        const faceHeight = faceWidth * 1.25;
        const faceX = minX + (width - faceWidth) / 2;
        const faceY = minY;
        
        setFaceBox({
          x: faceX / canvas.width,
          y: faceY / canvas.height,
          width: faceWidth / canvas.width,
          height: faceHeight / canvas.height,
        });
        
        const centerX = (faceX + faceWidth / 2) / canvas.width;
        const centerY = (faceY + faceHeight / 2) / canvas.height;
        
        setLandmarks({
          leftEye: { x: centerX - 0.08, y: centerY - 0.08 },
          rightEye: { x: centerX + 0.08, y: centerY - 0.08 },
          nose: { x: centerX, y: centerY },
          mouth: { x: centerX, y: centerY + 0.12 },
        });
      } else {
        setFaceBox(null);
        setLandmarks(null);
      }
    }

    animationRef.current = requestAnimationFrame(detectFace);
  }, [isActive]);

  const start = useCallback(async () => {
    if (isActive || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Initialize FaceDetector if available
      if ("FaceDetector" in window) {
        try {
          faceDetectorRef.current = new (window as any).FaceDetector({
            fastMode: true,
            maxDetectedFaces: 1,
          });
        } catch (e) {
          console.warn("FaceDetector not fully supported:", e);
        }
      }

      setIsActive(true);
      setIsLoading(false);
      
      // Start detection loop
      detectFace();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to access camera");
      setIsLoading(false);
    }
  }, [isActive, isLoading, detectFace]);

  // Auto-start/stop based on enabled prop
  useEffect(() => {
    if (enabled && !isActive && !isLoading) {
      start();
    } else if (!enabled && isActive) {
      stop();
    }
  }, [enabled, isActive, isLoading, start, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isActive,
    isLoading,
    error,
    faceBox,
    landmarks,
    faceAngle,
    videoRef,
    canvasRef,
    start,
    stop,
  };
};
