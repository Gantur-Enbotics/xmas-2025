'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

interface SnowflakesProps {
  count?: number;
}

export default function Snowflakes({ count = 12 }: SnowflakesProps) {
  const [mounted, setMounted] = useState(false);

  // Only mount on client side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate snowflake data only after mounting
  const snowflakes = useMemo(() => {
    if (!mounted) return [];
    
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      // Use percentage for horizontal position
      left: Math.random() * 100,
      // Random animation delay
      delay: Math.random() * 5,
      // Random duration for varied speeds
      duration: 8 + Math.random() * 7,
      // Random horizontal drift
      drift: -10 + Math.random() * 20,
      // Random size
      size: 1 + Math.random() * 1.5,
    }));
  }, [count, mounted]);

  // Don't render on server to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute"
          style={{
            left: `${flake.left}%`,
            fontSize: `${flake.size}rem`,
          }}
          initial={{ 
            y: '-10%',
            x: 0,
            opacity: 0,
          }}
          animate={{
            y: '110vh',
            x: flake.drift,
            opacity: [0, 1, 1, 0],
            rotate: 360,
          }}
          transition={{
            duration: flake.duration,
            repeat: Infinity,
            delay: flake.delay,
            ease: 'linear',
          }}
        >
          ❄️
        </motion.div>
      ))}
    </div>
  );
}