
import { useEffect, useRef, useState } from 'react';
import { Canvas } from 'fabric';

export const useCanvasInitialization = (width: number = 500, height: number = 600) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<Canvas | null>(null);

  // Initialize the canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#f8f9fa',
      preserveObjectStacking: true, // Ensure objects stay in the stacking order we define
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [width, height]);

  return {
    canvasRef,
    fabricCanvas
  };
};
