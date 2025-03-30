import React, { useRef, useEffect, useState } from 'react';
import { addDays, format, isToday } from 'date-fns';

interface TimelineProps {
  onScroll?: (direction: 'left' | 'right', scrollAmount: number) => void;
  scrollOffset?: number;
}

const Timeline: React.FC<TimelineProps> = ({ onScroll, scrollOffset = 0 }) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [timelineDays, setTimelineDays] = useState<Date[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Generate days for the timeline
  useEffect(() => {
    // Generate 45 days (past, present, future)
    const days: Date[] = [];
    const startPoint = addDays(startDate, -15);
    
    for (let i = 0; i < 45; i++) {
      days.push(addDays(startPoint, i));
    }
    
    setTimelineDays(days);
  }, [startDate]);
  
  // Set initial scroll position based on scrollOffset
  useEffect(() => {
    if (timelineRef.current && scrollOffset !== 0) {
      timelineRef.current.scrollLeft = scrollOffset;
    }
  }, [scrollOffset]);
  
  // Adjust timeline when it reaches the edges
  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = timelineRef.current;
      
      // If we've scrolled to near the edge, add more days
      if (scrollLeft < 200) {
        // Add more days to the beginning
        setStartDate(prev => addDays(prev, -5));
        // Keep the scroll position
        if (timelineRef.current) {
          timelineRef.current.scrollLeft += 700; // Adjusted width for more space between days
        }
      } else if (scrollWidth - (scrollLeft + clientWidth) < 200) {
        // We're near the right edge, add more days to the end
        setTimelineDays(prev => [
          ...prev,
          ...Array(5).fill(0).map((_, i) => 
            addDays(prev[prev.length - 1], i + 1)
          )
        ]);
      }
      
      // Notify parent of scroll change so whiteboard items can reposition
      if (onScroll) {
        onScroll('left', scrollLeft);
      }
    };
    
    const timelineElement = timelineRef.current;
    if (timelineElement) {
      timelineElement.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (timelineElement) {
        timelineElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [timelineDays, onScroll]);
  
  // Custom mouse drag for smoother scrolling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - timelineRef.current.offsetLeft);
    setScrollLeft(timelineRef.current.scrollLeft);
    
    // Change cursor style
    document.body.style.cursor = 'grabbing';
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    // Reset cursor style
    document.body.style.cursor = '';
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !timelineRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - timelineRef.current.offsetLeft;
    // Use a slower scrolling speed for better control
    const scrollSpeed = 1.5; // Lower = slower
    const walk = (x - startX) * scrollSpeed;
    timelineRef.current.scrollLeft = scrollLeft - walk;
    
    // Notify parent of scroll change
    if (onScroll) {
      onScroll('left', timelineRef.current.scrollLeft);
    }
  };
  
  // Handle wheel scroll with reduced acceleration
  const handleWheel = (e: React.WheelEvent) => {
    if (!timelineRef.current) return;
    
    e.preventDefault();
    
    // Reduce the scroll speed for mousepad scrolling
    const scrollFactor = 0.3; // Lower = slower
    timelineRef.current.scrollLeft += e.deltaX * scrollFactor;
    
    // Notify parent of scroll change
    if (onScroll) {
      onScroll('left', timelineRef.current.scrollLeft);
    }
  };
  
  return (
    <div className="timeline-container">
      {/* Timeline ruler line */}
      <div className="timeline"></div>
      
      {/* Timeline days */}
      <div 
        id="timeline" 
        ref={timelineRef}
        className="flex w-full overflow-x-auto scrollbar-hide" 
        style={{ 
          scrollBehavior: 'auto', // Changed from 'smooth' for better manual control
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
      >
        {timelineDays.map((day, index) => (
          <div 
            key={index} 
            className={`timeline-day ${isToday(day) ? 'today' : ''}`} 
            data-date={format(day, 'yyyy-MM-dd')}
          >
            <div className="flex flex-col items-center">
              <span className="font-handwritten text-2xl mb-2">{format(day, 'EEE')}</span>
              <div className="timeline-date">
                <span className="font-body text-sm">{format(day, 'MMM d')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
