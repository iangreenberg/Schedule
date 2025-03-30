import React from 'react';
import Timeline from '@/components/Timeline';
import Whiteboard from '@/components/Whiteboard';
import Controls from '@/components/Controls';
import { Button } from '@/components/ui/button';

const HomePage: React.FC = () => {
  const [zoom, setZoom] = React.useState(100);
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Japanese inspired header */}
      <header className="px-6 py-4 relative z-20 bg-gradient-to-r from-primary/5 via-white to-accent/5">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            {/* Decorative element */}
            <div className="w-8 h-8 mr-3 rounded-full bg-primary opacity-90 shadow-md rotate-6"></div>
            
            {/* Title with Japanese-inspired styling */}
            <h1 className="font-handwritten text-4xl md:text-5xl font-bold text-primary title-underline leading-none">
              Ian's Schedule
            </h1>
          </div>
          
          <div className="flex space-x-4">
            <Button className="px-5 py-2 rounded-md bg-primary text-white font-handwritten hover:bg-opacity-90 shadow-md">
              Save
            </Button>
            <Button 
              variant="outline"
              className="px-5 py-2 rounded-md bg-white/80 backdrop-blur-sm border border-accent/30 text-accent font-handwritten hover:bg-opacity-90 shadow-sm"
            >
              Share
            </Button>
          </div>
        </div>
      </header>
      
      {/* Timeline (now centered) */}
      <Timeline />
      
      {/* Whiteboard with more space */}
      <Whiteboard zoom={zoom} />
      
      {/* Controls */}
      <Controls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
    </div>
  );
};

export default HomePage;
