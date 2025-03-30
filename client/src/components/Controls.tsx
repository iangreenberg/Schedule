import React from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface ControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const Controls: React.FC<ControlsProps> = ({ zoom, onZoomIn, onZoomOut }) => {
  const [isNavLeftPressed, setIsNavLeftPressed] = React.useState(false);
  const [isNavRightPressed, setIsNavRightPressed] = React.useState(false);
  
  // Handle scrolling timeline
  React.useEffect(() => {
    if (!isNavLeftPressed && !isNavRightPressed) return;
    
    const timeline = document.getElementById('timeline');
    if (!timeline) return;
    
    const interval = setInterval(() => {
      if (isNavLeftPressed) {
        timeline.scrollLeft -= 10;
      } else if (isNavRightPressed) {
        timeline.scrollLeft += 10;
      }
    }, 16); // ~60fps
    
    return () => clearInterval(interval);
  }, [isNavLeftPressed, isNavRightPressed]);
  
  return (
    <div className="bg-neutral py-2 px-6 border-t border-gray-200 z-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <button 
            className="p-2 rounded-full hover:bg-gray-200 transition" 
            title="Zoom In"
            onClick={onZoomIn}
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button 
            className="p-2 rounded-full hover:bg-gray-200 transition" 
            title="Zoom Out"
            onClick={onZoomOut}
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <span className="text-sm text-gray-500">{zoom}%</span>
        </div>
        
        <div className="font-handwritten text-sm text-gray-500">
          Click anywhere to add an item
        </div>
        
        <div className="flex space-x-2">
          <button 
            className="p-2 rounded-full hover:bg-gray-200 transition" 
            title="Previous Week"
            onMouseDown={() => setIsNavLeftPressed(true)}
            onMouseUp={() => setIsNavLeftPressed(false)}
            onMouseLeave={() => setIsNavLeftPressed(false)}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            className="p-2 rounded-full hover:bg-gray-200 transition" 
            title="Next Week"
            onMouseDown={() => setIsNavRightPressed(true)}
            onMouseUp={() => setIsNavRightPressed(false)}
            onMouseLeave={() => setIsNavRightPressed(false)}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;
