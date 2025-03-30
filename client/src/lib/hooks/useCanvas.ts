import { useState, useRef, useEffect, useCallback } from 'react';
import Konva from 'konva';

interface UseCanvasProps {
  width?: number;
  height?: number;
  scaleBy?: number;
}

/**
 * A custom hook for handling canvas operations like panning, zooming, and object manipulation
 */
export function useCanvas({ width = 800, height = 600, scaleBy = 1.1 }: UseCanvasProps = {}) {
  const stageRef = useRef<Konva.Stage | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width, height });
  const [isDragging, setIsDragging] = useState(false);
  
  // Resize handling
  useEffect(() => {
    const handleResize = () => {
      if (stageRef.current) {
        const container = stageRef.current.container();
        setDimensions({
          width: container.offsetWidth,
          height: container.offsetHeight
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Zooming functionality
  const zoomIn = useCallback(() => {
    setScale(s => Math.min(s * scaleBy, 3));
  }, [scaleBy]);
  
  const zoomOut = useCallback(() => {
    setScale(s => Math.max(s / scaleBy, 0.5));
  }, [scaleBy]);
  
  const zoomStage = useCallback((event: Konva.KonvaEventObject<WheelEvent>) => {
    event.evt.preventDefault();
    
    if (!stageRef.current) return;
    
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale
    };
    
    const direction = event.evt.deltaY > 0 ? 1 : -1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    setScale(newScale);
    
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale
    };
    
    setPosition(newPos);
  }, [scaleBy]);
  
  // Panning functionality
  const startDragging = useCallback(() => {
    setIsDragging(true);
  }, []);
  
  const stopDragging = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const moveStage = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDragging) return;
    
    const stage = e.target.getStage();
    if (!stage) return;
    
    setPosition({
      x: stage.x(),
      y: stage.y()
    });
  }, [isDragging]);
  
  return {
    stageRef,
    scale,
    position,
    dimensions,
    zoomIn,
    zoomOut,
    zoomStage,
    startDragging,
    stopDragging,
    moveStage,
    setScale
  };
}
