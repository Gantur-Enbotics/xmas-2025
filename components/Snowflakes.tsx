'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SnowflakesProps {
  count?: number;
}

export default function Snowflakes({ count = 15 }: SnowflakesProps) {
  const [mounted, setMounted] = useState(false);
  const [snowflakes, setSnowflakes] = useState<Array<{ id: number; initialX: number; delay: number }>>([]);

  useEffect(() => {
    setMounted(true);
    // Generate snowflake positions only on client
    setSnowflakes(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        initialX: Math.random() * window.innerWidth,
        delay: Math.random() * 5,
      }))
    );
  }, [count]);

  if (!mounted) {
    return null; // Don't render on server
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          initial={{ y: -20, x: flake.initialX }}
          animate={{
            y: window.innerHeight + 20,
            x: flake.initialX + Math.random() * 100 - 50,
            rotate: 360,
          }}
          transition={{
            duration: 10 + Math.random() * 5,
            repeat: Infinity,
            ease: 'linear',
            delay: flake.delay,
          }}
          className="absolute text-2xl opacity-60"
        >
          ❄️
        </motion.div>
      ))}
    </div>
  );
}