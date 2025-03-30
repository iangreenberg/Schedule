import React, { useRef, useEffect, useState, useMemo } from 'react';
import { addDays, format } from 'date-fns';

interface TimelineProps {
  onScroll?: (direction: 'left' | 'right') => void;
}

const Timeline: React.FC<TimelineProps> = ({ onScroll }) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [timelineDays, setTimelineDays] = useState<Date[]>([]);
  
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
          timelineRef.current.scrollLeft += 550; // Approximate width of 5 days
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
  }, [timelineDays]);
  
  return (
    <div className="bg-white border-b border-gray-200 overflow-hidden z-10">
      <div 
        id="timeline" 
        ref={timelineRef}
        className="flex py-4 px-6 overflow-x-auto scrollbar-hide" 
        style={{ scrollBehavior: 'smooth' }}
      >
        {timelineDays.map((day, index) => (
          <div key={index} className="timeline-day" data-date={format(day, 'yyyy-MM-dd')}>
            <span className="font-handwritten text-2xl">{format(day, 'EEE')}</span>
            <span className="font-body text-sm text-gray-600">{format(day, 'MMM d')}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
