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
    <div className="py-3 px-6 border-t border-secondary/10 bg-gradient-to-r from-primary/5 via-white to-accent/5 z-10">
      <div className="container mx-auto flex justify-between items-center">
        {/* Zoom controls with Japanese styling */}
        <div className="flex items-center space-x-2">
          <button 
            className="p-2 rounded-full hover:bg-primary/10 transition-all" 
            title="Zoom In"
            onClick={onZoomIn}
          >
            <ZoomIn className="h-5 w-5 text-primary" />
          </button>
          <button 
            className="p-2 rounded-full hover:bg-primary/10 transition-all" 
            title="Zoom Out"
            onClick={onZoomOut}
          >
            <ZoomOut className="h-5 w-5 text-primary" />
          </button>
          <span className="px-2 py-1 text-sm font-handwritten text-primary bg-white/80 rounded-full shadow-sm border border-primary/10">
            {zoom}%
          </span>
        </div>
        
        {/* Center tip with Japanese flourish */}
        <div className="font-handwritten text-lg relative">
          <span className="text-primary/80 px-3 py-1 relative z-10">
            Click anywhere to add an item
          </span>
          {/* Decorative element under text */}
          <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-secondary/40 transform rotate-0.5"></div>
        </div>
        
        {/* Navigation controls */}
        <div className="flex space-x-3">
          <button 
            className="p-2 rounded-full hover:bg-accent/10 transition-all border border-accent/20" 
            title="Previous Week"
            onMouseDown={() => setIsNavLeftPressed(true)}
            onMouseUp={() => setIsNavLeftPressed(false)}
            onMouseLeave={() => setIsNavLeftPressed(false)}
          >
            <ChevronLeft className="h-5 w-5 text-accent" />
          </button>
          <button 
            className="p-2 rounded-full hover:bg-accent/10 transition-all border border-accent/20" 
            title="Next Week"
            onMouseDown={() => setIsNavRightPressed(true)}
            onMouseUp={() => setIsNavRightPressed(false)}
            onMouseLeave={() => setIsNavRightPressed(false)}
          >
            <ChevronRight className="h-5 w-5 text-accent" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;
