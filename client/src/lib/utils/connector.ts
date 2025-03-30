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
): Konva.Line {
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
  const dayBottomX = dayRect.left + dayRect.width / 2 - containerRect.left;
  const dayBottomY = dayRect.bottom - containerRect.top + 15; // 15px below day marker
  
  // Create the connector line
  const connector = new Konva.Line({
    points: [objectX, objectY, dayBottomX, dayBottomY],
    stroke: '#DBA159',
    strokeWidth: 2,
    lineCap: 'round',
  });
  
  // Add dot at the end of the connector
  const dot = new Konva.Circle({
    x: dayBottomX,
    y: dayBottomY,
    radius: 5,
    fill: '#DBA159',
  });
  
  layer.add(connector);
  layer.add(dot);
  
  return connector;
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
