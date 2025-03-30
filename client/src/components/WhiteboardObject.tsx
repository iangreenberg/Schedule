import React from 'react';
import { Group, Rect, Text, Line } from 'react-konva';
import { WhiteboardItem } from '@shared/schema';
import Konva from 'konva';

interface WhiteboardObjectProps {
  object: WhiteboardItem;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: (x: number, y: number) => void;
}

const WhiteboardObject: React.FC<WhiteboardObjectProps> = ({
  object,
  onDragMove,
  onDragEnd
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [width, setWidth] = React.useState(150);
  const [height, setHeight] = React.useState(60);
  const textRef = React.useRef<Konva.Text>(null);
  
  React.useEffect(() => {
    // Calculate dimensions based on content
    if (textRef.current) {
      const textWidth = textRef.current.width();
      const textHeight = textRef.current.height();
      setWidth(Math.max(150, textWidth + 40));
      setHeight(Math.max(60, textHeight + 30));
    }
  }, [object.content]);
  
  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    onDragMove(e.target.x(), e.target.y());
  };
  
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onDragEnd(e.target.x(), e.target.y());
  };
  
  // Get color based on object type - Japanese-inspired color palette
  const getObjectColor = () => {
    switch(object.type) {
      case 'text':
        return '#A02C2C'; // Akane (Deep Red)
      case 'task':
        return '#DC6238'; // Persimmon 
      case 'event':
        return '#2A4B7C'; // Kon (Indigo Blue)
      case 'image':
        return '#5D3A1A'; // Kogecha (Dark Brown)
      default:
        return '#A02C2C'; // Default to Akane
    }
  };
  
  // Get background color with lighter tint
  const getBackgroundColor = () => {
    switch(object.type) {
      case 'text':
        return '#FFF8F8'; // Light red tint
      case 'task':
        return '#FFF9F1'; // Light orange tint
      case 'event':
        return '#F5F8FD'; // Light blue tint
      case 'image':
        return '#FAF7F5'; // Light brown tint
      default:
        return '#FFF8F8';
    }
  };
  
  const getObjectContent = () => {
    const color = getObjectColor();
    
    switch (object.type) {
      case 'text':
        return (
          <>
            <Text
              ref={textRef}
              text={object.content.text}
              fontSize={20}
              fontFamily="Caveat"
              fill={color} 
              width={width - 40}
              padding={10}
              align="center"
            />
            {object.content.subtext && (
              <Text
                text={object.content.subtext}
                fontSize={13}
                fontFamily="Quicksand"
                fill="#666666"
                width={width - 40}
                padding={10}
                y={30}
                align="center"
              />
            )}
          </>
        );
      case 'task':
        return (
          <>
            <Rect
              x={10}
              y={15}
              width={16}
              height={16}
              stroke={color}
              strokeWidth={1.5}
              fill={object.content.completed ? color : "white"}
              cornerRadius={3}
            />
            <Text
              ref={textRef}
              text={object.content.text}
              fontSize={18}
              fontFamily="Caveat"
              fill={color}
              width={width - 60}
              padding={10}
              x={32}
              align="left"
            />
          </>
        );
      case 'event':
        return (
          <>
            {/* Event icon circle */}
            <Rect
              x={10}
              y={10}
              width={width - 20}
              height={8}
              fill={color}
              opacity={0.8}
              cornerRadius={4}
            />
            <Text
              ref={textRef}
              text={object.content.title}
              fontSize={20}
              fontFamily="Caveat"
              fill={color} 
              width={width - 40}
              padding={10}
              y={15}
              align="center"
            />
            <Text
              text={object.content.time || ""}
              fontSize={12}
              fontFamily="Quicksand"
              fill="#666666"
              width={width - 40}
              padding={10}
              y={40}
              align="center"
            />
          </>
        );
      case 'image':
        return (
          <>
            <Rect
              x={10}
              y={10}
              width={width - 20}
              height={height - 40}
              stroke={color}
              strokeWidth={1}
              dash={[5, 2]}
              fill="#F9F9F9"
            />
            <Text
              text="+ Add Image"
              fontSize={14}
              fontFamily="Quicksand"
              fill="#666666"
              width={width - 20}
              padding={10}
              y={height / 2 - 20}
              align="center"
            />
            {object.content.caption && (
              <Text
                ref={textRef}
                text={object.content.caption}
                fontSize={12}
                fontFamily="Quicksand"
                fill="#666666"
                width={width - 40}
                padding={10}
                y={height - 30}
                align="center"
              />
            )}
          </>
        );
      default:
        return null;
    }
  };
  
  // Create Japanese-inspired brushstroke for border
  const color = getObjectColor();
  const bgColor = getBackgroundColor();
  
  // Function to create brush strokes with random variations
  const createBrushStroke = (startX: number, startY: number, endX: number, endY: number, width: number) => {
    const points: number[] = [];
    const segments = 8;
    const segmentLength = 1 / segments;
    
    for (let i = 0; i <= segments; i++) {
      const t = i * segmentLength;
      const x = startX + (endX - startX) * t;
      const y = startY + (endY - startY) * t;
      
      // Add random variation for artistic brush stroke effect
      const variation = (Math.random() * 2 - 1) * (width / 10);
      
      // Perpendicular direction
      const perpX = -(endY - startY);
      const perpY = endX - startX;
      
      // Normalize
      const length = Math.sqrt(perpX * perpX + perpY * perpY);
      const normPerpX = perpX / length;
      const normPerpY = perpY / length;
      
      points.push(x + normPerpX * variation, y + normPerpY * variation);
    }
    
    return points;
  };
  
  return (
    <Group
      x={object.position.x}
      y={object.position.y}
      draggable
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      {/* Shadow */}
      <Rect
        x={4}
        y={4}
        width={width}
        height={height}
        fill="rgba(0,0,0,0.08)"
        cornerRadius={6}
      />
      
      {/* Brushstroke border elements - bottom */}
      <Line
        points={createBrushStroke(-2, height + 2, width + 2, height + 2, 8)}
        stroke={color}
        strokeWidth={4}
        lineCap="round"
        lineJoin="round"
        opacity={0.8}
      />
      
      {/* Background with texture */}
      <Rect
        width={width}
        height={height}
        fill={bgColor}
        cornerRadius={4}
        perfectDrawEnabled={false}
      />
      
      {/* Brushstroke border elements - top */}
      <Line
        points={createBrushStroke(-2, -2, width + 2, -2, 8)}
        stroke={color}
        strokeWidth={4}
        lineCap="round"
        lineJoin="round"
        opacity={0.8}
      />
      
      {/* Brushstroke border elements - left */}
      <Line
        points={createBrushStroke(-2, -2, -2, height + 2, 8)}
        stroke={color}
        strokeWidth={4}
        lineCap="round"
        lineJoin="round"
        opacity={0.8}
      />
      
      {/* Brushstroke border elements - right */}
      <Line
        points={createBrushStroke(width + 2, -2, width + 2, height + 2, 8)}
        stroke={color}
        strokeWidth={4}
        lineCap="round"
        lineJoin="round"
        opacity={0.8}
      />
      
      {/* Content */}
      {getObjectContent()}
    </Group>
  );
};

export default WhiteboardObject;
