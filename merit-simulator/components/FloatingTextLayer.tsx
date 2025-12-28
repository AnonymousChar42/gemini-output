import React from 'react';
import { FloatingText } from '../types';

interface Props {
  items: FloatingText[];
}

const FloatingTextLayer: React.FC<Props> = ({ items }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {items.map((item) => (
        <div
          key={item.id}
          className="floating-text absolute font-bold text-2xl font-cyber shadow-black drop-shadow-md"
          style={{ 
            left: item.x, 
            top: item.y,
            color: item.color
          }}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
};

export default FloatingTextLayer;