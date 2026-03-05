import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function AnimatedNumber({ value, className, style }: AnimatedNumberProps) {
  const spring = useSpring(value, { damping: 20, stiffness: 100 });
  const display = useTransform(spring, (current) => Math.round(current));
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    spring.set(value);
    const unsubscribe = display.on('change', (latest) => {
      setDisplayValue(latest);
    });
    return unsubscribe;
  }, [value, spring, display]);

  return (
    <span className={className} style={style}>
      {displayValue}
    </span>
  );
}
