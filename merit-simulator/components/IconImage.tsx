import React, { useState } from 'react';

interface IconImageProps {
  src?: string;
  emojis: string[];
  alt: string;
  className?: string;
  seed?: number; // Used to pick a deterministic emoji from the array
}

const IconImage: React.FC<IconImageProps> = ({ src, emojis, alt, className, seed = 0 }) => {
  const [error, setError] = useState(false);
  
  // Deterministically pick an emoji based on the seed
  const emoji = emojis.length > 0 ? emojis[seed % emojis.length] : '❓';

  if (!src || error) {
    return <span className={className} role="img" aria-label={alt}>{emoji}</span>;
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={() => setError(true)} 
    />
  );
};

export default IconImage;