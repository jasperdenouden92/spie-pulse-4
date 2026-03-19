import React from 'react';
import Box from '@mui/material/Box';

interface StackedImagesProps {
  images: string[];
  base?: number;
  scaleStep?: number;
  peek?: number;
}

export default function StackedImages({ images, base = 28, scaleStep = 0.8, peek = 4 }: StackedImagesProps) {
  const stack = images.slice(0, 3);
  return (
    <Box sx={{
      position: 'relative',
      width: base + peek * (stack.length - 1),
      height: base,
      flexShrink: 0,
    }}>
      {stack.map((img, i) => {
        const size = Math.round(base * Math.pow(scaleStep, i));
        const reverseI = stack.length - 1 - i;
        return (
          <Box
            key={i}
            component="img"
            src={img}
            alt=""
            sx={{
              position: 'absolute',
              right: reverseI * peek,
              bottom: 0,
              width: size,
              height: size,
              borderRadius: '4px',
              objectFit: 'cover',
              border: '1.5px solid white',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              zIndex: stack.length - i,
            }}
          />
        );
      })}
    </Box>
  );
}
