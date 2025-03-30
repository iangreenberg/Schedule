import React, { useState } from 'react';
import Timeline from '@/components/Timeline';
import Controls from '@/components/Controls';
import { Button } from '@/components/ui/button';
import BasicWhiteboard from '@/components/BasicWhiteboard';

const HomePage: React.FC = () => {
  const [zoom, setZoom] = useState(100);
  
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
      
      {/* Main content with Whiteboard and Timeline in the middle */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Whiteboard (fills the space) */}
        <div className="absolute inset-0">
          <BasicWhiteboard zoom={zoom / 100} />
        </div>
        
        {/* Timeline (centered in the middle) */}
        <div className="absolute inset-0 pointer-events-none flex items-center">
          <div className="w-full pointer-events-auto">
            <Timeline />
          </div>
        </div>
      </div>
      
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
