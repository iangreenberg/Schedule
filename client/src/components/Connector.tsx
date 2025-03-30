import React, { useState, useEffect } from 'react';
import { WhiteboardItem } from '@shared/schema';

interface ConnectorProps {
  item: WhiteboardItem;
}

/**
 * The Connector component draws a curved line connecting a whiteboard item to its date on the timeline
 */
const Connector: React.FC<ConnectorProps> = ({ item }) => {
  const [path, setPath] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Function to calculate connector path
    const calculateConnectorPath = () => {
      // Find the whiteboard item element
      const itemElement = document.getElementById(`item-${item.id}`);
      if (!itemElement) return;
      
      // Find the date element that matches this item's connectedDate
      const dateString = new Date(item.connectedDate).toISOString().split('T')[0];
      const dateElements = document.querySelectorAll('.timeline-day[data-date="' + dateString + '"]');
      
      if (!dateElements || dateElements.length === 0) return;
      
      const dateElement = dateElements[0];
      
      // Get positions
      const itemRect = itemElement.getBoundingClientRect();
      const dateRect = dateElement.getBoundingClientRect();
      
      // Use top-middle of the item for connection point
      const itemTopMiddleX = itemRect.left + itemRect.width / 2;
      const itemTopMiddleY = itemRect.top;
      const dateCenterX = dateRect.left + dateRect.width / 2;
      const dateCenterY = dateRect.top;
      
      // Adjust to be relative to document (accounting for scroll)
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      
      // Calculate control points for a quadratic bezier curve
      const isAboveTimeline = itemTopMiddleY < dateCenterY;
      
      // Draw curved connector path with SVG
      let svgPath = `M ${itemTopMiddleX + scrollX} ${itemTopMiddleY + scrollY} `;
      
      if (isAboveTimeline) {
        // Item is above the timeline, curve down
        const controlX = (itemTopMiddleX + dateCenterX) / 2;
        const controlY = dateCenterY - Math.abs(dateCenterY - itemTopMiddleY) * 0.2;
        svgPath += `Q ${controlX + scrollX} ${controlY + scrollY} ${dateCenterX + scrollX} ${dateCenterY + scrollY}`;
      } else {
        // Item is below the timeline, curve up
        const controlX = (itemTopMiddleX + dateCenterX) / 2;
        const controlY = dateCenterY + Math.abs(dateCenterY - itemTopMiddleY) * 0.2;
        svgPath += `Q ${controlX + scrollX} ${controlY + scrollY} ${dateCenterX + scrollX} ${dateCenterY + scrollY}`;
      }
      
      setPath(svgPath);
      setIsVisible(true);
    };
    
    // Calculate on mount and when item position changes
    calculateConnectorPath();
    
    // Set up event listeners for various scenarios that might require recalculating the connector
    window.addEventListener('resize', calculateConnectorPath);
    window.addEventListener('scroll', calculateConnectorPath);
    
    // Listen for timeline scroll events - recalculate whenever timeline scrolls
    const timeline = document.getElementById('timeline');
    const handleTimelineScroll = () => {
      calculateConnectorPath();
    };
    
    if (timeline) {
      timeline.addEventListener('scroll', handleTimelineScroll);
    }
    
    // MutationObserver to detect DOM changes (like when items are repositioned)
    const observer = new MutationObserver(() => {
      calculateConnectorPath();
    });
    
    const whiteboard = document.querySelector('.basic-whiteboard');
    if (whiteboard) {
      observer.observe(whiteboard, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
      });
    }
    
    // Set up interval as a fallback to catch any missed updates
    const interval = setInterval(calculateConnectorPath, 200);
    
    return () => {
      window.removeEventListener('resize', calculateConnectorPath);
      window.removeEventListener('scroll', calculateConnectorPath);
      if (timeline) {
        timeline.removeEventListener('scroll', handleTimelineScroll);
      }
      observer.disconnect();
      clearInterval(interval);
    };
  }, [item]);
  
  if (!isVisible || !path) {
    return null;
  }
  
  // Determine color based on item type
  const getConnectorColor = () => {
    switch (item.type) {
      case 'text': return '#A02C2C';
      case 'task': return '#DC6238';
      case 'event': return '#2A4B7C';
      case 'image': return '#5D3A1A';
      default: return '#999';
    }
  };
  
  return (
    <svg
      className="connector-svg"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      <path
        d={path}
        stroke={getConnectorColor()}
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="5,5"
        opacity="0.6"
      />
    </svg>
  );
};

export default Connector;