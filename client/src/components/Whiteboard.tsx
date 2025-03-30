import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Group } from 'react-konva';
import { WhiteboardItem } from '@shared/schema';
import WhiteboardObject from './WhiteboardObject';
import AddItemMenu from './AddItemMenu';
import { v4 as uuidv4 } from 'uuid';
import Konva from 'konva';
import { drawConnector } from '@/lib/utils/connector';

interface WhiteboardProps {
  zoom: number;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ zoom }) => {
  const stageRef = useRef<Konva.Stage>(null);
  const whiteboardContainerRef = useRef<HTMLDivElement>(null);
  const connectorLayerRef = useRef<Konva.Layer>(null);
  
  const [menuPosition, setMenuPosition] = useState<{ x: number, y: number } | null>(null);
  const [objects, setObjects] = useState<WhiteboardItem[]>([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [timelineDays, setTimelineDays] = useState<HTMLElement[]>([]);
  
  // Get timeline days DOM elements for connector positioning
  useEffect(() => {
    // We need to observe the timeline because it's now dynamically positioned
    const observer = new MutationObserver(() => {
      const days = Array.from(document.querySelectorAll('.timeline-day'));
      setTimelineDays(days as HTMLElement[]);
    });
    
    // Initial load
    const days = Array.from(document.querySelectorAll('.timeline-day'));
    setTimelineDays(days as HTMLElement[]);
    
    // Start observing the DOM for changes to timeline
    const timelineContainer = document.querySelector('.timeline-container');
    if (timelineContainer) {
      observer.observe(timelineContainer, { 
        childList: true, 
        subtree: true 
      });
    }
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (whiteboardContainerRef.current) {
        setDimensions({
          width: whiteboardContainerRef.current.offsetWidth,
          height: whiteboardContainerRef.current.offsetHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);
  
  // Handle clicks to show menu
  const handleWhiteboardClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      // Only show menu when clicking on empty space
      const stage = e.target.getStage();
      const pointerPosition = stage?.getPointerPosition();
      
      if (pointerPosition) {
        setMenuPosition({
          x: pointerPosition.x,
          y: pointerPosition.y
        });
      }
    }
  }, []);
  
  // Handle adding an item from the menu
  const handleAddItem = useCallback((type: 'text' | 'task' | 'image' | 'event') => {
    if (!menuPosition) return;
    
    // Create new item
    const newItem: WhiteboardItem = {
      id: uuidv4(),
      type,
      content: getDefaultContent(type),
      position: {
        x: menuPosition.x,
        y: menuPosition.y
      },
      connectedDate: new Date()
    };
    
    // Add to state
    setObjects(prev => [...prev, newItem]);
    
    // Close menu
    setMenuPosition(null);
  }, [menuPosition]);
  
  // Helper to get default content for each type
  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'text':
        return { text: 'New Note', subtext: 'Click to edit' };
      case 'task':
        return { text: 'New Task', completed: false };
      case 'event':
        return { title: 'New Event', time: 'Time/Location' };
      case 'image':
        return { caption: 'Image Caption' };
      default:
        return { text: 'New Item' };
    }
  };
  
  // Redraw connectors when objects move
  const updateConnectors = useCallback(() => {
    if (!connectorLayerRef.current) return;
    
    connectorLayerRef.current.destroyChildren();
    
    objects.forEach(object => {
      if (timelineDays.length === 0) return;
      
      drawConnector(
        connectorLayerRef.current!,
        object,
        timelineDays,
        whiteboardContainerRef.current!
      );
    });
    
    connectorLayerRef.current.draw();
  }, [objects, timelineDays]);
  
  // Update connectors when objects change, timeline days are loaded, or dimensions change
  useEffect(() => {
    updateConnectors();
    
    // Also update on resize after a short delay
    const resizeHandler = () => {
      setTimeout(updateConnectors, 100);
    };
    
    window.addEventListener('resize', resizeHandler);
    
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, [objects, timelineDays, dimensions, updateConnectors]);
  
  // Handle object drag
  const handleDragMove = useCallback((id: string, x: number, y: number) => {
    setObjects(prev => 
      prev.map(obj => 
        obj.id === id 
          ? { ...obj, position: { x, y } } 
          : obj
      )
    );
    updateConnectors();
  }, [updateConnectors]);
  
  // Handle object drag end - update final position
  const handleDragEnd = useCallback((id: string, x: number, y: number) => {
    setObjects(prev => 
      prev.map(obj => 
        obj.id === id 
          ? { ...obj, position: { x, y } } 
          : obj
      )
    );
    updateConnectors();
  }, [updateConnectors]);
  
  // Handle content change in objects
  const handleContentChange = useCallback((id: string, content: any) => {
    setObjects(prev => 
      prev.map(obj => 
        obj.id === id 
          ? { ...obj, content } 
          : obj
      )
    );
    // Wait for content to be updated, then recalculate connectors
    setTimeout(updateConnectors, 50);
  }, [updateConnectors]);
  
  // Close menu if clicking outside
  const handleCloseMenu = useCallback(() => {
    setMenuPosition(null);
  }, []);
  
  // Calculate scale based on zoom
  const scale = zoom / 100;
  
  return (
    <div 
      id="whiteboard-container" 
      ref={whiteboardContainerRef}
      className="flex-grow relative overflow-hidden canvas-texture"
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleWhiteboardClick}
        scaleX={scale}
        scaleY={scale}
      >
        {/* Connector layer (lines) */}
        <Layer ref={connectorLayerRef} />
        
        {/* Objects layer */}
        <Layer>
          {objects.map(obj => (
            <WhiteboardObject
              key={obj.id}
              object={obj}
              onDragMove={(x, y) => handleDragMove(obj.id, x, y)}
              onDragEnd={(x, y) => handleDragEnd(obj.id, x, y)}
              onContentChange={handleContentChange}
            />
          ))}
        </Layer>
      </Stage>
      
      {/* Menu for adding items */}
      {menuPosition && (
        <AddItemMenu
          position={menuPosition}
          onAddItem={handleAddItem}
          onClose={handleCloseMenu}
        />
      )}
    </div>
  );
};

export default Whiteboard;
