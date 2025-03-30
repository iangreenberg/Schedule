import Konva from 'konva';
import { WhiteboardItem } from '@shared/schema';
import { findClosestDateElement } from './dateUtils';

/**
 * Draw a connector line between a whiteboard object and its closest day on the timeline
 */
export function drawConnector(
  layer: Konva.Layer,
  object: WhiteboardItem,
  timelineDays: HTMLElement[],
  containerRef: HTMLElement
): Konva.Shape {
  // Get object position (center)
  const objectX = object.position.x;
  const objectY = object.position.y;
  
  // Find the closest day in the timeline
  const objectContainerX = containerRef.offsetLeft + objectX;
  const closestDay = findClosestDateElement(objectContainerX, timelineDays);
  
  if (!closestDay) {
    // Create a minimal connector if no day is found
    return new Konva.Line({
      points: [objectX, objectY, objectX, objectY],
      stroke: '#DBA159',
      strokeWidth: 2,
    });
  }
  
  // Get the day element's position
  const dayRect = closestDay.getBoundingClientRect();
  const containerRect = containerRef.getBoundingClientRect();
  
  // Calculate connector endpoints
  const dayTimelineX = dayRect.left + dayRect.width / 2 - containerRect.left;
  
  // Find the timeline's vertical position (center of the timeline container)
  const timelineContainer = document.querySelector('.timeline-container');
  let timelineY = containerRect.height / 2; // Default to middle of container
  
  if (timelineContainer) {
    const timelineRect = timelineContainer.getBoundingClientRect();
    timelineY = timelineRect.top + timelineRect.height / 2 - containerRect.top;
  }
  
  // Create beautiful brush-stroke like curved line with improved curve control
  // Adjust control points based on whether object is above or below the timeline
  const isAboveTimeline = objectY < timelineY;
  
  // Calculate curve's control points dynamically based on object position
  let cp1X, cp1Y, cp2X, cp2Y;
  
  // Calculate distance from object to timeline
  const xDistance = Math.abs(objectX - dayTimelineX);
  const yDistance = Math.abs(objectY - timelineY);
  
  // Adjust curve amount based on distance - closer items need gentler curves
  const curveAmount = Math.min(Math.max(yDistance / 4, 20), 100);
  
  if (isAboveTimeline) {
    // Object above timeline - curve flows downward
    cp1X = objectX + (dayTimelineX - objectX) / 3; 
    cp1Y = objectY + curveAmount;
    cp2X = dayTimelineX - (dayTimelineX - objectX) / 3;
    cp2Y = timelineY - curveAmount / 2;
  } else {
    // Object below timeline - curve flows upward
    cp1X = objectX + (dayTimelineX - objectX) / 3;
    cp1Y = objectY - curveAmount;
    cp2X = dayTimelineX - (dayTimelineX - objectX) / 3;
    cp2Y = timelineY + curveAmount / 2;
  }
  
  // Create more dynamic stroke width based on distance
  const strokeWidth = Math.max(1.5, Math.min(3, 3 - (xDistance + yDistance) / 500));
  
  // Create the curve path
  const path = new Konva.Path({
    data: `M${objectX},${objectY} C${cp1X},${cp1Y} ${cp2X},${cp2Y} ${dayTimelineX},${timelineY}`,
    stroke: '#DBA159',
    strokeWidth,
    lineCap: 'round',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowBlur: 2,
    shadowOffset: { x: 1, y: 1 },
  });
  
  // Add dot at the end of the connector
  const dot = new Konva.Circle({
    x: dayTimelineX,
    y: timelineY,
    radius: 4,
    fill: '#DBA159',
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowBlur: 3,
    shadowOffset: { x: 1, y: 1 },
  });
  
  layer.add(path);
  layer.add(dot);
  
  // Store the date with the whiteboard item
  const dateStr = closestDay.getAttribute('data-date');
  if (dateStr) {
    object.connectedDate = new Date(dateStr);
  }
  
  return path;
}

/**
 * Calculate the angle between two points in degrees
 */
export function calculateAngle(x1: number, y1: number, x2: number, y2: number): number {
  return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
}

/**
 * Calculate the distance between two points
 */
export function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
