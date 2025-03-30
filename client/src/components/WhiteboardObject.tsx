import React from 'react';
import { Group, Rect, Text } from 'react-konva';
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
  
  const getObjectContent = () => {
    switch (object.type) {
      case 'text':
        return (
          <>
            <Text
              ref={textRef}
              text={object.content.text}
              fontSize={18}
              fontFamily="Caveat"
              fill="#333333" 
              width={width - 40}
              padding={10}
              align="center"
            />
            {object.content.subtext && (
              <Text
                text={object.content.subtext}
                fontSize={12}
                fontFamily="Quicksand"
                fill="#666666"
                width={width - 40}
                padding={10}
                y={25}
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
              stroke="#333333"
              strokeWidth={1}
              fill={object.content.completed ? "#4A6FA5" : "white"}
              cornerRadius={2}
            />
            <Text
              ref={textRef}
              text={object.content.text}
              fontSize={18}
              fontFamily="Caveat"
              fill="#333333"
              width={width - 60}
              padding={10}
              x={30}
              align="left"
            />
          </>
        );
      case 'event':
        return (
          <>
            <Text
              ref={textRef}
              text={object.content.title}
              fontSize={18}
              fontFamily="Caveat"
              fill="#333333" 
              width={width - 40}
              padding={10}
              align="center"
            />
            <Text
              text={object.content.time || ""}
              fontSize={12}
              fontFamily="Quicksand"
              fill="#666666"
              width={width - 40}
              padding={10}
              y={25}
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
              stroke="#CCCCCC"
              strokeWidth={1}
              dash={[5, 2]}
              fill="#F9F9F9"
            />
            <Text
              text="+ Add Image"
              fontSize={14}
              fontFamily="Quicksand"
              fill="#999999"
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
  
  return (
    <Group
      x={object.position.x}
      y={object.position.y}
      draggable
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      {/* Background with brush stroke effect */}
      <Rect
        width={width}
        height={height}
        fill="white"
        cornerRadius={4}
        shadowColor="rgba(0,0,0,0.2)"
        shadowBlur={3}
        shadowOffset={{ x: 1, y: 2 }}
      />
      
      {/* Brush border effect */}
      <Rect
        x={-3}
        y={-3}
        width={width + 6}
        height={height + 6}
        fill="#4A6FA5"
        cornerRadius={8}
        opacity={0.8}
        rotation={-0.5}
      />
      
      {/* Content */}
      {getObjectContent()}
    </Group>
  );
};

export default WhiteboardObject;
